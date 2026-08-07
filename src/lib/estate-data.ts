export type PermissionKey = "vault" | "instructions" | "financial" | "checklist" | "timeline";

export interface NomineeRecord {
  id: string;
  name: string;
  email: string;
  relationship: string;
  status: "active" | "pending";
  permissions: Record<PermissionKey, boolean>;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  sizeLabel: string;
  secure: boolean;
}

export interface AssetRecord {
  id: string;
  name: string;
  type: string;
  value: string;
  notes: string;
}

export interface InstructionRecord {
  id: string;
  title: string;
  details: string;
  priority: "High" | "Medium" | "Low";
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  summary: string;
}

export interface EstateSettings {
  autoLock: boolean;
  requireReview: boolean;
  encryptionMode: "AES-256" | "Zero-knowledge";
}

export interface EstateState {
  ownerName: string;
  estateName: string;
  email: string;
  documents: DocumentRecord[];
  assets: AssetRecord[];
  instructions: InstructionRecord[];
  checklist: ChecklistItem[];
  nominees: NomineeRecord[];
  audit: AuditEvent[];
  settings: EstateSettings;
}

export interface SessionState {
  role: "owner" | "nominee";
  email: string;
  nomineeId?: string;
}

const STORAGE_KEY = "legacyvault-ai-state";
const SESSION_KEY = "legacyvault-ai-session";

export const defaultState: EstateState = {
  ownerName: "Alex Morgan",
  estateName: "Morgan Digital Legacy",
  email: "alex@legacyvault.ai",
  documents: [
    {
      id: "doc-1",
      title: "Will and testament",
      category: "Legal",
      createdAt: "2026-07-25",
      sizeLabel: "2.4 MB",
      secure: true,
    },
    {
      id: "doc-2",
      title: "Insurance policy summary",
      category: "Finance",
      createdAt: "2026-07-20",
      sizeLabel: "980 KB",
      secure: true,
    },
    {
      id: "doc-3",
      title: "Cloud backup access guide",
      category: "Technology",
      createdAt: "2026-07-18",
      sizeLabel: "860 KB",
      secure: true,
    },
  ],
  assets: [
    {
      id: "asset-1",
      name: "Primary brokerage account",
      type: "Financial",
      value: "$184,000",
      notes: "Joint access for executor",
    },
    {
      id: "asset-2",
      name: "Design portfolio",
      type: "Creative",
      value: "Intellectual property",
      notes: "Transfer to nominated heir",
    },
    {
      id: "asset-3",
      name: "Music streaming subscriptions",
      type: "Subscription",
      value: "$42/mo",
      notes: "Cancel after estate review",
    },
  ],
  instructions: [
    {
      id: "inst-1",
      title: "Release the vault on the first business day after death",
      details: "Share the vault and instructions with the nominee after confirmation.",
      priority: "High",
    },
    {
      id: "inst-2",
      title: "Notify family and providers",
      details: "Reach out to the financial, medical, and legal providers listed in the assets register.",
      priority: "Medium",
    },
  ],
  checklist: [
    { id: "check-1", label: "Confirm nominee identity", completed: true },
    { id: "check-2", label: "Upload updated legal documents", completed: true },
    { id: "check-3", label: "Review nominee access permissions", completed: false },
  ],
  nominees: [
    {
      id: "nom-1",
      name: "Priya Shah",
      email: "priya@example.com",
      relationship: "Sibling",
      status: "active",
      permissions: {
        vault: true,
        instructions: true,
        financial: false,
        checklist: true,
        timeline: true,
      },
    },
    {
      id: "nom-2",
      name: "Marcus Lee",
      email: "marcus@example.com",
      relationship: "Friend",
      status: "pending",
      permissions: {
        vault: true,
        instructions: false,
        financial: true,
        checklist: false,
        timeline: false,
      },
    },
  ],
  audit: [
    {
      id: "audit-1",
      actor: "System",
      action: "Vault created",
      timestamp: "2026-07-29 08:10",
      summary: "Encrypted estate vault initialized for Alex Morgan.",
    },
    {
      id: "audit-2",
      actor: "Priya Shah",
      action: "Viewed instructions",
      timestamp: "2026-07-30 12:30",
      summary: "Nominee opened the instruction packet and reviewed priorities.",
    },
  ],
  settings: {
    autoLock: true,
    requireReview: true,
    encryptionMode: "AES-256",
  },
};

function readStoredState(): EstateState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as EstateState;
  } catch {
    return null;
  }
}

function writeStoredState(state: EstateState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getEstateState(): EstateState {
  if (typeof window === "undefined") return defaultState;
  return readStoredState() ?? defaultState;
}

export function saveEstateState(state: EstateState) {
  writeStoredState(state);
}

export function resetEstateState() {
  writeStoredState(defaultState);
}

export function getSessionState(): SessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function saveSessionState(state: SessionState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function clearSessionState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
