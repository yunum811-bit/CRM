import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, process.env.DB_PATH || './database.db')

let db

export async function getDb() {
  if (db) return db

  const SQL = await initSqlJs()

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tax_id TEXT,
      type TEXT DEFAULT 'บริษัท',
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      total_credit REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_id INTEGER,
      phone TEXT,
      product_type TEXT DEFAULT 'Factoring',
      amount REAL DEFAULT 0,
      approved_amount REAL DEFAULT 0,
      approved_amount_reserve REAL DEFAULT 0,
      interest_rate REAL DEFAULT 0,
      term_months INTEGER DEFAULT 0,
      interest_deducted REAL DEFAULT 0,
      net_disbursement REAL DEFAULT 0,
      interest_level TEXT,
      current_step TEXT DEFAULT 'telesale',
      current_step_label TEXT DEFAULT 'Telesale',
      notes TEXT,
      approval_notes TEXT,
      contract_signed INTEGER DEFAULT 0,
      disbursed_at TEXT,
      paid_at TEXT,
      closed_at TEXT,
      legal_result TEXT,
      -- Sale fields
      company_name TEXT,
      company_address TEXT,
      tax_id TEXT,
      business_type TEXT,
      contact_person TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      purpose TEXT,
      collateral TEXT,
      collateral_value REAL DEFAULT 0,
      monthly_revenue REAL DEFAULT 0,
      existing_debt REAL DEFAULT 0,
      project_name TEXT,
      project_value REAL DEFAULT 0,
      government_agency TEXT,
      bill_no TEXT,
      requested_rate REAL DEFAULT 0,
      requested_term INTEGER DEFAULT 0,
      documents_submitted TEXT,
      sale_notes TEXT,
      visited_at TEXT,
      --
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      page TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      company_name TEXT DEFAULT 'SerialFac',
      company_subtitle TEXT DEFAULT 'CRM ระบบสินเชื่อ',
      logo_url TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    INSERT OR IGNORE INTO company_settings (id, company_name, company_subtitle) VALUES (1, 'SerialFac', 'CRM ระบบสินเชื่อ')
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      call_date TEXT NOT NULL,
      call_result TEXT NOT NULL,
      appointment_date TEXT,
      appointment_time TEXT,
      contact_person TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deal_id) REFERENCES deals(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS messenger_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      messenger_name TEXT NOT NULL,
      trip_date TEXT NOT NULL,
      destination TEXT,
      distance_km REAL DEFAULT 0,
      travel_cost REAL DEFAULT 0,
      other_cost REAL DEFAULT 0,
      total_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'รอจ่าย',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deal_id) REFERENCES deals(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS legal_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      action_date TEXT NOT NULL,
      lawyer_name TEXT,
      court_name TEXT,
      case_number TEXT,
      description TEXT,
      cost REAL DEFAULT 0,
      status TEXT DEFAULT 'ดำเนินการ',
      result TEXT,
      next_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deal_id) REFERENCES deals(id)
    )
  `)

  saveDb()
  return db
}

export function saveDb() {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  const results = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

export function get(sql, params = []) {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  let result = null
  if (stmt.step()) {
    result = stmt.getAsObject()
  }
  stmt.free()
  return result
}

export function run(sql, params = []) {
  db.run(sql, params)
  saveDb()
  return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0], changes: db.getRowsModified() }
}
