/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { DBStore } from './db/store';
import { hashPassword, verifyPassword, signToken, verifyToken } from './db/auth';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize store and fetch state
const store = DBStore.getInstance();

// Setup Gemini client
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: any = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API initialized successfully.');
  } catch (err) {
    console.warn('Could not initialize Gemini Client:', err);
  }
} else {
  console.log('Using simulated intelligence responder for local preview.');
}

// Token validation middleware
export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.substring(7);

  try {
    const sPayload = token.split('.')[1];
    if (sPayload) {
      const payloadStr = Buffer.from(sPayload, 'base64').toString('utf8');
      const decodedFb = JSON.parse(payloadStr);
      if (decodedFb.user_id) {
        // Create a stable positive integer from Firebase UID
        let hashId = 0;
        for (let i = 0; i < decodedFb.user_id.length; i++) {
          hashId = Math.imul(31, hashId) + decodedFb.user_id.charCodeAt(i) | 0;
        }
        req.user = { 
          userId: Math.abs(hashId) || 1, 
          email: decodedFb.email || 'operator@soberliving.com' 
        };
        
        // Ensure user exists in our local simulated DB
        const db = store.getState();
        if (!db.users.find(u => u.id === req.user!.userId)) {
          store.writeState(dbState => {
            dbState.users.push({
              id: req.user!.userId,
              email: req.user!.email,
              name: decodedFb.name || 'Operator',
              passwordHash: 'firebase-user',
              role: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
        }
        return next();
      }
    }
  } catch (e) {
    // Ignore and fallback
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
  req.user = decoded;
  next();
};

// Helper to auto-create and get org for a local owner
const getOrCreateUserOrg = (userId: number) => {
  const db = store.getState();
  let org = db.organizations.find(o => o.localOwnerId === userId);
  
  if (!org) {
    // Generate default org
    const user = db.users.find(u => u.id === userId);
    const orgName = user && user.name ? `${user.name}'s Sober Home` : "Sober Home Operator Dashboard";
    const newOrgId = db.organizations.length > 0 ? Math.max(...db.organizations.map(o => o.id)) + 1 : 1;
    
    org = {
      id: newOrgId,
      name: orgName,
      slug: `org-${userId}-${Date.now().toString().slice(-4)}`,
      ownerId: userId,
      localOwnerId: userId,
      address: '100 Recovery Way',
      city: 'Pittsburgh',
      state: 'PA',
      zip: '15212',
      phone: '412-555-0199',
      website: 'https://whitetailsolutions.com',
      licenseNumber: 'PA-DDAP-9921',
      licenseStatus: 'active',
      licenseExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
      narLevel: 'level_2',
      beds: 12,
      subscriptionTier: 'white_tail_alpha',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    store.writeState(dbState => {
      dbState.organizations.push(org!);
    });
  }
  return org;
};

// Log generic activity helper
const logActivity = (orgId: number, userId: number, action: string, type: string, id: number, details: string) => {
  store.writeState(dbState => {
    const actId = dbState.activities.length > 0 ? Math.max(...dbState.activities.map(a => a.id)) + 1 : 1;
    dbState.activities.unshift({
      id: actId,
      orgId,
      userId,
      localUserId: userId,
      action,
      entityType: type,
      entityId: id,
      details,
      createdAt: new Date().toISOString()
    });
    // Cap log at 100
    if (dbState.activities.length > 100) {
      dbState.activities.pop();
    }
  });
};

/* ================= AUTH API ================= */

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = store.getState();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Account already exists under this email' });
  }

  const nextId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const hash = hashPassword(password);
  
  const newUser = {
    id: nextId,
    email: email.toLowerCase(),
    passwordHash: hash,
    name: name || null,
    role: ('user' as const),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.writeState(dbState => {
    dbState.users.push(newUser);
  });

  const token = signToken({ userId: newUser.id, email: newUser.email });
  
  // Seed initial org and basic checklist elements for new user
  const org = getOrCreateUserOrg(newUser.id);
  
  // Seed sample resident
  store.writeState(dbState => {
    const resId = dbState.residents.length > 0 ? Math.max(...dbState.residents.map(r => r.id)) + 1 : 1;
    dbState.residents.push({
      id: resId,
      orgId: org.id,
      firstName: 'James',
      lastName: 'Miller',
      email: 'james.m@recovery.org',
      phone: '412-555-0144',
      dateOfBirth: '1988-04-12',
      intakeDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      dischargeDate: null,
      status: 'active',
      emergencyContact: 'Sarah Miller',
      emergencyPhone: '412-555-0155',
      roomNumber: 'A-2',
      backgroundCheckStatus: 'passed',
      drugTestStatus: 'passed',
      notes: 'Actively participating in house meetings and pursuing group counseling.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Seed compliance items
    const compId1 = dbState.compliance_items.length > 0 ? Math.max(...dbState.compliance_items.map(c => c.id)) + 1 : 1;
    dbState.compliance_items.push({
      id: compId1,
      orgId: org.id,
      title: 'Post Resident Bill of Rights Poster',
      category: 'licensing',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      priority: 'high',
      notes: 'Must be clearly displayed in the primary hallway or entrance.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, {
      id: compId1 + 1,
      orgId: org.id,
      title: 'Contract annual fire marshall inspection',
      category: 'facility',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      priority: 'medium',
      notes: 'Verify fire hydrants, detectors, and extinguisher seals.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  logActivity(org.id, newUser.id, 'Register Account', 'user', newUser.id, `Created sober living operator account for ${newUser.email}`);

  return res.json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = store.getState();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  const token = signToken({ userId: user.id, email: user.email });
  const org = getOrCreateUserOrg(user.id);
  
  logActivity(org.id, user.id, 'Login Success', 'user', user.id, `Logged in successfully from workspace`);

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
  const db = store.getState();
  const user = db.users.find(u => u.id === req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User session not found' });
  }
  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

/* ================= ORG API ================= */

app.get('/api/org/my', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  return res.json(org);
});

app.put('/api/org/update', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const updates = req.body;

  store.writeState(dbState => {
    const idx = dbState.organizations.findIndex(o => o.id === org.id);
    if (idx !== -1) {
      dbState.organizations[idx] = {
        ...dbState.organizations[idx],
        ...updates,
        id: org.id, // Immutable core identifiers
        localOwnerId: org.localOwnerId,
        ownerId: org.ownerId,
        updatedAt: new Date().toISOString()
      };
    }
  });

  const updatedOrg = store.getState().organizations.find(o => o.id === org.id);
  logActivity(org.id, req.user!.userId, 'Update Organization', 'organization', org.id, 'Edited operator profile values');
  return res.json(updatedOrg);
});

/* ================= DASHBOARD API ================= */

app.get('/api/dashboard/stats', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const db = store.getState();

  const orgResidents = db.residents.filter(r => r.orgId === org.id);
  const activeResidentsCount = orgResidents.filter(r => r.status === 'active').length;
  
  const orgApplications = db.license_applications.filter(l => l.orgId === org.id);
  const activeApplicationsCount = orgApplications.filter(l => l.status !== 'approved' && l.status !== 'denied').length;

  const orgCompliance = db.compliance_items.filter(c => c.orgId === org.id);
  const completedCompliance = orgCompliance.filter(c => c.status === 'completed').length;
  const totalCompliance = orgCompliance.length;
  const complianceHealth = totalCompliance > 0 ? Math.round((completedCompliance / totalCompliance) * 100) : 100;

  const orgDocuments = db.documents.filter(d => d.orgId === org.id);
  const totalDocuments = orgDocuments.length;

  const upcomingItems = orgCompliance
    .filter(c => c.status !== 'completed')
    .sort((a,b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  const bookings = db.consulting_bookings.filter(b => b.orgId === org.id).slice(0, 3);
  const recentActivities = db.activities.filter(a => a.orgId === org.id).slice(0, 8);

  return res.json({
    kpis: {
      activeResidents: activeResidentsCount,
      licensingApps: activeApplicationsCount,
      complianceHealth,
      totalDocuments
    },
    upcomingItems,
    bookings,
    activities: recentActivities,
    org
  });
});

/* ================= STATE REQUIREMENTS REFERENCE ================= */

app.get('/api/licensing/states-list', (req, res) => {
  const db = store.getState();
  const states = Array.from(new Set(db.state_requirements.map(s => s.state)))
    .map(stateName => {
      const match = db.state_requirements.find(sr => sr.state === stateName);
      return {
        state: stateName,
        stateCode: match?.stateCode || '',
        licenseType: match?.licenseType || '',
        count: db.state_requirements.filter(sr => sr.state === stateName).length
      };
    });
  return res.json(states);
});

app.get('/api/licensing/state-requirements/:stateCode', (req, res) => {
  const { stateCode } = req.params;
  const db = store.getState();
  const reqs = db.state_requirements.filter(sr => sr.stateCode.toUpperCase() === stateCode.toUpperCase());
  return res.json(reqs);
});

/* ================= LICENSE APPLICATIONS API ================= */

app.get('/api/licensing/list', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const db = store.getState();
  let list = db.license_applications.filter(l => l.orgId === org.id);
  
  if (list.length === 0) {
    const mockApps = [
      {
        id: db.license_applications.length > 0 ? Math.max(...db.license_applications.map(l => l.id)) + 1 : 1,
        orgId: org.id,
        state: 'Pennsylvania',
        stateCode: 'PA',
        licenseType: 'DDAP Conditional Sober Home License',
        status: 'approved' as const,
        submissionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        approvalDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // ~4 months from now
        progress: 100,
        notes: 'Main residential wing compliant with Pennsylvania DDAP requirements and staffing ratios.',
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: db.license_applications.length > 0 ? Math.max(...db.license_applications.map(l => l.id)) + 2 : 2,
        orgId: org.id,
        state: 'Florida',
        stateCode: 'FL',
        licenseType: 'FARR Level 2 Certification',
        status: 'approved' as const,
        submissionDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        approvalDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // expires in 45 days (caution warning)
        progress: 100,
        notes: 'Annual FARR fire safety and lockbox medication storage inspection cleared.',
        createdAt: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: db.license_applications.length > 0 ? Math.max(...db.license_applications.map(l => l.id)) + 3 : 3,
        orgId: org.id,
        state: 'California',
        stateCode: 'CA',
        licenseType: 'DHCS Sober House Accreditation',
        status: 'approved' as const,
        submissionDate: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
        approvalDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 290 * 24 * 60 * 60 * 1000).toISOString(), // expires in ~9.5 months
        progress: 100,
        notes: 'NARR-equivalent standards certified for peer-led resident care wing.',
        createdAt: new Date(Date.now() - 260 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: db.license_applications.length > 0 ? Math.max(...db.license_applications.map(l => l.id)) + 4 : 4,
        orgId: org.id,
        state: 'Arizona',
        stateCode: 'AZ',
        licenseType: 'AZDHS Sober Home License',
        status: 'submitted' as const,
        submissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        approvalDate: null,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // expires/renews in 6 months
        progress: 80,
        notes: 'Background scans and local municipal zoning notification submitted to AZDHS.',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    store.writeState(dbState => {
      dbState.license_applications.push(...mockApps);
    });

    list = db.license_applications.filter(l => l.orgId === org.id);
  }
  return res.json(list);
});

app.post('/api/licensing/create', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { state, stateCode, licenseType, status, progress, notes, expiryDate } = req.body;
  if (!state || !stateCode) {
    return res.status(400).json({ error: 'State and State Code are required' });
  }

  const db = store.getState();
  const nextId = db.license_applications.length > 0 ? Math.max(...db.license_applications.map(l => l.id)) + 1 : 1;
  
  // Set default expiryDate if status is approved and no expiryDate is entered
  let calculatedExpiry = expiryDate || null;
  if (status === 'approved' && !calculatedExpiry) {
    calculatedExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  } else if (status === 'submitted' && !calculatedExpiry) {
    calculatedExpiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // anticipated timeline
  }

  const newApp = {
    id: nextId,
    orgId: org.id,
    state,
    stateCode,
    licenseType: licenseType || 'Sober Home Certification',
    status: status || 'draft',
    submissionDate: status === 'submitted' ? new Date().toISOString() : null,
    approvalDate: status === 'approved' ? new Date().toISOString() : null,
    expiryDate: calculatedExpiry,
    progress: progress || 0,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.writeState(dbState => {
    dbState.license_applications.push(newApp);

    // Auto-create compliance items corresponding to requirements for this state to enrich UX
    const stateReqs = dbState.state_requirements.filter(sr => sr.stateCode.toUpperCase() === stateCode.toUpperCase());
    stateReqs.forEach((sr, index) => {
      const compId = dbState.compliance_items.length > 0 ? Math.max(...dbState.compliance_items.map(c => c.id)) + 1 : 1;
      dbState.compliance_items.push({
        id: compId,
        orgId: org.id,
        title: `[${stateCode}] ${sr.requirement}`,
        category: 'licensing',
        status: 'pending',
        dueDate: new Date(Date.now() + (7 + index * 5) * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        priority: index === 0 ? 'high' : 'medium',
        notes: sr.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });

  logActivity(org.id, req.user!.userId, 'Create License Application', 'license_application', nextId, `Started new ${licenseType} application process for ${state}`);
  return res.json(newApp);
});

app.put('/api/licensing/update/:id', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { id } = req.params;
  const updates = req.body;

  const db = store.getState();
  const appIdx = db.license_applications.findIndex(l => l.id === Number(id) && l.orgId === org.id);
  if (appIdx === -1) {
    return res.status(404).json({ error: 'License application not found' });
  }

  store.writeState(dbState => {
    const original = dbState.license_applications[appIdx];
    dbState.license_applications[appIdx] = {
      ...original,
      ...updates,
      id: original.id,
      orgId: org.id,
      updatedAt: new Date().toISOString()
    };
  });

  const updatedApp = store.getState().license_applications.find(l => l.id === Number(id));
  logActivity(org.id, req.user!.userId, 'Update License Application', 'license_application', Number(id), `Updated certification status code to ${updates.status || 'modified'}`);
  return res.json(updatedApp);
});

/* ================= RESIDENTS CRUD ================= */

app.get('/api/residents', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const db = store.getState();
  const list = db.residents.filter(r => r.orgId === org.id);
  return res.json(list);
});

app.post('/api/residents', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { firstName, lastName, email, phone, dateOfBirth, intakeDate, roomNumber, emergencyContact, emergencyPhone, notes } = req.body;
  
  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'First and last name are required' });
  }

  const db = store.getState();
  const nextId = db.residents.length > 0 ? Math.max(...db.residents.map(r => r.id)) + 1 : 1;
  const newResident = {
    id: nextId,
    orgId: org.id,
    firstName,
    lastName,
    email: email || null,
    phone: phone || null,
    dateOfBirth: dateOfBirth || null,
    intakeDate: intakeDate || new Date().toISOString(),
    dischargeDate: null,
    status: ('active' as const),
    emergencyContact: emergencyContact || null,
    emergencyPhone: emergencyPhone || null,
    roomNumber: roomNumber || null,
    backgroundCheckStatus: ('pending' as const),
    drugTestStatus: ('pending' as const),
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.writeState(dbState => {
    dbState.residents.push(newResident);
  });

  logActivity(org.id, req.user!.userId, 'Admitted Resident', 'resident', nextId, `Checked-in resident ${firstName} ${lastName} into Room ${roomNumber || 'unassigned'}`);
  return res.json(newResident);
});

app.put('/api/residents/:id', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { id } = req.params;
  const updates = req.body;

  const db = store.getState();
  const idx = db.residents.findIndex(r => r.id === Number(id) && r.orgId === org.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Resident file not found' });
  }

  store.writeState(dbState => {
    const original = dbState.residents[idx];
    dbState.residents[idx] = {
      ...original,
      ...updates,
      id: original.id,
      orgId: org.id,
      updatedAt: new Date().toISOString()
    };
  });

  const updatedResident = store.getState().residents.find(r => r.id === Number(id));
  logActivity(org.id, req.user!.userId, 'Update Resident', 'resident', Number(id), `Modified health, status, or screening parameter logs for ${updatedResident?.firstName} ${updatedResident?.lastName}`);
  return res.json(updatedResident);
});

app.delete('/api/residents/:id', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { id } = req.params;

  const db = store.getState();
  const resident = db.residents.find(r => r.id === Number(id) && r.orgId === org.id);
  if (!resident) {
    return res.status(404).json({ error: 'Resident not found' });
  }

  store.writeState(dbState => {
    dbState.residents = dbState.residents.filter(r => !(r.id === Number(id) && r.orgId === org.id));
  });

  logActivity(org.id, req.user!.userId, 'Archive Resident', 'resident', Number(id), `Discharged/removed general record sheet of ${resident.firstName} ${resident.lastName}`);
  return res.json({ success: true });
});

/* ================= DOCUMENTS API ================= */

app.get('/api/documents', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const db = store.getState();
  
  // Seed sample templates if org has no documents whatsoever to ensure instant UX viability
  let orgDocs = db.documents.filter(d => d.orgId === org.id);
  if (orgDocs.length === 0) {
    const tTemplates = [
      {
        title: "Resident Admission Agreement",
        category: "resident_agreement" as const,
        content: `### SOBER LIVING HOUSING AGREEMENT

This Agreement is made between White Tail Solutions Operator and the Resident. 

1. **Safety Standards**: The House is an alcohol-and-drug-free environment. Possession or use of alcohol or unauthorized substances yields immediate clinical referral or relocation.
2. **Community Conduct**: Resident agrees to maintain personal hygiene, satisfy house chores, and support their recovery peers.
3. **In-house curfew**: Curfew is strictly 10:00 PM Sunday through Thursday, and 11:30 PM Friday and Saturday.

By signing, Resident agrees to complete physical conditions and code guidelines.`,
        docType: "template" as const
      },
      {
        title: "House Rules & Guidelines",
        category: "house_rules" as const,
        content: `### HOUSE CODE OF ETHICS AND COMMUNITY PROTOCOL

1. Personal responsibility is the fundamental key of sober reintegration.
2. Attend three (3) active recovery meetings weekly (12-step, SMART, Refuge Recovery).
3. Quiet periods start at 10:00 PM and terminate at 7:00 AM daily. No loud visual/audio players.
4. Weekly house governance meeting attendance is mandatory.
5. All visitors require 24-hour management clearance and exit before 9:00 PM. No sleepovers.`,
        docType: "template" as const
      },
      {
        title: "Drug Testing Protocol",
        category: "drug_testing" as const,
        content: `### TOXICOLOGICAL URINALYSIS ETHICAL MANDATE

1. Random drug tests and screens are initiated on administrative notice.
2. Refusing or diluting a specimen is considered an presumptive positive relapse.
3. Relapses are managed with therapeutic safety transfers rather than punitive police measures.`,
        docType: "template" as const
      }
    ];

    store.writeState(dbState => {
      tTemplates.forEach((t, index) => {
        const docId = dbState.documents.length > 0 ? Math.max(...dbState.documents.map(d => d.id)) + 1 : 1;
        dbState.documents.push({
          id: docId,
          orgId: org.id,
          title: t.title,
          category: t.category,
          docType: t.docType,
          content: t.content,
          signed: 'no',
          signedAt: null,
          signedBy: null,
          version: 1,
          parentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    });
    
    orgDocs = store.getState().documents.filter(d => d.orgId === org.id);
  }

  return res.json(orgDocs);
});

app.post('/api/documents', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { title, category, content, docType, parentId } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and Category are required' });
  }

  const db = store.getState();
  const nextId = db.documents.length > 0 ? Math.max(...db.documents.map(d => d.id)) + 1 : 1;
  const newDoc = {
    id: nextId,
    orgId: org.id,
    title,
    category,
    docType: docType || 'generated',
    content: content || '',
    signed: ('no' as const),
    signedAt: null,
    signedBy: null,
    version: 1,
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.writeState(dbState => {
    dbState.documents.push(newDoc);
  });

  logActivity(org.id, req.user!.userId, 'Create Document', 'document', nextId, `Created document file: ${title}`);
  return res.json(newDoc);
});

app.put('/api/documents/:id', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { id } = req.params;
  const updates = req.body;

  const db = store.getState();
  const idx = db.documents.findIndex(d => d.id === Number(id) && d.orgId === org.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  store.writeState(dbState => {
    const original = dbState.documents[idx];
    dbState.documents[idx] = {
      ...original,
      ...updates,
      id: original.id,
      orgId: org.id,
      updatedAt: new Date().toISOString()
    };
  });

  const updatedDoc = store.getState().documents.find(d => d.id === Number(id));
  
  if (updates.signed === 'yes') {
    logActivity(org.id, req.user!.userId, 'Sign Document', 'document', Number(id), `E-signed agreement: ${updatedDoc?.title} by ${updates.signedBy || 'Operator'}`);
  } else {
    logActivity(org.id, req.user!.userId, 'Update Document', 'document', Number(id), `Modified document parameters for: ${updatedDoc?.title}`);
  }

  return res.json(updatedDoc);
});

app.delete('/api/documents/:id', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { id } = req.params;

  const db = store.getState();
  const doc = db.documents.find(d => d.id === Number(id) && d.orgId === org.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  store.writeState(dbState => {
    dbState.documents = dbState.documents.filter(d => !(d.id === Number(id) && d.orgId === org.id));
  });

  logActivity(org.id, req.user!.userId, 'Archive Document', 'document', Number(id), `Deleted doc ledger item: ${doc.title}`);
  return res.json({ success: true });
});

/* ================= COMPLIANCE API ================= */

app.get('/api/compliance', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const db = store.getState();
  const list = db.compliance_items.filter(c => c.orgId === org.id);
  return res.json(list);
});

app.post('/api/compliance', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { title, category, priority, dueDate, notes } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and Category are required' });
  }

  const db = store.getState();
  const nextId = db.compliance_items.length > 0 ? Math.max(...db.compliance_items.map(c => c.id)) + 1 : 1;
  const newItem = {
    id: nextId,
    orgId: org.id,
    title,
    category,
    status: ('pending' as const),
    dueDate: dueDate || null,
    completedAt: null,
    priority: priority || 'medium',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.writeState(dbState => {
    dbState.compliance_items.push(newItem);
  });

  logActivity(org.id, req.user!.userId, 'Create Compliance', 'compliance_item', nextId, `Enqueued manual compliance task: ${title}`);
  return res.json(newItem);
});

app.put('/api/compliance/:id', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { id } = req.params;
  const updates = req.body;

  const db = store.getState();
  const idx = db.compliance_items.findIndex(c => c.id === Number(id) && c.orgId === org.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Compliance tracking item not found' });
  }

  store.writeState(dbState => {
    const original = dbState.compliance_items[idx];
    const completedAt = updates.status === 'completed' ? new Date().toISOString() : null;
    dbState.compliance_items[idx] = {
      ...original,
      ...updates,
      completedAt: updates.status === 'completed' ? completedAt : original.completedAt,
      id: original.id,
      orgId: org.id,
      updatedAt: new Date().toISOString()
    };
  });

  const updatedItem = store.getState().compliance_items.find(c => c.id === Number(id));
  
  if (updates.status === 'completed') {
    logActivity(org.id, req.user!.userId, 'Complete Compliance Task', 'compliance_item', Number(id), `Logged compliance task completed: ${updatedItem?.title}`);
  } else {
    logActivity(org.id, req.user!.userId, 'Update Compliance Task', 'compliance_item', Number(id), `Modified compliance tracker params for: ${updatedItem?.title}`);
  }

  return res.json(updatedItem);
});

app.delete('/api/compliance/:id', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { id } = req.params;

  const db = store.getState();
  const item = db.compliance_items.find(c => c.id === Number(id) && c.orgId === org.id);
  if (!item) {
    return res.status(404).json({ error: 'Compliance item not found' });
  }

  store.writeState(dbState => {
    dbState.compliance_items = dbState.compliance_items.filter(c => !(c.id === Number(id) && c.orgId === org.id));
  });

  logActivity(org.id, req.user!.userId, 'Archive Compliance Item', 'compliance_item', Number(id), `Deleted compliance record item: ${item.title}`);
  return res.json({ success: true });
});

/* ================= CONSULTING API ================= */

app.get('/api/consulting', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const db = store.getState();
  const list = db.consulting_bookings.filter(b => b.orgId === org.id);
  return res.json(list);
});

app.post('/api/consulting', requireAuth, (req: AuthRequest, res) => {
  const org = getOrCreateUserOrg(req.user!.userId);
  const { topic, description, scheduledAt, duration } = req.body;
  if (!topic || !scheduledAt) {
    return res.status(400).json({ error: 'Topic and Date/Time are required' });
  }

  const db = store.getState();
  const nextId = db.consulting_bookings.length > 0 ? Math.max(...db.consulting_bookings.map(b => b.id)) + 1 : 1;
  const newBooking = {
    id: nextId,
    orgId: org.id,
    userId: req.user!.userId,
    topic,
    description: description || '',
    scheduledAt,
    duration: duration || 60,
    status: ('pending' as const),
    notes: 'Assigning a Sober Living specialist. Meeting link will deploy 2 hours prior.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.writeState(dbState => {
    dbState.consulting_bookings.push(newBooking);
  });

  logActivity(org.id, req.user!.userId, 'Request Consulting Meeting', 'consulting_booking', nextId, `Requested consulting appointment on ${topic}`);
  return res.json(newBooking);
});

/* ================= AI CHAT COMPLIANCE ENDPOINT ================= */

app.post('/api/ai-assistant/chat', requireAuth, async (req: AuthRequest, res) => {
  let userText = '';
  
  if (typeof req.body.message === 'string' && req.body.message) {
    userText = req.body.message;
  } else if (Array.isArray(req.body.messages)) {
    const lastMessage = req.body.messages[req.body.messages.length - 1];
    if (lastMessage) {
      if (typeof lastMessage === 'string') {
        userText = lastMessage;
      } else if (typeof lastMessage === 'object') {
        if (lastMessage.content) {
          userText = lastMessage.content;
        } else if (Array.isArray(lastMessage.parts) && lastMessage.parts[0]?.text) {
          userText = lastMessage.parts[0].text;
        } else if (lastMessage.text) {
          userText = lastMessage.text;
        }
      }
    }
  }

  if (!userText && typeof req.body.text === 'string') {
    userText = req.body.text;
  }

  if (!userText) {
    return res.status(400).json({ error: 'Payload missing contents parameters' });
  }

  // Check if Gemini is enabled and compile dynamic query
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userText,
        config: {
          systemInstruction: `You are a compliance consultant expert and legal assistant specialized in sober living home licensing and state rules for White Tail Solutions. 
Provide highly polished, expert legal, operational, and financial compliance advice. Match the requested style with beautiful markdown structures.
Your knowledge encompasses:
- Pennsylvania DDAP Conditional License (DDAP licensure application, physical site safety inspections, fire checks, operator rules, staff background clearance).
- Florida FARR certification (FARR manager certifications, ethical billing standards/non-brokering, random toxicology screens).
- California DHCS registration (DHCS certification, safe double-locked medication policies, fire drills, relapse action logs).
- National Alliance for Recovery Residences (NARR) Level I, II, III, IV classifications.
- OhioMHAS, Utah DOPL, Arizona DHS, Colorado BHA standards.
Always be professional, objective, clear and structured. Write in structured bulleted lists first, followed by clear checklists.`,
        },
      });

      return res.json({ text: response.text, reply: response.text });
    } catch (e: any) {
      console.error('Gemini direct API call experienced failure. Launching local mock responder:', e);
    }
  }

  // Fallback to beautiful local simulated responder
  const responseText = getMockSoberLivingResponse(userText);
  return res.json({ text: responseText, reply: responseText });
});

/* Simple, robust expert local intelligence */
function getMockSoberLivingResponse(query: string): string {
  const text = query.toLowerCase();
  
  if (text.includes('pennsylvania') || text.includes('ddap') || text.includes('pa ')) {
    return `### Pennsylvania DDAP Licensing Advisor

Pennsylvania requires formal licensure for all sober living homes offering recovery support under the **Department of Drug and Alcohol Programs (DDAP)**. To obtain a DDAP Conditional License, align your workflows with these 5 core compliance pillars:

- **1. Formal DDAP Application Submission**
  Submit your organizational charter, zoning permits, physical site drawings, and proof of legal occupancy.
- **2. Mandatory Physical Facility Inspections**
  Houses must adhere to clean ventilation, spacious double bedrooms (min 70 sq ft for singles, 120 sq ft for doubles), tested smoke detectors, and visible emergency exits.
- **3. Full Staff Clearances**
  All house managers and directors must yield **PA Criminal History (PATCH)** records and Child Abuse Clearances.
- **4. Resident Rights & Grievance Documentation**
  Provide clear resident ledgers with signed covenants outlining room fees, curfews, random drug screenings, and relapse procedures.
- **5. Commercial Insurance Coverage**
  Acquire general liability coverage ($1,000,000 / $3,000,000 limits) highlighting the PA Department of Drug and Alcohol Programs as an additional certified entity.

Would you like to auto-configure these 5 tasks inside your **Compliance Tracker**? I can generate them instantly for your operations team.`;
  }

  if (text.includes('florida') || text.includes('farr') || text.includes('fl ')) {
    return `### Florida Association of Recovery Residences (FARR) Guidelines

Florida requires sober homes to carry active **FARR Certification** to receive referrals from state-licensed rehab program providers. FARR aligns operations with the **NARR standards** across 5 distinct points:

1. **Managerial Oversight**: Require at least one certified sober house manager on duty or permanently living on the premises.
2. **Standardized Drug Toxicology**: Draft safe, structured screens. Never monetize drug lab panels (conforms with Florida's patient-brokering prevention statutes).
3. **Safety inspections**: Install working fire extinguishers, maintain fire blankets in kitchens, and perform weekly hazard checks.
4. **Ethical Business Ledger**: Offer transparent pricing, explicit refund terms, and maintain secure financial registers.
5. **Community Integration**: Implement a "Good Neighbor" plan to maintain exterior lawn aesthetics and control resident vehicle parking safely.

Let me know if you would like me to compile a **Drug Testing Protocol PDF agreement template** for your active residents!`;
  }

  if (text.includes('level') || text.includes('narr')) {
    return `### NARR Level Classifications Cheat Sheet

The **National Alliance for Recovery Residences (NARR)** classifies recovery housing configurations into 4 distinct Operational Levels:

- **Level I: Peer-Run Sober Homes**
  - *Structure*: Single-family houses with zero paid clinical staff. 100% democratic self-governance.
  - *Key Use*: Long-term transition, high responsibility.
- **Level II: Monitored recovery dwellings**
  - *Structure*: Managed houses carrying a paid on-site peer leader or house manager.
  - *Key Use*: Standard sober living. Involves random urinalysis drug screens and mandated house curfews.
- **Level III: Supervised facilities**
  - *Structure*: Formal organization. Paid professional house captains or case managers. High administrative structure.
  - *Key Use*: Early transitional discharge from residential treatment facilities.
- **Level IV: Clinical Residences**
  - *Structure*: Fully-licensed specialized clinical environments. Medical/nursing staff on duty.
  - *Key Use*: Intensive outpatient transition with embedded treatment.

Most municipal sober houses operate strictly at **Level II** or **Level III**. Ensure your staff ratios and house rules match these requirements prior to state inspections.`;
  }

  if (text.includes('california') || text.includes('dhcs')) {
    return `### California DHCS Certification Checklist

California sober homes seeking formal recognition submit applications through the **Department of Health Care Services (DHCS)**. Key checkpoints:

- **Medication Management Safeguards**
  Install secure, double-locked safety boxes for all resident prescription medications. Residents must self-administer with tracking logs.
- **Zoning and ADA Conformity**
  Check local municipal size limits (under SB 990, homes with 6 or fewer residents are classified as standard single dwellings).
- **Grievance Forms**
  Post DHCS licensing board complaints address and hotline clearly inside the common recreation office.

Would you like to draft a compliant **California House Rules & Curfew Template** using our automated Document center?`;
  }

  if (text.includes('insurance') || text.includes('financial') || text.includes('contract')) {
    return `### Sober Living Facility Insurance Standards

Sober living facilitators must secure specialty liability policies to safeguard against operational risks and comply with state registry laws (such as Florida FARR and PA DDAP):

- **General Liability**: $1,000,000 per occurrence / $3,000,000 aggregate minimums.
- **Sexual Abuse & Molestation Rider**: Standard requirement for professional group housing.
- **Professional Liability Coverage**: Essential if your managers conduct structured peer coaching or medication monitoring coordinates.
- **Property & Hazard Loss Insurance**: Essential to protect the physical residence from structural hazards.

Ensure your active insurance policy certificate explicitly details each address slot you operate.`;
  }

  return `### White Tail Solutions Compliance Intelligence

Welcome to the White Tail Solutions AI Compliance Assistant! I am pre-loaded with national sober living regulations, NARR guidance, and state licensing codes. Common paths I can assist you with:

- **Pennsylvania DDAP**: Get checklist points for PA DDAP Conditional Certification.
- **Florida FARR**: Understand house manager and ethical drug testing protocols.
- **California DHCS**: Lockbox medication rules, zoning limits, and resident agreements.
- **NARR levels (I - IV)**: Compare peer-run homes versus supervised environments.
- **Legal/Financial Standards**: Insurance configurations and patient non-brokering compliance limits.

What specific question or compliance issue can I help you resolve today?`;
}

/* ================= VITE OR STATIC MIDDLEWARE ================= */

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`White Tail Solutions Server enqueued on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failure booting Express-Vite backend:', err);
});
