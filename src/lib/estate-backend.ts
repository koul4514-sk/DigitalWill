import { createHash, createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { compareSync, hashSync } from "bcryptjs";
import { getPool, initDatabase } from "./db";
import { sendOtpVerificationEmail } from "./email-service";

type EstateStatus = "locked" | "active";
type PermissionKey = "vault" | "instructions" | "financial" | "checklist" | "timeline" | "security";

interface AuthenticatedNominee {
  id: string;
  name: string;
  email: string;
  permissions: Record<PermissionKey, boolean>;
}

const rateLimitWindowMs = Number(process.env.LEGACYVAULT_RATE_LIMIT_WINDOW_MS ?? 60000);
const rateLimitMax = Number(process.env.LEGACYVAULT_RATE_LIMIT_MAX ?? 120);

const jwtSecret = process.env.LEGACYVAULT_JWT_SECRET ?? "legacyvault-demo-secret";
const encryptionSecret =
  process.env.LEGACYVAULT_ENCRYPTION_KEY ?? "legacyvault-demo-key-32-bytes-1234";
const allowedOrigins = (process.env.LEGACYVAULT_ALLOWED_ORIGINS ?? "http://localhost:8081,http://localhost:3000,http://localhost:5173").split(
  ",",
);

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function nowIso() {
  return new Date().toISOString();
}

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
}

function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  return new Response(response.body, { status: response.status, headers });
}

function applyCorsHeaders(response: Response, request: Request): Response {
  const origin = request.headers.get("origin");
  const headers = new Headers(response.headers);
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes("*"))) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    headers.set("Access-Control-Allow-Origin", "*");
  }
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
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
  if (!trimmed || trimmed.length > 500) {
    throw new Error(`${field} is invalid`);
  }

  return trimmed.replace(/[<>"'`]/g, "");
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
  return createSignature({
    sub: profile.id,
    email: profile.email,
    role: "nominee",
    permissions: profile.permissions,
  });
}

function extractToken(request: Request): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7);
}

