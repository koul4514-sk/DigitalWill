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

      CREATE TABLE IF NOT EXISTS wallet_activities (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        amount VARCHAR(100) DEFAULT NULL,
        currency_token VARCHAR(50) DEFAULT NULL,
        network VARCHAR(100) DEFAULT 'Ethereum Mainnet',
        sender_wallet VARCHAR(255) DEFAULT NULL,
        receiver_wallet VARCHAR(255) DEFAULT NULL,
        tx_hash VARCHAR(255) DEFAULT NULL,
        block_number INT DEFAULT NULL,
        contract_address VARCHAR(255) DEFAULT NULL,
        reviewer_name VARCHAR(255) DEFAULT NULL,
        review_status VARCHAR(50) DEFAULT NULL,
        rating INT DEFAULT NULL,
        reputation_score INT DEFAULT NULL,
        review_comment TEXT DEFAULT NULL,
        description TEXT DEFAULT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS wallet_activity_attachments (
        id VARCHAR(50) PRIMARY KEY,
        activity_id VARCHAR(50) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INT DEFAULT 0,
        file_data LONGTEXT DEFAULT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (activity_id) REFERENCES wallet_activities(id) ON DELETE CASCADE
      );
    `);

    // 3. Seed default data if empty
    const [settingsRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as cnt FROM estate_settings",
    );
    if (settingsRows[0].cnt === 0) {
      const defaultOwnerPwHash = hashSync(
        process.env.LEGACYVAULT_OWNER_PASSWORD ?? "LegacyVault@2026",
        10,
      );
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
        ],
      );
    }

    const [nomineeRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as cnt FROM nominees",
    );
    if (nomineeRows[0].cnt === 0) {
      const defaultNomineePwHash = hashSync(
        process.env.LEGACYVAULT_NOMINEE_PASSWORD ?? "LegacyVault@2026",
        10,
      );
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
          ],
        );
      }
    }

    const [docRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as cnt FROM documents",
    );
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
          ],
        );
      }
    }

    const [assetRows] = await db.query<mysql.RowDataPacket[]>("SELECT COUNT(*) as cnt FROM assets");
    if (assetRows[0].cnt === 0) {
      for (const asset of defaultState.assets) {
        await db.query(`INSERT INTO assets (id, name, type, value, notes) VALUES (?, ?, ?, ?, ?)`, [
          asset.id,
          asset.name,
          asset.type,
          asset.value,
          asset.notes,
        ]);
      }
    }

    const [instRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as cnt FROM instructions",
    );
    if (instRows[0].cnt === 0) {
      for (const inst of defaultState.instructions) {
        await db.query(
          `INSERT INTO instructions (id, title, details, priority) VALUES (?, ?, ?, ?)`,
          [inst.id, inst.title, inst.details, inst.priority],
        );
      }
    }

    const [checkRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as cnt FROM checklist",
    );
    if (checkRows[0].cnt === 0) {
      for (const item of defaultState.checklist) {
        await db.query(`INSERT INTO checklist (id, label, completed) VALUES (?, ?, ?)`, [
          item.id,
          item.label,
          item.completed ? 1 : 0,
        ]);
      }
    }

    const [auditRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as cnt FROM audit_logs",
    );
    if (auditRows[0].cnt === 0) {
      for (const audit of defaultState.audit) {
        await db.query(
          `INSERT INTO audit_logs (id, actor, action, summary, ipAddress) VALUES (?, ?, ?, ?, ?)`,
          [audit.id, audit.actor, audit.action, audit.summary, "127.0.0.1"],
        );
      }
    }

    const [wactRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as cnt FROM wallet_activities",
    );
    if (wactRows[0].cnt === 0) {
      const demoActivities = [
        {
          id: "wact-1",
          title: "Primary Brokerage Vault Settlement",
          activity_type: "Vault Settlement",
          status: "Completed",
          role: "Owner",
          amount: "$184,000",
          currency_token: "USD",
          network: "Ethereum Mainnet",
          sender_wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          receiver_wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          tx_hash: "0x4f8b2d1e9c8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e",
          block_number: 19842105,
          contract_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          reviewer_name: "Priya Shah",
          review_status: "Approved",
          rating: 5,
          reputation_score: 98,
          review_comment: "Verified ownership deed and trust receipt compliance.",
          description:
            "Authorized settlement of primary brokerage estate vault to nominee account.",
          created_by: "Alex Morgan",
          completed_at: "2026-07-28 14:30:00",
        },
        {
          id: "wact-2",
          title: "Nominee Access Verification & Gas Grant",
          activity_type: "Access Grant",
          status: "Completed",
          role: "Nominee",
          amount: "2.5 ETH",
          currency_token: "ETH",
          network: "Arbitrum One",
          sender_wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          receiver_wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          tx_hash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
          block_number: 21540912,
          contract_address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
          reviewer_name: "Alex Morgan",
          review_status: "Verified",
          rating: 5,
          reputation_score: 95,
          review_comment: "Nominee identity verified via OTP and permission audit.",
          description: "ETH gas allocation for executor estate management tasks.",
          created_by: "Priya Shah",
          completed_at: "2026-07-29 09:15:00",
        },
        {
          id: "wact-3",
          title: "Design Portfolio IP Rights Transfer",
          activity_type: "Asset Handover",
          status: "Pending",
          role: "Owner",
          amount: "10,000 USDC",
          currency_token: "USDC",
          network: "Polygon Mainnet",
          sender_wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          receiver_wallet: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC",
          tx_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          block_number: 55432109,
          contract_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          reviewer_name: "Marcus Lee",
          review_status: "Pending",
          rating: 4,
          reputation_score: 88,
          review_comment: "Pending secondary approval from nominated executor.",
          description: "Transfer of creative portfolio rights and metadata keys.",
          created_by: "Alex Morgan",
          completed_at: null,
        },
        {
          id: "wact-4",
          title: "Executor Subscription Cancellation Review",
          activity_type: "Subscription Audit",
          status: "Under Review",
          role: "Nominee",
          amount: "$42/mo",
          currency_token: "USD",
          network: "Off-Chain / Banking",
          sender_wallet: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC",
          receiver_wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          tx_hash: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
          block_number: 19842500,
          contract_address: "0x0000000000000000000000000000000000000000",
          reviewer_name: "Priya Shah",
          review_status: "Under Review",
          rating: 4,
          reputation_score: 90,
          review_comment: "Reviewing monthly streaming subscriptions for estate audit.",
          description: "Automated subscription review by nominated executor.",
          created_by: "Marcus Lee",
          completed_at: null,
        },
        {
          id: "wact-5",
          title: "Unauthorized Vault Key Access Attempt",
          activity_type: "Security Audit",
          status: "Rejected",
          role: "Nominee",
          amount: "0 ETH",
          currency_token: "ETH",
          network: "Ethereum Mainnet",
          sender_wallet: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
          receiver_wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          tx_hash: "0x7777777777777777777777777777777777777777777777777777777777777777",
          block_number: 19842610,
          contract_address: "0x0000000000000000000000000000000000000000",
          reviewer_name: "System Security Guard",
          review_status: "Rejected",
          rating: 1,
          reputation_score: 30,
          review_comment: "Access request rejected due to missing permission key.",
          description: "Access request denied by security policy enforcement.",
          created_by: "Marcus Lee",
          completed_at: null,
        },
      ];

      for (const act of demoActivities) {
        await db.query(
          `INSERT INTO wallet_activities (
            id, title, activity_type, status, role, amount, currency_token, network,
            sender_wallet, receiver_wallet, tx_hash, block_number, contract_address,
            reviewer_name, review_status, rating, reputation_score, review_comment,
            description, created_by, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            act.id,
            act.title,
            act.activity_type,
            act.status,
            act.role,
            act.amount,
            act.currency_token,
            act.network,
            act.sender_wallet,
            act.receiver_wallet,
            act.tx_hash,
            act.block_number,
            act.contract_address,
            act.reviewer_name,
            act.review_status,
            act.rating,
            act.reputation_score,
            act.review_comment,
            act.description,
            act.created_by,
            act.completed_at,
          ],
        );
      }

      // Seed 1 supporting evidence attachment for wact-1 as required by Bounty 1 demo spec
      await db.query(
        `INSERT INTO wallet_activity_attachments (
          id, activity_id, type, file_name, file_url, mime_type, file_size, file_data, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "att-1",
          "wact-1",
          "file",
          "settlement_deed_2026.pdf",
          "/api/wallet-activities/wact-1/attachment",
          "application/pdf",
          1840000,
          "Digital Legacy Guard - Formal Settlement Deed Document Payload for Primary Brokerage Estate Vault.",
          "Alex Morgan",
        ],
      );
    }

    initialized = true;
    console.log("MySQL Database & Tables initialized successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
