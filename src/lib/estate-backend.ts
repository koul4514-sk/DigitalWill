import { createHash, createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { compareSync, hashSync } from "bcryptjs";

import { defaultState } from "./estate-data";

type EstateStatus = "locked" | "active";

type PermissionKey = "vault" | "instructions" | "financial" | "checklist" | "timeline" | "security";

interface NomineeProfile {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  ownerId: string;
  permissions: Record<PermissionKey, boolean>;
  phoneNumber: string;
  personalNotes: string;
  financialNotes: string;
  identityNumber: string;
}

interface AuditLogEntry {
  user: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

interface BackendEstateState {
  estateStatus: EstateStatus;
  owner: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  };
  nominees: NomineeProfile[];
  documents: Array<{
    id: string;
    title: string;
    category: string;
    createdAt: string;
    sizeLabel: string;
    secure: boolean;
    encryptedFile?: string;
    ownerId: string;
    timestamp: string;
  }>;
  assets: typeof defaultState.assets;
  instructions: typeof defaultState.instructions;
  checklist: typeof defaultState.checklist;
  auditLogs: AuditLogEntry[];
}

interface AuthenticatedNominee {
  id: string;
  name: string;
  email: string;
  permissions: Record<PermissionKey, boolean>;
}

const rateLimitWindowMs = Number(process.env.LEGACYVAULT_RATE_LIMIT_WINDOW_MS ?? 60000);
const rateLimitMax = Number(process.env.LEGACYVAULT_RATE_LIMIT_MAX ?? 60);

const jwtSecret = process.env.LEGACYVAULT_JWT_SECRET ?? "legacyvault-demo-secret";
const encryptionSecret = process.env.LEGACYVAULT_ENCRYPTION_KEY ?? "legacyvault-demo-key-32-bytes-1234";
const allowedOrigins = (process.env.LEGACYVAULT_ALLOWED_ORIGINS ?? "http://localhost:8081").split(",");

const state: BackendEstateState = {
  estateStatus: "locked",
  owner: {
    id: "owner-1",
    name: defaultState.ownerName,
    email: defaultState.email,
    passwordHash: hashSync(process.env.LEGACYVAULT_OWNER_PASSWORD ?? "LegacyVault@2026", 10),
  },
  nominees: [
    {
      id: "nom-1",
      name: "Priya Shah",
      email: "priya@example.com",
      passwordHash: hashSync(process.env.LEGACYVAULT_NOMINEE_PASSWORD ?? "LegacyVault@2026", 10),
      ownerId: "owner-1",
      permissions: {
        vault: true,
        instructions: true,
        financial: false,
        checklist: true,
        timeline: true,
        security: true,
      },
      phoneNumber: encryptText("+1-555-0102"),
      personalNotes: encryptText("Primary nominee for digital estate instructions."),
      financialNotes: encryptText("Financial access is currently restricted."),
      identityNumber: encryptText("ID-784321"),
    },
  ],
  documents: defaultState.documents.map((document) => ({
    ...document,
    encryptedFile: encryptText(`encrypted:${document.title}`),
    ownerId: "owner-1",
    timestamp: document.createdAt,
  })),
  assets: defaultState.assets,
  instructions: defaultState.instructions,
  checklist: defaultState.checklist,
  auditLogs: [],
};

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function nowIso() {
  return new Date().toISOString();
}

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, headers });
}

function applyCorsHeaders(response: Response, request: Request): Response {
  const origin = request.headers.get("origin");
  const headers = new Headers(response.headers);
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return new Response(response.body, { status: response.status, headers });
}

