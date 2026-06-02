/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create a custom Context to notify subscribers of mutations (for instant refetching)
type RefreshContextType = {
  triggerRefresh: (key: string) => void;
  subscribe: (key: string, callback: () => void) => () => void;
};

const RefreshContext = createContext<RefreshContextType>({
  triggerRefresh: () => {},
  subscribe: () => () => {}
});

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscribers] = useState<Map<string, Set<() => void>>>(new Map());

  const triggerRefresh = useCallback((key: string) => {
    // Exact match
    if (subscribers.has(key)) {
      subscribers.get(key)?.forEach(cb => cb());
    }
    // Also trigger broader updates if key starts with a domain prefix
    const domain = key.split('.')[0];
    if (domain && domain !== key && subscribers.has(domain)) {
      subscribers.get(domain)?.forEach(cb => cb());
    }
  }, [subscribers]);

  const subscribe = useCallback((key: string, callback: () => void) => {
    if (!subscribers.has(key)) {
      subscribers.set(key, new Set());
    }
    subscribers.get(key)!.add(callback);
    return () => {
      subscribers.get(key)?.delete(callback);
    };
  }, [subscribers]);

  return (
    <RefreshContext.Provider value={{ triggerRefresh, subscribe }}>
      {children}
    </RefreshContext.Provider>
  );
};

import { auth } from '../firebase';

// Generic Client fetch helper
async function apiFetch(path: string, options: RequestInit = {}) {
  let token = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn("Could not fetch Firebase token", e);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Hook builders
function createUseQuery<T>(path: string, key: string, argTransformer?: (args: any) => string) {
  return function(args?: any) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<any>(null);
    const { subscribe } = useContext(RefreshContext);

    const actualPath = argTransformer && args ? `${path}/${argTransformer(args)}` : path;

    const fetchData = useCallback(() => {
      setIsLoading(true);
      apiFetch(actualPath)
        .then(res => {
          setData(res);
          setIsError(false);
          setError(null);
        })
        .catch(err => {
          console.error(`Query failed for pathname ${actualPath}:`, err);
          setIsError(true);
          setError(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, [actualPath]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    useEffect(() => {
      return subscribe(key, () => {
        fetchData();
      });
    }, [subscribe, key, fetchData]);

    return {
      data,
      isLoading,
      isError,
      error,
      refetch: fetchData
    };
  };
}

function createUseMutation<TIn, TOut>(path: string, keyToRefresh: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') {
  return function() {
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<any>(null);
    const { triggerRefresh } = useContext(RefreshContext);

    const mutateAsync = async (variables?: TIn, urlParam?: string | number): Promise<TOut> => {
      setIsPending(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);

      const targetPath = urlParam !== undefined ? `${path}/${urlParam}` : path;

      try {
        const response = await apiFetch(targetPath, {
          method,
          body: variables ? JSON.stringify(variables) : undefined
        });
        setIsSuccess(true);
        triggerRefresh(keyToRefresh);
        return response as TOut;
      } catch (err: any) {
        setIsError(true);
        setError(err);
        throw err;
      } finally {
        setIsPending(false);
      }
    };

    return {
      mutateAsync,
      isPending,
      isSuccess,
      isError,
      error
    };
  };
}

// Complete Type Safe tRPC representation matching the specification registry
export const trpc = {
  auth: {
    register: {
      useMutation: () => createUseMutation<any, any>('/api/auth/register', 'auth.me')()
    },
    login: {
      useMutation: () => createUseMutation<any, any>('/api/auth/login', 'auth.me')()
    },
    me: {
      useQuery: () => createUseQuery<any>('/api/auth/me', 'auth.me')()
    }
  },
  dashboard: {
    stats: {
      useQuery: () => createUseQuery<any>('/api/dashboard/stats', 'dashboard')()
    }
  },
  licensing: {
    statesList: {
      useQuery: () => createUseQuery<any[]>('/api/licensing/states-list', 'licensing.states')()
    },
    stateRequirements: {
      useQuery: (args: { stateCode: string }) => 
        createUseQuery<any[]>(`/api/licensing/state-requirements`, 'licensing.requirements', (a) => a.stateCode)({ stateCode: args?.stateCode })
    },
    list: {
      useQuery: () => createUseQuery<any[]>('/api/licensing/list', 'licensing.list')()
    },
    create: {
      useMutation: () => createUseMutation<any, any>('/api/licensing/create', 'licensing.list', 'POST')()
    },
    update: {
      useMutation: () => createUseMutation<any, any>('/api/licensing/update', 'licensing.list', 'PUT')()
    }
  },
  residents: {
    list: {
      useQuery: () => createUseQuery<any[]>('/api/residents', 'residents')()
    },
    create: {
      useMutation: () => createUseMutation<any, any>('/api/residents', 'residents', 'POST')()
    },
    update: {
      useMutation: () => createUseMutation<any, any>('/api/residents', 'residents', 'PUT')()
    },
    delete: {
      useMutation: () => createUseMutation<any, any>('/api/residents', 'residents', 'DELETE')()
    }
  },
  documents: {
    list: {
      useQuery: () => createUseQuery<any[]>('/api/documents', 'documents')()
    },
    create: {
      useMutation: () => createUseMutation<any, any>('/api/documents', 'documents', 'POST')()
    },
    update: {
      useMutation: () => createUseMutation<any, any>('/api/documents', 'documents', 'PUT')()
    },
    delete: {
      useMutation: () => createUseMutation<any, any>('/api/documents', 'documents', 'DELETE')()
    }
  },
  compliance: {
    list: {
      useQuery: () => createUseQuery<any[]>('/api/compliance', 'compliance')()
    },
    create: {
      useMutation: () => createUseMutation<any, any>('/api/compliance', 'compliance', 'POST')()
    },
    update: {
      useMutation: () => createUseMutation<any, any>('/api/compliance', 'compliance', 'PUT')()
    },
    delete: {
      useMutation: () => createUseMutation<any, any>('/api/compliance', 'compliance', 'DELETE')()
    }
  },
  consulting: {
    list: {
      useQuery: () => createUseQuery<any[]>('/api/consulting', 'consulting')()
    },
    create: {
      useMutation: () => createUseMutation<any, any>('/api/consulting', 'consulting', 'POST')()
    }
  },
  org: {
    myOrg: {
      useQuery: () => createUseQuery<any>('/api/org/my', 'org')()
    },
    my: {
      useQuery: () => createUseQuery<any>('/api/org/my', 'org')() // compatibility alias
    },
    update: {
      useMutation: () => createUseMutation<any, any>('/api/org/update', 'org', 'PUT')()
    }
  }
};