async function getAuthenticatedNominee(
  request: Request,
  requiredPermission?: PermissionKey,
): Promise<AuthenticatedNominee | null> {
  const token = extractToken(request);
  if (!token) return null;
  const payload = verifySignature(token);
  if (!payload || !payload.sub) return null;

  const db = getPool();
  const [nomineeRows] = await db.query<any[]>("SELECT * FROM nominees WHERE id = ?", [payload.sub]);
  if (nomineeRows.length === 0) return null;
  const nominee = nomineeRows[0];

  let permissions: Record<PermissionKey, boolean>;
  try {
    permissions = typeof nominee.permissions === "string" ? JSON.parse(nominee.permissions) : nominee.permissions;
  } catch {
    permissions = { vault: false, instructions: false, financial: false, checklist: false, timeline: false, security: false };
  }

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

async function appendAuditLog(actor: string, action: string, summary: string, ipAddress: string) {
  try {
    const db = getPool();
    const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.query(
      `INSERT INTO audit_logs (id, actor, action, summary, ipAddress) VALUES (?, ?, ?, ?, ?)`,
      [id, actor, action, summary, ipAddress]
    );
  } catch (err) {
    console.error("Failed writing audit log to MySQL:", err);
  }
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
  try {
    const [ivHex, encryptedHex, tagHex] = value.split(":");
    if (!ivHex || !encryptedHex || !tagHex) return value;
    const key = scryptSync(encryptionSecret, "legacyvault-salt", 32);
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return value;
  }
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.text();
  if (!body) return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

export async function getEstateSnapshotFromDb() {
  await initDatabase();
  const db = getPool();

  const [settingsRows] = await db.query<any[]>("SELECT * FROM estate_settings LIMIT 1");
  const settingsRow = settingsRows[0] || {
    ownerName: "Alex Morgan",
    estateName: "Morgan Digital Legacy",
    email: "alex@legacyvault.ai",
    autoLock: 1,
    requireReview: 1,
    encryptionMode: "AES-256",
    estateStatus: "locked",
  };

  const [documents] = await db.query<any[]>(
    "SELECT id, title, category, createdAt, sizeLabel, secure FROM documents ORDER BY timestamp DESC"
  );
  const [assets] = await db.query<any[]>(
    "SELECT id, name, type, value, notes FROM assets ORDER BY createdAt DESC"
  );
  const [instructions] = await db.query<any[]>(
    "SELECT id, title, details, priority FROM instructions ORDER BY createdAt DESC"
  );
  const [checklistRows] = await db.query<any[]>(
    "SELECT id, label, completed FROM checklist ORDER BY createdAt ASC"
  );
  const checklist = checklistRows.map((c) => ({ ...c, completed: Boolean(c.completed) }));

  const [nomineeRows] = await db.query<any[]>(
    "SELECT id, name, email, relationship, status, permissions FROM nominees ORDER BY createdAt DESC"
  );
  const nominees = nomineeRows.map((n) => {
    let permissions = n.permissions;
    if (typeof permissions === "string") {
      try {
        permissions = JSON.parse(permissions);
      } catch {
        permissions = {};
      }
    }
    return {
      id: n.id,
      name: n.name,
      email: n.email,
      relationship: n.relationship,
      status: n.status,
      permissions,
    };
  });

  const [auditRows] = await db.query<any[]>(
    "SELECT id, actor, action, summary, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 100"
  );
  const audit = auditRows.map((a) => ({
    id: a.id,
    actor: a.actor,
    action: a.action,
    timestamp: new Date(a.timestamp).toLocaleString(),
    summary: a.summary || a.action,
  }));

  return {
    ownerName: settingsRow.ownerName,
    estateName: settingsRow.estateName,
    email: settingsRow.email,
    estateStatus: settingsRow.estateStatus,
    documents: documents.map((d) => ({ ...d, secure: Boolean(d.secure) })),
    assets,
    instructions,
    checklist,
    nominees,
    audit,
    settings: {
      autoLock: Boolean(settingsRow.autoLock),
      requireReview: Boolean(settingsRow.requireReview),
      encryptionMode: settingsRow.encryptionMode,
    },
  };
}

export async function handleBackendRequest(request: Request): Promise<Response> {
  const rateLimitResponse = enforceRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  if (request.method === "OPTIONS") {
    return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true }), request));
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/+/, "");

  try {
    await initDatabase();
    const db = getPool();

    // 1. GET Full Estate State Snapshot from MySQL
    if (pathname === "api/estate/state" && request.method === "GET") {
      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse(snapshot), request));
    }

    // 2. Activate Estate in MySQL
    if (pathname === "api/estate/activate" && request.method === "POST") {
      await db.query("UPDATE estate_settings SET estateStatus = 'active'");
      await appendAuditLog("owner", "Estate Activated", "Estate status changed to ACTIVE in MySQL database", getClientIp(request));
      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, estateStatus: "active", snapshot }), request));
    }

    // 3. Update Owner Profile in MySQL
    if (pathname === "api/estate/profile" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const ownerName = typeof body.ownerName === "string" ? body.ownerName.trim() : null;
      const estateName = typeof body.estateName === "string" ? body.estateName.trim() : null;
      const email = typeof body.email === "string" ? body.email.trim() : null;

      if (ownerName || estateName || email) {
        await db.query(
          `UPDATE estate_settings SET 
            ownerName = COALESCE(?, ownerName),
            estateName = COALESCE(?, estateName),
            email = COALESCE(?, email)`,
          [ownerName, estateName, email]
        );
        await appendAuditLog(email || "owner", "Profile Updated", "Owner profile updated in MySQL database", getClientIp(request));
      }

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse(snapshot), request));
    }

    // 4. Update Settings in MySQL
    if (pathname === "api/estate/settings" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const autoLock = body.autoLock !== undefined ? (body.autoLock ? 1 : 0) : null;
      const requireReview = body.requireReview !== undefined ? (body.requireReview ? 1 : 0) : null;
      const encryptionMode = typeof body.encryptionMode === "string" ? body.encryptionMode : null;

      await db.query(
        `UPDATE estate_settings SET 
          autoLock = COALESCE(?, autoLock),
          requireReview = COALESCE(?, requireReview),
          encryptionMode = COALESCE(?, encryptionMode)`,
        [autoLock, requireReview, encryptionMode]
      );

      await appendAuditLog("owner", "Settings Updated", "Security and estate settings updated in MySQL database", getClientIp(request));
      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse(snapshot), request));
    }

    // 5. Send Nominee OTP Email Verification Code
    if (pathname === "api/nominee/send-otp" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const email = validateInput(body.email, "email");

      let [nomineeRows] = await db.query<any[]>("SELECT * FROM nominees WHERE LOWER(email) = LOWER(?)", [email]);
      let nominee;

      if (nomineeRows.length === 0) {
        // Auto-provision nominee profile so email verification code works for any nominee email address
        const nomineeId = `nom-${Date.now()}`;
        const nameFromEmail = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const defaultPermissions = { vault: true, instructions: true, financial: false, checklist: true, timeline: true };
        const defaultPwHash = hashSync("LegacyVault@2026", 10);

        await db.query(
          `INSERT INTO nominees (id, name, email, passwordHash, relationship, status, permissions)
           VALUES (?, ?, ?, ?, 'Invited Nominee', 'active', ?)`,
          [nomineeId, nameFromEmail, email.toLowerCase(), defaultPwHash, JSON.stringify(defaultPermissions)]
        );

        nominee = { id: nomineeId, name: nameFromEmail, email: email.toLowerCase(), permissions: defaultPermissions };
      } else {
        nominee = nomineeRows[0];
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
      const otpId = `otp-${Date.now()}`;

      await db.query("DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)", [email.toLowerCase()]);
      await db.query(
        "INSERT INTO otp_codes (id, email, code, expiresAt, used) VALUES (?, ?, ?, ?, 0)",
        [otpId, email.toLowerCase(), otpCode, expiresAt]
      );

      const emailResult = await sendOtpVerificationEmail(email, nominee.name, otpCode);

      await appendAuditLog(email, "OTP Code Sent", `Verification code ${otpCode} generated & sent to ${email}`, getClientIp(request));

      return applySecurityHeaders(
        applyCorsHeaders(
          jsonResponse({
            ok: true,
            message: emailResult.message,
            code: otpCode,
            deliveredRealTime: emailResult.deliveredRealTime,
            previewUrl: emailResult.previewUrl ?? null,
          }),
          request
        )
      );
    }

    // 5b. Nominee Login (via Access Token/Password or OTP)
    if (pathname === "api/nominee/login" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const email = validateInput(body.email, "email");
      const password = typeof body.password === "string" ? body.password.trim() : "";
      const otp = typeof body.otp === "string" ? body.otp.trim() : "";

      if (!password && !otp) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Access token/password or OTP code required." }, 400), request));
      }

      const [rows] = await db.query<any[]>("SELECT * FROM nominees WHERE LOWER(email) = LOWER(?)", [email]);
      if (rows.length === 0) {
        await appendAuditLog(email, "Nominee Login Failed", "Email not registered", getClientIp(request));
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Invalid email or nominee not found." }, 401), request));
      }

      const nominee = rows[0];

      // Validate via OTP
      if (otp) {
        const [otpRows] = await db.query<any[]>(
          "SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) AND code = ? AND used = 0 AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1",
          [email, otp]
        );

        if (otpRows.length === 0) {
          await appendAuditLog(email, "Nominee OTP Failed", "Invalid or expired verification code", getClientIp(request));
          return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Invalid or expired OTP verification code." }, 401), request));
        }

        // Mark OTP as used
        await db.query("UPDATE otp_codes SET used = 1 WHERE id = ?", [otpRows[0].id]);
      } else {
        // Validate via Password / Access Token
        const isMatch = compareSync(password, nominee.passwordHash) || password === nominee.passwordHash;
        if (!isMatch) {
          await appendAuditLog(email, "Nominee Login Failed", "Invalid token/password attempt", getClientIp(request));
          return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Invalid access key / token or password." }, 401), request));
        }
      }

      let permissions: Record<PermissionKey, boolean>;
      try {
        permissions = typeof nominee.permissions === "string" ? JSON.parse(nominee.permissions) : nominee.permissions;
      } catch {
        permissions = { vault: true, instructions: true, financial: false, checklist: true, timeline: true, security: true };
      }

      const authNominee: AuthenticatedNominee = {
        id: nominee.id,
        name: nominee.name,
        email: nominee.email,
        permissions,
      };

      const token = createNomineeToken(authNominee);
      await appendAuditLog(nominee.email, "Nominee Login Successful", `Nominee ${nominee.name} authenticated successfully`, getClientIp(request));

      return applySecurityHeaders(
        applyCorsHeaders(
          jsonResponse({
            token,
            nominee: authNominee,
          }),
          request
        )
      );
    }

    // 6. Real-time Document Upload (INSERT into MySQL)
    if (pathname === "api/documents/upload" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const title = validateInput(body.title, "title");
      const category = validateInput(body.category, "category");
      const rawContent = String(body.content || `Digital Will encrypted payload for ${title}`);
      const mimeType = String(body.mimeType || "text/plain");
      const sizeLabel = String(body.sizeLabel || "1.2 MB");
      const docId = `doc-${Date.now()}`;
      const createdAt = new Date().toISOString().split("T")[0];

      const encryptedFile = encryptText(rawContent);

      await db.query(
        `INSERT INTO documents (id, title, category, createdAt, sizeLabel, secure, encryptedFile, fileContent, mimeType, ownerId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [docId, title, category, createdAt, sizeLabel, 1, encryptedFile, rawContent, mimeType, "owner-1"]
      );

      await appendAuditLog("owner", `Document Uploaded: ${title}`, `Real-time inserted document '${title}' into MySQL vault`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, docId, snapshot }), request));
    }

    // 7. Real-time Document Download Stream (SELECT from MySQL & Decrypt/Stream)
    if (pathname === "api/documents/download" && request.method === "GET") {
      const docId = url.searchParams.get("id");
      if (!docId) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Document ID required" }, 400), request));
      }

      const [docRows] = await db.query<any[]>("SELECT * FROM documents WHERE id = ?", [docId]);
      if (docRows.length === 0) {
        return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: "Document not found" }, 404), request));
      }

      const doc = docRows[0];
      let fileData: string = doc.fileContent || "";
      if (!fileData && doc.encryptedFile) {
        fileData = decryptText(doc.encryptedFile);
      }

      await appendAuditLog("user", `Document Downloaded: ${doc.title}`, `Downloaded payload for '${doc.title}' from MySQL`, getClientIp(request));

      const safeFilename = encodeURIComponent(doc.title.replace(/[^a-zA-Z0-9_.-]/g, "_"));
      const headers = new Headers();
      headers.set("Content-Type", doc.mimeType || "text/plain");
      headers.set("Content-Disposition", `attachment; filename="${safeFilename}.txt"`);

      return applySecurityHeaders(
        applyCorsHeaders(new Response(fileData, { status: 200, headers }), request)
      );
    }

    // 8. Real-time Document Delete (DELETE from MySQL)
    if ((pathname === "api/documents/delete" || pathname === "api/documents/remove") && request.method === "POST") {
      const body = await parseJsonBody(request);
      const id = String(body.id);
      
      const [rows] = await db.query<any[]>("SELECT title FROM documents WHERE id = ?", [id]);
      const title = rows[0]?.title || id;

      await db.query("DELETE FROM documents WHERE id = ?", [id]);
      await appendAuditLog("owner", `Document Deleted: ${title}`, `Removed document '${title}' from MySQL database`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, snapshot }), request));
    }

    // 9. Assets Real-Time Operations (INSERT, UPDATE, DELETE)
    if (pathname === "api/assets/add" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const name = validateInput(body.name, "name");
      const type = validateInput(body.type, "type");
      const value = validateInput(body.value, "value");
      const notes = String(body.notes || "");
      const assetId = `asset-${Date.now()}`;

      await db.query(
        "INSERT INTO assets (id, name, type, value, notes) VALUES (?, ?, ?, ?, ?)",
        [assetId, name, type, value, notes]
      );
      await appendAuditLog("owner", `Asset Registered: ${name}`, `Added ${type} asset worth ${value} in MySQL`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, assetId, snapshot }), request));
    }

    if (pathname === "api/assets/update" && (request.method === "POST" || request.method === "PUT")) {
      const body = await parseJsonBody(request);
      const id = String(body.id);
      const name = typeof body.name === "string" ? body.name : null;
      const type = typeof body.type === "string" ? body.type : null;
      const value = typeof body.value === "string" ? body.value : null;
      const notes = typeof body.notes === "string" ? body.notes : null;

      await db.query(
        `UPDATE assets SET 
          name = COALESCE(?, name),
          type = COALESCE(?, type),
          value = COALESCE(?, value),
          notes = COALESCE(?, notes)
         WHERE id = ?`,
        [name, type, value, notes, id]
      );

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, snapshot }), request));
    }

    if (pathname === "api/assets/delete" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const id = String(body.id);
      const [rows] = await db.query<any[]>("SELECT name FROM assets WHERE id = ?", [id]);
      const name = rows[0]?.name || id;

      await db.query("DELETE FROM assets WHERE id = ?", [id]);
      await appendAuditLog("owner", `Asset Removed: ${name}`, `Deleted asset '${name}' from MySQL database`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, snapshot }), request));
    }

    // 10. Instructions Real-Time Operations
    if (pathname === "api/instructions/add" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const title = validateInput(body.title, "title");
      const details = validateInput(body.details, "details");
      const priority = String(body.priority || "Medium");
      const instId = `inst-${Date.now()}`;

      await db.query(
        "INSERT INTO instructions (id, title, details, priority) VALUES (?, ?, ?, ?)",
        [instId, title, details, priority]
      );
      await appendAuditLog("owner", `Instruction Added: ${title}`, `Created ${priority} priority instruction in MySQL`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, instId, snapshot }), request));
    }

    if (pathname === "api/instructions/delete" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const id = String(body.id);
      const [rows] = await db.query<any[]>("SELECT title FROM instructions WHERE id = ?", [id]);
      const title = rows[0]?.title || id;

      await db.query("DELETE FROM instructions WHERE id = ?", [id]);
      await appendAuditLog("owner", `Instruction Deleted: ${title}`, `Removed instruction '${title}' from MySQL database`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, snapshot }), request));
    }

    // 11. Checklist Toggle Real-Time Operation
    if (pathname === "api/checklist/toggle" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const id = String(body.id);

      await db.query("UPDATE checklist SET completed = NOT completed WHERE id = ?", [id]);

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, snapshot }), request));
    }

    // 12. Nominee Real-Time Operations (ADD, UPDATE PERMISSIONS, DELETE)
    if (pathname === "api/nominee/add" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const name = validateInput(body.name, "name");
      const email = validateInput(body.email, "email");
      const relationship = String(body.relationship || "Sibling");
      const rawPassword = typeof body.password === "string" && body.password.trim() ? body.password.trim() : (process.env.LEGACYVAULT_NOMINEE_PASSWORD ?? "LegacyVault@2026");
      const passwordHash = hashSync(rawPassword, 10);

      const permissions = body.permissions || {
        vault: true,
        instructions: true,
        financial: false,
        checklist: true,
        timeline: true,
      };

      const nomineeId = `nom-${Date.now()}`;

      await db.query(
        `INSERT INTO nominees (id, name, email, passwordHash, relationship, status, permissions)
         VALUES (?, ?, ?, ?, ?, 'active', ?)`,
        [nomineeId, name, email, passwordHash, relationship, JSON.stringify(permissions)]
      );

      await appendAuditLog("owner", `Nominee Invited: ${name}`, `Granted digital estate access permissions to ${name} (${email}) with custom token in MySQL`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, nomineeId, snapshot }), request));
    }

    if (pathname === "api/permissions/update" && (request.method === "PATCH" || request.method === "POST")) {
      const body = await parseJsonBody(request);
      const id = String(body.id || body.nomineeId);
      const permissions = body.permissions;
      const newPassword = typeof body.password === "string" && body.password.trim() ? body.password.trim() : null;

      if (id && permissions) {
        if (newPassword) {
          const passwordHash = hashSync(newPassword, 10);
          await db.query("UPDATE nominees SET permissions = ?, passwordHash = ? WHERE id = ?", [
            JSON.stringify(permissions),
            passwordHash,
            id,
          ]);
        } else {
          await db.query("UPDATE nominees SET permissions = ? WHERE id = ?", [
            JSON.stringify(permissions),
            id,
          ]);
        }
        await appendAuditLog("owner", `Permissions Updated`, `Updated nominee access privileges and password in MySQL database`, getClientIp(request));
      }

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, snapshot }), request));
    }

    if (pathname === "api/nominee/delete" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const id = String(body.id);
      const [rows] = await db.query<any[]>("SELECT name FROM nominees WHERE id = ?", [id]);
      const name = rows[0]?.name || id;

      await db.query("DELETE FROM nominees WHERE id = ?", [id]);
      await appendAuditLog("owner", `Nominee Removed: ${name}`, `Revoked all access privileges for ${name} in MySQL`, getClientIp(request));

      const snapshot = await getEstateSnapshotFromDb();
      return applySecurityHeaders(applyCorsHeaders(jsonResponse({ ok: true, snapshot }), request));
    }

    // 13. Export Full Real-time Backup Download (GET /api/estate/export)
    if (pathname === "api/estate/export" && request.method === "GET") {
      const snapshot = await getEstateSnapshotFromDb();
      const exportJson = JSON.stringify(snapshot, null, 2);
      const filename = `digital_will_backup_${new Date().toISOString().split("T")[0]}.json`;

      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);

      await appendAuditLog("owner", "Estate Exported", "Full digital legacy backup downloaded from MySQL", getClientIp(request));

      return applySecurityHeaders(
        applyCorsHeaders(new Response(exportJson, { status: 200, headers }), request)
      );
    }

    return applySecurityHeaders(
      applyCorsHeaders(jsonResponse({ error: "Endpoint not found" }, 404), request)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend request failed";
    console.error("Backend API error:", error);
    return applySecurityHeaders(applyCorsHeaders(jsonResponse({ error: message }, 400), request));
  }
}
