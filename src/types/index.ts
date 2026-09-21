export type CRMUserRole = "developer" | "panel_manager" | "call_agent";

export interface CRMUser {
  id: string;
  email: string;
  name: string;
  role: CRMUserRole;
  isActive: boolean;
  mustChangePassword: boolean;
}

export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type CallListStatus = "PENDING" | "LOCKED" | "ATTEMPTED" | "RESOLVED" | "ESCALATED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
export type TicketTeam = "TECHNICAL" | "FIELD_TECHNICIAN";
export type CallOutcome = "RESOLVED" | "ESCALATED" | "NO_ANSWER" | "CALLBACK";

export interface Rule {
  id: string;
  name: string;
  description?: string;
  eventType: number;
  condition: Record<string, any>;
  lookbackDays: number;
  priority: Priority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: { name: string; email: string };
}

export interface CallListEntry {
  id: string;
  generatedAt: string;
  deviceId: string;
  householdId?: string;
  hhid?: string;
  ruleName?: string;
  priority: Priority;
  reason?: string;
  daysAffected?: number;
  status: CallListStatus;
  lockedAt?: string;
  contactName?: string;
  city?: string;
  region?: string;
  maskedPhone?: string;
}

export interface CallListSummary {
  date: string;
  totalHouseholds: number;
  pending: number;
  attempted: number;
  resolved: number;
  escalated: number;
  byAgent: {
    agentName: string;
    assigned: number;
    resolved: number;
    pending: number;
  }[];
}

export interface Ticket {
  id: string;
  deviceId?: string;
  hhid?: string;
  title: string;
  description?: string;
  issueTag?: string;
  assignedTeam: TicketTeam;
  priority: Priority;
  status: TicketStatus;
  raisedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  raisedByUser?: { name: string };
  assignedToUser?: { name: string };
  resolutionNotes?: string;
}

export interface RulePreview {
  rule: { id: string; name: string; eventType: number };
  lookbackDays: number;
  totalDevicesChecked: number;
  matchedCount: number;
  matchedHouseholds: {
    deviceId: string;
    householdId?: string | null;
    hhid?: string | null;
    contactName?: string | null;
    city?: string | null;
    region?: string | null;
    daysAffected: number;
    reason: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  msg: string;
  data: T;
}

// ── Rule Schema Types (used by Rules Management page) ─────────────────────────

export interface RuleFieldSchema {
  name: string;
  label: string;
  type: "boolean" | "number" | "string" | "array_member" | "array_guest" | "absence";
  description?: string;
  operators: string[];
  defaultOperator: string;
  defaultValue?: any;
}

export type RuleSchema = {
  eventType: number;
  name: string;
  category: string;
  description: string;
  fields: RuleFieldSchema[];
}[];