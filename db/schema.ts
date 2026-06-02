/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// White Tail Solutions Schema Definitions

export interface LocalUser {
  id: number;
  email: string;
  passwordHash: string;
  name: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  ownerId: number; // local_users.id references
  localOwnerId: number; // same
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  licenseNumber: string | null;
  licenseStatus: 'active' | 'pending' | 'expired' | 'none';
  licenseExpiry: string | null;
  narLevel: 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'none';
  beds: number;
  subscriptionTier: 'doe_eyes' | 'white_tail_alpha' | 'herd_leader';
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: number;
  orgId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  intakeDate: string;
  dischargeDate: string | null;
  status: 'active' | 'inactive' | 'graduated' | 'violated';
  emergencyContact: string | null;
  emergencyPhone: string | null;
  roomNumber: string | null;
  backgroundCheckStatus: 'pending' | 'passed' | 'failed' | 'not_required';
  drugTestStatus: 'pending' | 'passed' | 'failed' | 'scheduled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseApplication {
  id: number;
  orgId: number;
  state: string;
  stateCode: string;
  licenseType: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'denied' | 'pending_review' | 'renewal_needed';
  submissionDate: string | null;
  approvalDate: string | null;
  expiryDate: string | null;
  progress: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: number;
  orgId: number;
  title: string;
  category: 'resident_agreement' | 'house_rules' | 'drug_testing' | 'emergency_plan' | 'financial_policy' | 'other';
  docType: 'template' | 'generated';
  content: string | null;
  signed: 'no' | 'yes';
  signedAt: string | null;
  signedBy: string | null;
  version: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceItem {
  id: number;
  orgId: number;
  title: string;
  category: 'licensing' | 'documentation' | 'facility' | 'staffing' | 'resident_care' | 'reporting';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: string | null;
  completedAt: string | null;
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultingBooking {
  id: number;
  orgId: number;
  userId: number;
  topic: string;
  description: string | null;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StateRequirement {
  id: number;
  state: string;
  stateCode: string;
  licenseType: string;
  requirement: string;
  description: string | null;
  category: 'application' | 'facility' | 'staffing' | 'documentation' | 'financial' | 'inspection';
  createdAt: string;
}

export interface Activity {
  id: number;
  orgId: number;
  userId: number | null;
  localUserId: number | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  createdAt: string;
}

// Global Database Schema state
export interface DatabaseState {
  users: LocalUser[];
  organizations: Organization[];
  residents: Resident[];
  license_applications: LicenseApplication[];
  documents: Document[];
  compliance_items: ComplianceItem[];
  consulting_bookings: ConsultingBooking[];
  state_requirements: StateRequirement[];
  activities: Activity[];
}