function enforceRateLimit(request: Request): Response | null {
  const key = getClientIp(request);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return null;
  }

  if (bucket.count >= rateLimitMax) {
    const response = jsonResponse({ error: "Too many requests" }, 429);
    return applySecurityHeaders(applyCorsHeaders(response, request));
  }

  bucket.count += 1;
  return null;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function validateInput(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 200) {
    throw new Error(`${field} is invalid`);
  }

  return trimmed.replace(/[<>"'`]/g, "");
}

function sanitizeResource(value: string): string {
  return value.replace(/[^a-zA-Z0-9/_-]/g, "");
}

function createSignature(payload: Record<string, unknown>): string {
  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHash("sha256").update(`${signingInput}.${jwtSecret}`).digest("base64url");
  return `${signingInput}.${signature}`;
}

function verifySignature(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const signingInput = `${header}.${payload}`;
  const expected = createHash("sha256").update(`${signingInput}.${jwtSecret}`).digest("base64url");
  if (signature !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function createNomineeToken(profile: AuthenticatedNominee): string {
  return createSignature({ sub: profile.id, email: profile.email, role: "nominee", permissions: profile.permissions });
}

function extractToken(request: Request): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7);
}

function getAuthenticatedNominee(request: Request, requiredPermission?: PermissionKey): AuthenticatedNominee | null {
  const token = extractToken(request);
  if (!token) return null;
  const payload = verifySignature(token);
  if (!payload) return null;
  const nominee = state.nominees.find((entry) => entry.id === payload.sub);
  if (!nominee) return null;
  if (state.estateStatus !== "active") return null;
  const permissions = nominee.permissions;
  if (requiredPermission && !permissions[requiredPermission]) {
    return null;
  }
  return {
    id: nominee.id,
    name: nominee.name,
    email: nominee.email,
    permissions,
  };
}

function appendAuditLog(user: string, action: string, ipAddress: string) {
  state.auditLogs.push({ user, action, timestamp: nowIso(), ipAddress });
}

function encryptText(value: string): string {
  const iv = randomBytes(12);
  const key = scryptSync(encryptionSecret, "legacyvault-salt", 32);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

function decryptText(value: string): string {
  const [ivHex, encryptedHex, tagHex] = value.split(":");
  const key = scryptSync(encryptionSecret, "legacyvault-salt", 32);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

function getNomineeByEmail(email: string) {
  return state.nominees.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
}

function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  return request.text().then((body) => {
    if (!body) return {};
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      throw new Error("Invalid JSON body");
    }
  });
}

export async function handleBackendRequest(request: Request): Promise<Response> {
  const rateLimitResponse = enforceRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (request.method === "OPTIONS") {
    return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true }), request));
  }

  const url = new URL(request.url);
  const pathname = sanitizeResource(url.pathname.replace(/^\//, ""));

  try {
    if (pathname === "api/estate/activate") {
      state.estateStatus = "active";
      appendAuditLog("owner", "Estate Activated", getClientIp(request));
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, estateStatus: state.estateStatus }), request));
    }

    if (pathname === "api/nominee/login" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const email = validateInput(body.email, "email");
      const password = validateInput(body.password, "password");

      const nominee = getNomineeByEmail(email);
      if (!nominee || !compareSync(password, nominee.passwordHash)) {
        appendAuditLog(email, "Nominee Login Failed", getClientIp(request));
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Invalid credentials" }, 401), request));
      }

      if (state.estateStatus !== "active") {
        appendAuditLog(email, "Nominee Login Blocked", getClientIp(request));
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Estate not activated." }, 403), request));
      }

      const authNominee: AuthenticatedNominee = {
        id: nominee.id,
        name: nominee.name,
        email: nominee.email,
        permissions: nominee.permissions,
      };
      const token = createNomineeToken(authNominee);
      appendAuditLog(nominee.email, "Nominee Login", getClientIp(request));
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ token, nominee: { id: nominee.id, name: nominee.name, email: nominee.email, permissions: nominee.permissions } }), request));
    }

    if (pathname === "api/nominee/dashboard") {
      const nominee = getAuthenticatedNominee(request);
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Unauthorized" }, 401), request));
      }
      appendAuditLog(nominee.email, "Document Viewed", getClientIp(request));
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ estateStatus: state.estateStatus, nominee, dashboard: { documents: state.documents.length, checklistItems: state.checklist.length, activeNominees: state.nominees.length } }), request));
    }

    if (pathname === "api/nominee/access") {
      const nominee = getAuthenticatedNominee(request);
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Unauthorized" }, 401), request));
      }
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ nominee, permissions: getNomineeByEmail(nominee.email)?.permissions }), request));
    }

    if (pathname === "api/nominee/vault") {
      const nominee = getAuthenticatedNominee(request, "vault");
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Forbidden" }, 403), request));
      }
      appendAuditLog(nominee.email, "Document Viewed", getClientIp(request));
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ documents: state.documents }), request));
    }

    if (pathname === "api/nominee/instructions") {
      const nominee = getAuthenticatedNominee(request, "instructions");
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Forbidden" }, 403), request));
      }
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ instructions: state.instructions }), request));
    }

    if (pathname === "api/nominee/financial") {
      const nominee = getAuthenticatedNominee(request, "financial");
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Forbidden" }, 403), request));
      }
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ assets: state.assets }), request));
    }

    if (pathname === "api/nominee/checklist") {
      const nominee = getAuthenticatedNominee(request, "checklist");
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Forbidden" }, 403), request));
      }
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ checklist: state.checklist }), request));
    }

    if (pathname === "api/nominee/timeline") {
      const nominee = getAuthenticatedNominee(request, "timeline");
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Forbidden" }, 403), request));
      }
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ audit: state.auditLogs }), request));
    }

    if (pathname === "api/nominee/security") {
      const nominee = getAuthenticatedNominee(request, "security");
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Forbidden" }, 403), request));
      }
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ security: { auditEnabled: true, readOnlyMode: true } }), request));
    }

    if (pathname === "api/permissions/update" && request.method === "PATCH") {
      const nominee = getAuthenticatedNominee(request);
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Unauthorized" }, 401), request));
      }
      const body = await parseJsonBody(request);
      const nomineeId = validateInput(body.nomineeId as string, "nomineeId");
      const permission = validateInput(body.permission as string, "permission");
      const value = Boolean(body.value);
      const profile = state.nominees.find((entry) => entry.id === nomineeId);
      if (!profile) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Nominee not found" }, 404), request));
      }
      profile.permissions[permission as PermissionKey] = value;
      appendAuditLog(nominee.email, "Permission Updated", getClientIp(request));
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, permissions: profile.permissions }), request));
    }

    if (pathname === "api/documents/upload" && request.method === "POST") {
      const nominee = getAuthenticatedNominee(request, "vault");
      if (!nominee) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Forbidden" }, 403), request));
      }
      const body = await parseJsonBody(request);
      const title = validateInput(body.title as string, "title");
      const category = validateInput(body.category as string, "category");
      const encryptedFile = encryptText(String(body.content ?? ""));
      state.documents.push({
        id: `doc-${Date.now()}`,
        title,
        category,
        createdAt: nowIso(),
        sizeLabel: "encrypted",
        secure: true,
        encryptedFile,
        ownerId: state.owner.id,
        timestamp: nowIso(),
      });
      appendAuditLog(nominee.email, "Document Uploaded", getClientIp(request));
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true }), request));
    }

    return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Not found" }, 404), request));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: message }, 400), request));
  }
}
