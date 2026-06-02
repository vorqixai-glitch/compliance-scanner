/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as crypto from 'crypto';

const JWT_SECRET = process.env.APP_SECRET || 'white-tail-default-app-secret-is-secure-and-robust';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, originalHash] = stored.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  } catch {
    return false;
  }
}

export function signToken(payload: { userId: number; email: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const sHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const sPayload = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 })).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(`${sHeader}.${sPayload}`);
  const signature = hmac.digest('base64url');
  
  return `${sHeader}.${sPayload}.${signature}`;
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const [sHeader, sPayload, signature] = token.split('.');
    if (!sHeader || !sPayload || !signature) return null;
    
    const hmac = crypto.createHmac('sha256', JWT_SECRET);
    hmac.update(`${sHeader}.${sPayload}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    const payloadStr = Buffer.from(sPayload, 'base64url').toString('utf8');
    const decoded = JSON.parse(payloadStr);
    
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
      return null; // Expired
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch {
    return null;
  }
}
