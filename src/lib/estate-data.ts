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
  content?: string;
  mimeType?: string;
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
      details:
        "Reach out to the financial, medical, and legal providers listed in the assets register.",
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
  window.dispatchEvent(new CustomEvent("legacyvault-state-change", { detail: state }));
}

export function getEstateState(): EstateState {
  if (typeof window === "undefined") return defaultState;
  const state = readStoredState() ?? defaultState;

  // Trigger real-time fetch from MySQL database in background
  fetchStateFromDb().then((dbState) => {
    if (dbState) {
      writeStoredState(dbState);
    }
  });

  return state;
}

export async function fetchStateFromDb(): Promise<EstateState | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/estate/state");
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.documents) {
      return data as EstateState;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveEstateState(state: EstateState) {
  writeStoredState(state);
}

export function resetEstateState() {
  writeStoredState(defaultState);
}

export function subscribeToStateChanges(callback: (state: EstateState) => void) {
  if (typeof window === "undefined") return () => {};
  
  // Initial sync from MySQL DB
  fetchStateFromDb().then((dbState) => {
    if (dbState) {
      writeStoredState(dbState);
      callback(dbState);
    }
  });

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<EstateState>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener("legacyvault-state-change", handler);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        callback(JSON.parse(e.newValue));
      } catch (err) {
        console.error("Failed parsing storage state:", err);
      }
    }
  });

  return () => {
    window.removeEventListener("legacyvault-state-change", handler);
  };
}

// Real-Time Document Operations
export function addDocumentRecord(doc: {
  title: string;
  category: string;
  sizeLabel?: string;
  secure?: boolean;
  content?: string;
  mimeType?: string;
}): EstateState {
  const currentState = getEstateState();
  const newDoc: DocumentRecord = {
    id: `doc-${Date.now()}`,
    title: doc.title,
    category: doc.category,
    createdAt: new Date().toISOString().split("T")[0],
    sizeLabel: doc.sizeLabel || "1.2 MB",
    secure: doc.secure !== false,
  };

  const updatedState: EstateState = {
    ...currentState,
    documents: [newDoc, ...currentState.documents],
    audit: [
      {
        id: `audit-${Date.now()}`,
        actor: currentState.ownerName,
        action: `Document added: ${newDoc.title}`,
        timestamp: new Date().toLocaleString(),
        summary: `Uploaded document to ${newDoc.category} category in MySQL database.`,
      },
      ...currentState.audit,
    ],
  };

  saveEstateState(updatedState);

  // Real-time API call to MySQL
  fetch("/api/documents/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: doc.title,
      category: doc.category,
      sizeLabel: doc.sizeLabel,
      content: doc.content || `Encrypted confidential payload for ${doc.title}`,
      mimeType: doc.mimeType || "text/plain",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL document upload failed:", err));

  return updatedState;
}

export function deleteDocumentRecord(id: string): EstateState {
  const currentState = getEstateState();
  const doc = currentState.documents.find((d) => d.id === id);
  const updatedState: EstateState = {
    ...currentState,
    documents: currentState.documents.filter((d) => d.id !== id),
    audit: doc
      ? [
          {
            id: `audit-${Date.now()}`,
            actor: currentState.ownerName,
            action: `Document deleted: ${doc.title}`,
            timestamp: new Date().toLocaleString(),
            summary: `Removed document from MySQL vault.`,
          },
          ...currentState.audit,
        ]
      : currentState.audit,
  };

  saveEstateState(updatedState);

  // Real-time API call to MySQL
  fetch("/api/documents/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL document deletion failed:", err));

  return updatedState;
}

// Real-Time Real Document Download Stream Trigger
export function downloadDocumentFile(id: string, title: string) {
  if (typeof window === "undefined") return;
  const downloadUrl = `/api/documents/download?id=${encodeURIComponent(id)}`;

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `${title.replace(/[^a-zA-Z0-9_.-]/g, "_")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Real-Time Backup Export Download Trigger
export function exportEstateBackup() {
  if (typeof window === "undefined") return;
  const exportUrl = `/api/estate/export`;
  const a = document.createElement("a");
  a.href = exportUrl;
  a.download = `digital_will_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Real-Time Asset Operations
export function addAssetRecord(asset: Omit<AssetRecord, "id">): EstateState {
  const currentState = getEstateState();
  const newAsset: AssetRecord = {
    ...asset,
    id: `asset-${Date.now()}`,
  };
  const updatedState: EstateState = {
    ...currentState,
    assets: [newAsset, ...currentState.assets],
  };

  saveEstateState(updatedState);

  fetch("/api/assets/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL asset insertion failed:", err));

  return updatedState;
}

