import mysql, { Pool } from "mysql2/promise";
import { hashSync } from "bcryptjs";
import { defaultState } from "./estate-data";

const host = process.env.MYSQL_HOST || "127.0.0.1";
const port = Number(process.env.MYSQL_PORT || 3306);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "Saksham@123";
const database = process.env.MYSQL_DATABASE || "digital_will";

let pool: Pool | null = null;
let initialized = false;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    });
  }
  return pool;
}

export async function initDatabase(): Promise<void> {
  if (initialized) return;

  try {
    // 1. Ensure Database Exists
    const rootConn = await mysql.createConnection({ host, port, user, password });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await rootConn.end();

    const db = getPool();

    // 2. Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS estate_settings (
        id VARCHAR(50) PRIMARY KEY,
        ownerName VARCHAR(255) NOT NULL,
        estateName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        autoLock TINYINT(1) DEFAULT 1,
        requireReview TINYINT(1) DEFAULT 1,
        encryptionMode VARCHAR(50) DEFAULT 'AES-256',
        estateStatus VARCHAR(50) DEFAULT 'locked',
        passwordHash VARCHAR(255) NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nominees (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) DEFAULT 'Sibling',
        status VARCHAR(50) DEFAULT 'active',
        permissions JSON NOT NULL,
        phoneNumber TEXT,
        personalNotes TEXT,
        financialNotes TEXT,
        identityNumber TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        createdAt VARCHAR(100) NOT NULL,
        sizeLabel VARCHAR(50) DEFAULT 'encrypted',
        secure TINYINT(1) DEFAULT 1,
        encryptedFile LONGTEXT,
        fileContent LONGTEXT,
        mimeType VARCHAR(100) DEFAULT 'application/octet-stream',
        ownerId VARCHAR(50) DEFAULT 'owner-1',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assets (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        value VARCHAR(100) NOT NULL,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS instructions (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS checklist (
        id VARCHAR(50) PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        completed TINYINT(1) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        actor VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        summary TEXT,
        ipAddress VARCHAR(100) DEFAULT '127.0.0.1',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otp_codes (
        id VARCHAR(100) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expiresAt DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Seed default data if empty
    const [settingsRows] = await db.query<any[]>("SELECT COUNT(*) as cnt FROM estate_settings");
    if (settingsRows[0].cnt === 0) {
      const defaultOwnerPwHash = hashSync(process.env.LEGACYVAULT_OWNER_PASSWORD ?? "LegacyVault@2026", 10);
      await db.query(
        `INSERT INTO estate_settings (id, ownerName, estateName, email, autoLock, requireReview, encryptionMode, estateStatus, passwordHash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "owner-1",
          defaultState.ownerName,
          defaultState.estateName,
          defaultState.email,
          1,
          1,
          "AES-256",
          "locked",
          defaultOwnerPwHash,
        ]
      );
    }

    const [nomineeRows] = await db.query<any[]>("SELECT COUNT(*) as cnt FROM nominees");
    if (nomineeRows[0].cnt === 0) {
      const defaultNomineePwHash = hashSync(process.env.LEGACYVAULT_NOMINEE_PASSWORD ?? "LegacyVault@2026", 10);
      for (const nom of defaultState.nominees) {
        await db.query(
          `INSERT INTO nominees (id, name, email, passwordHash, relationship, status, permissions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            nom.id,
            nom.name,
            nom.email,
            defaultNomineePwHash,
            nom.relationship || "Sibling",
            nom.status || "active",
            JSON.stringify(nom.permissions),
          ]
        );
      }
    }

    const [docRows] = await db.query<any[]>("SELECT COUNT(*) as cnt FROM documents");
    if (docRows[0].cnt === 0) {
      for (const doc of defaultState.documents) {
        await db.query(
          `INSERT INTO documents (id, title, category, createdAt, sizeLabel, secure, encryptedFile, fileContent, mimeType, ownerId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            doc.id,
            doc.title,
            doc.category,
            doc.createdAt,
            doc.sizeLabel,
            doc.secure ? 1 : 0,
            `Encrypted content for ${doc.title}`,
            `Digital Will confidential payload content for ${doc.title}. Category: ${doc.category}. Verified and stored securely in MySQL database.`,
            "text/plain",
            "owner-1",
          ]
        );
      }
    }

    const [assetRows] = await db.query<any[]>("SELECT COUNT(*) as cnt FROM assets");
    if (assetRows[0].cnt === 0) {
      for (const asset of defaultState.assets) {
        await db.query(
          `INSERT INTO assets (id, name, type, value, notes) VALUES (?, ?, ?, ?, ?)`,
          [asset.id, asset.name, asset.type, asset.value, asset.notes]
        );
      }
    }

    const [instRows] = await db.query<any[]>("SELECT COUNT(*) as cnt FROM instructions");
    if (instRows[0].cnt === 0) {
      for (const inst of defaultState.instructions) {
        await db.query(
          `INSERT INTO instructions (id, title, details, priority) VALUES (?, ?, ?, ?)`,
          [inst.id, inst.title, inst.details, inst.priority]
        );
      }
    }

    const [checkRows] = await db.query<any[]>("SELECT COUNT(*) as cnt FROM checklist");
    if (checkRows[0].cnt === 0) {
      for (const item of defaultState.checklist) {
        await db.query(
          `INSERT INTO checklist (id, label, completed) VALUES (?, ?, ?)`,
          [item.id, item.label, item.completed ? 1 : 0]
        );
      }
    }

    const [auditRows] = await db.query<any[]>("SELECT COUNT(*) as cnt FROM audit_logs");
    if (auditRows[0].cnt === 0) {
      for (const audit of defaultState.audit) {
        await db.query(
          `INSERT INTO audit_logs (id, actor, action, summary, ipAddress) VALUES (?, ?, ?, ?, ?)`,
          [audit.id, audit.actor, audit.action, audit.summary, "127.0.0.1"]
        );
      }
    }

    initialized = true;
    console.log("MySQL Database & Tables initialized successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
