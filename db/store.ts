/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { DatabaseState, StateRequirement } from './schema';

const DB_FILE_PATH = path.join(process.cwd(), 'db', 'db.json');

const INITIAL_STATE_REQUIREMENTS: StateRequirement[] = [
  // Pennsylvania (5 requirements)
  {
    id: 1,
    state: "Pennsylvania",
    stateCode: "PA",
    licenseType: "DDAP Conditional License",
    requirement: "Submit DDAP Licensure Application Form",
    description: "Submit complete application with physical facility details and ownership structure to the Department of Drug and Alcohol Programs.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 2,
    state: "Pennsylvania",
    stateCode: "PA",
    licenseType: "DDAP Conditional License",
    requirement: "Initial Inspection of Sober Home",
    description: "Satisfy physical fire, health, and space safety requirements certified by a local occupancy or building inspector.",
    category: "inspection",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 3,
    state: "Pennsylvania",
    stateCode: "PA",
    licenseType: "DDAP Conditional License",
    requirement: "Staff Clearance and Documentation",
    description: "Criminal history background checks and child abuse clearances for all directors, coordinators, and on-site staff.",
    category: "staffing",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 4,
    state: "Pennsylvania",
    stateCode: "PA",
    licenseType: "DDAP Conditional License",
    requirement: "House Policy and Resident Agreement",
    description: "Standard written copies of resident guidelines, grievance procedures, fee schedules, and relapse intervention policies.",
    category: "documentation",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 5,
    state: "Pennsylvania",
    stateCode: "PA",
    licenseType: "DDAP Conditional License",
    requirement: "Facility Insurance Verification",
    description: "Comprehensive general liability ($1M/$3M limit) and property insurance with DDAP listed as an additional certificate holder.",
    category: "financial",
    createdAt: "2026-05-31T00:00:00Z"
  },
  
  // Florida (5 requirements)
  {
    id: 6,
    state: "Florida",
    stateCode: "FL",
    licenseType: "FARR Certification",
    requirement: "FARR Certification Application Submission",
    description: "Submit the comprehensive application detailing house structure, corporate ownership, and ethical standard signoffs to Florida Association of Recovery Residences.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 7,
    state: "Florida",
    stateCode: "FL",
    licenseType: "FARR Certification",
    requirement: "Certified House Manager Placement",
    description: "Recruit, train, and place at least one certified FARR supervisor or certified house manager to remain on-site.",
    category: "staffing",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 8,
    state: "Florida",
    stateCode: "FL",
    licenseType: "FARR Certification",
    requirement: "Standardized Intake and Drug Testing Protocol",
    description: "Documented and standardized procedures for non-punitive drug screenings, toxicological lab contracts, and intake rules.",
    category: "documentation",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 9,
    state: "Florida",
    stateCode: "FL",
    licenseType: "FARR Certification",
    requirement: "Facility Code Compliance Review",
    description: "Physical inspection of environmental and safety factors matching national NARR Level quality benchmarks.",
    category: "inspection",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 10,
    state: "Florida",
    stateCode: "FL",
    licenseType: "FARR Certification",
    requirement: "Financial Integrity & Good Neighbor Policy",
    description: "Ensure ethical billing (no patient brokering) and establish a community integration and neighborhood relations code.",
    category: "financial",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // California (4 requirements)
  {
    id: 11,
    state: "California",
    stateCode: "CA",
    licenseType: "DHCS Registration",
    requirement: "DHCS License or Certification Form",
    description: "Register application forms with the California Department of Health Care Services for cooperative transitional homes.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 12,
    state: "California",
    stateCode: "CA",
    licenseType: "DHCS Registration",
    requirement: "ADA Compliance Verification",
    description: "Conduct double accessibility review or sign ADA-compliant physically structural verification forms.",
    category: "facility",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 13,
    state: "California",
    stateCode: "CA",
    licenseType: "DHCS Registration",
    requirement: "Resident Agreement and Relapse Plan",
    description: "Structured relapse response plan, emergency transit, or immediate family/authorized representative escalation policies.",
    category: "documentation",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 14,
    state: "California",
    stateCode: "CA",
    licenseType: "DHCS Registration",
    requirement: "Safe Medication Storage Standards",
    description: "Formulate policy and install double-locked steel safes to separate and self-administer prescribed drugs.",
    category: "facility",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // Ohio (3 requirements)
  {
    id: 15,
    state: "Ohio",
    stateCode: "OH",
    licenseType: "OhioMHAS License",
    requirement: "OhioMHAS Operator Certification Log",
    description: "File certified housing operational plan and operator log with Ohio Department of Mental Health and Addiction Services.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 16,
    state: "Ohio",
    stateCode: "OH",
    licenseType: "OhioMHAS License",
    requirement: "Local Fire Department Inspection",
    description: "Conduct of an inspection by fire marshall confirming smoke detectors, egress width, and fire extinguishers are operational.",
    category: "inspection",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 17,
    state: "Ohio",
    stateCode: "OH",
    licenseType: "OhioMHAS License",
    requirement: "Resident Bill of Rights Posting",
    description: "Post OhioMHAS advocacy hotlines, resident constitutional protections, and non-discrimination charters openly in main common room.",
    category: "documentation",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // Arizona (2 requirements)
  {
    id: 18,
    state: "Arizona",
    stateCode: "AZ",
    licenseType: "DHS Behavioral Health License",
    requirement: "ADHS Licensing Package",
    description: "Apply for standard certificate under ADHS Bureau of Residential Facilities Licensing rules.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 19,
    state: "Arizona",
    stateCode: "AZ",
    licenseType: "DHS Behavioral Health License",
    requirement: "Water Quality & Environmental Check",
    description: "Validate site is fully hazard-free and water purity tests verify maximum safety parameters.",
    category: "inspection",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // Utah (2 requirements)
  {
    id: 20,
    state: "Utah",
    stateCode: "UT",
    licenseType: "DOPL License",
    requirement: "DOPL Business Registration",
    description: "Submit active corporate standing and credentialing to Division of Occupational and Professional Licensing.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 21,
    state: "Utah",
    stateCode: "UT",
    licenseType: "DOPL License",
    requirement: "Staff First Aid & CPR Certification",
    description: "Mandate every house manager displays up-to-date certification card in Basic Life Support (BLS)/First Aid.",
    category: "staffing",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // Texas (2 requirements)
  {
    id: 22,
    state: "Texas",
    stateCode: "TX",
    licenseType: "TDLR Registration",
    requirement: "TROHN registry association",
    description: "Obtain dynamic certification registry approval from Texas Recovery Oriented Housing Network (TROHN).",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 23,
    state: "Texas",
    stateCode: "TX",
    licenseType: "TDLR Registration",
    requirement: "Sober Home Emergency Exits Log",
    description: "Post egress mappings and display safety lighting/exit markers in accordance with municipal codes.",
    category: "facility",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // New York (2 requirements)
  {
    id: 24,
    state: "New York",
    stateCode: "NY",
    licenseType: "OASAS Certification",
    requirement: "OASAS Housing Designation File",
    description: "File certified community housing designation packet with NY State Office of Addiction Services and Supports.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },
  {
    id: 25,
    state: "New York",
    stateCode: "NY",
    licenseType: "OASAS Certification",
    requirement: "Operational Budget and Projections",
    description: "Submit a 12-month general ledger budget confirming structured financial solvency and resident fee stability.",
    category: "financial",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // Michigan (1 requirement)
  {
    id: 26,
    state: "Michigan",
    stateCode: "MI",
    licenseType: "LARA License",
    requirement: "LARA Registration for Sober Homes",
    description: "Establish valid business filing of the recovery home facility inside Department of Licensing and Regulatory Affairs system.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  },

  // Colorado (1 requirement)
  {
    id: 27,
    state: "Colorado",
    stateCode: "CO",
    licenseType: "OBH License",
    requirement: "BHA License Package - Transitional Living",
    description: "Submit compliance audits and intake packages to Behavioral Health Administration of Colorado.",
    category: "application",
    createdAt: "2026-05-31T00:00:00Z"
  }
];

export class DBStore {
  private static instance: DBStore;
  private state: DatabaseState;

  private constructor() {
    this.state = this.loadFromFile();
  }

  public static getInstance(): DBStore {
    if (!DBStore.instance) {
      DBStore.instance = new DBStore();
    }
    return DBStore.instance;
  }

  private loadFromFile(): DatabaseState {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent) as DatabaseState;
        
        // Ensure requirements are always seeded and updated on load
        parsed.state_requirements = INITIAL_STATE_REQUIREMENTS;
        return parsed;
      }
    } catch (e) {
      console.error('Failed to read db.json, fallback to default', e);
    }

    const defaultState: DatabaseState = {
      users: [],
      organizations: [],
      residents: [],
      license_applications: [],
      documents: [],
      compliance_items: [],
      consulting_bookings: [],
      state_requirements: INITIAL_STATE_REQUIREMENTS,
      activities: []
    };
    this.saveToFile(defaultState);
    return defaultState;
  }

  private saveToFile(state: DatabaseState): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json', e);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public writeState(updater: (state: DatabaseState) => void): DatabaseState {
    updater(this.state);
    this.saveToFile(this.state);
    return this.state;
  }
}