export function updateAssetRecord(
  id: string,
  asset: Partial<Omit<AssetRecord, "id">>,
): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    assets: currentState.assets.map((a) => (a.id === id ? { ...a, ...asset } : a)),
  };

  saveEstateState(updatedState);

  fetch("/api/assets/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...asset }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL asset update failed:", err));

  return updatedState;
}

export function deleteAssetRecord(id: string): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    assets: currentState.assets.filter((a) => a.id !== id),
  };

  saveEstateState(updatedState);

  fetch("/api/assets/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL asset deletion failed:", err));

  return updatedState;
}

// Real-Time Nominee Operations
export function addNomineeRecord(nominee: Omit<NomineeRecord, "id" | "status"> & { password?: string }): EstateState {
  const currentState = getEstateState();
  const newNominee: NomineeRecord = {
    name: nominee.name,
    email: nominee.email,
    relationship: nominee.relationship,
    permissions: nominee.permissions,
    id: `nom-${Date.now()}`,
    status: "active",
  };
  const updatedState: EstateState = {
    ...currentState,
    nominees: [newNominee, ...currentState.nominees],
  };

  saveEstateState(updatedState);

  fetch("/api/nominee/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nominee),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL nominee addition failed:", err));

  return updatedState;
}

export function updateNomineePermissions(
  id: string,
  permissions: Record<PermissionKey, boolean>,
  password?: string,
): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    nominees: currentState.nominees.map((n) => (n.id === id ? { ...n, permissions } : n)),
  };

  saveEstateState(updatedState);

  fetch("/api/permissions/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, permissions, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL permission update failed:", err));

  return updatedState;
}

export function deleteNomineeRecord(id: string): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    nominees: currentState.nominees.filter((n) => n.id !== id),
  };

  saveEstateState(updatedState);

  fetch("/api/nominee/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL nominee removal failed:", err));

  return updatedState;
}

// Real-Time Instruction Operations
export function addInstructionRecord(instruction: Omit<InstructionRecord, "id">): EstateState {
  const currentState = getEstateState();
  const newInst: InstructionRecord = {
    ...instruction,
    id: `inst-${Date.now()}`,
  };
  const updatedState: EstateState = {
    ...currentState,
    instructions: [newInst, ...currentState.instructions],
  };

  saveEstateState(updatedState);

  fetch("/api/instructions/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(instruction),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL instruction addition failed:", err));

  return updatedState;
}

export function deleteInstructionRecord(id: string): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    instructions: currentState.instructions.filter((i) => i.id !== id),
  };

  saveEstateState(updatedState);

  fetch("/api/instructions/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL instruction deletion failed:", err));

  return updatedState;
}

// Real-Time Checklist Toggle
export function toggleChecklistItem(id: string): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    checklist: currentState.checklist.map((c) =>
      c.id === id ? { ...c, completed: !c.completed } : c,
    ),
  };

  saveEstateState(updatedState);

  fetch("/api/checklist/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL checklist toggle failed:", err));

  return updatedState;
}

// Real-Time Settings & Profile Updates
export function updateSettings(settings: Partial<EstateSettings>): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    settings: { ...currentState.settings, ...settings },
  };

  saveEstateState(updatedState);

  fetch("/api/estate/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL settings update failed:", err));

  return updatedState;
}

export function updateOwnerProfile(profile: {
  ownerName?: string;
  estateName?: string;
  email?: string;
}): EstateState {
  const currentState = getEstateState();
  const updatedState: EstateState = {
    ...currentState,
    ...profile,
  };

  saveEstateState(updatedState);

  fetch("/api/estate/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.snapshot) writeStoredState(data.snapshot);
    })
    .catch((err) => console.error("Real-time MySQL owner profile update failed:", err));

  return updatedState;
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
