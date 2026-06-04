import { getDb, run, saveDb } from './db.js'

async function seed() {
  const db = await getDb()

  console.log('🌱 Seeding database...')

  // Clear existing data
  db.run('DELETE FROM role_permissions')
  db.run('DELETE FROM users')
  db.run('DELETE FROM roles')
  db.run('DELETE FROM deals')
  db.run('DELETE FROM customers')
  saveDb()

  // === ROLES ===
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [1, 'admin', 'ผู้ดูแลระบบ'])
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [2, 'telesale', 'Telesale'])
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [3, 'sale', 'เซลล์'])
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [4, 'credit', 'วิเคราะห์สินเชื่อ'])
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [5, 'operation', 'ปฏิบัติการ'])
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [6, 'collection', 'ติดตามหนี้'])
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [7, 'legal', 'กฎหมาย'])
  run('INSERT INTO roles (id, name, label) VALUES (?, ?, ?)', [8, 'accounting', 'บัญชี'])

  // === ROLE PERMISSIONS ===
  const allPages = ['dashboard', 'telesale', 'sale', 'credit-analysis', 'approval', 'contract', 'disbursement', 'collection', 'legal', 'accounting', 'customers', 'settings']

  // Admin: all pages
  for (const page of allPages) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [1, page])
  }

  // Telesale: dashboard + telesale
  for (const page of ['dashboard', 'telesale']) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [2, page])
  }

  // Sale: dashboard + sale
  for (const page of ['dashboard', 'sale']) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [3, page])
  }

  // Credit: dashboard + credit-analysis + approval
  for (const page of ['dashboard', 'credit-analysis', 'approval']) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [4, page])
  }

  // Operation: dashboard + contract + disbursement
  for (const page of ['dashboard', 'contract', 'disbursement']) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [5, page])
  }

  // Collection: dashboard + collection
  for (const page of ['dashboard', 'collection']) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [6, page])
  }

  // Legal: dashboard + legal
  for (const page of ['dashboard', 'legal']) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [7, page])
  }

  // Accounting: dashboard + accounting + customers
  for (const page of ['dashboard', 'accounting', 'customers']) {
    run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [8, page])
  }

  // === USERS ===
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['admin', 'admin123', 'ผู้ดูแลระบบ', 1])
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['telesale1', '1234', 'คุณสมศรี (Telesale)', 2])
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['sale1', '1234', 'คุณสมชาย (เซลล์)', 3])
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['credit1', '1234', 'คุณวิเชียร (วิเคราะห์)', 4])
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['ops1', '1234', 'คุณมานี (ปฏิบัติการ)', 5])
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['collect1', '1234', 'คุณประสิทธิ์ (ติดตามหนี้)', 6])
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['legal1', '1234', 'คุณธนา (กฎหมาย)', 7])
  run('INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)', ['acc1', '1234', 'คุณนภา (บัญชี)', 8])

  // === CUSTOMERS ===
  const customers = [
    ['บริษัท ABC จำกัด', '0105544000123', 'บริษัท', 'คุณสมชาย', '02-123-4567', 'somchai@abc.co.th', '123 ถ.สุขุมวิท กรุงเทพฯ', 25000000],
    ['หจก. สมชาย', '0105544000456', 'หจก.', 'คุณสมหญิง', '02-234-5678', 'somying@smchai.co.th', '456 ถ.พหลโยธิน กรุงเทพฯ', 12000000],
    ['บริษัท XYZ จำกัด (มหาชน)', '0105544000789', 'บริษัทมหาชน', 'คุณประวิทย์', '02-345-6789', 'prawit@xyz.co.th', '789 ถ.รัชดาภิเษก กรุงเทพฯ', 50000000],
    ['บริษัท โกลบอลเทรด จำกัด', '0105544000321', 'บริษัท', 'คุณณัฐ', '02-456-7890', 'nat@globaltrade.co.th', '321 ถ.สาทร กรุงเทพฯ', 15000000],
    ['หจก. ประชาพัฒนา', '0105544000654', 'หจก.', 'คุณวิชัย', '02-567-8901', 'wichai@pracha.co.th', '654 ถ.ลาดพร้าว กรุงเทพฯ', 8000000],
    ['บริษัท ไทยพัฒนา จำกัด', '0105544000987', 'บริษัท', 'คุณอรุณ', '02-678-9012', 'arun@thaipat.co.th', '987 ถ.เพชรบุรี กรุงเทพฯ', 35000000],
  ]
  for (const c of customers) {
    run('INSERT INTO customers (name, tax_id, type, contact_person, phone, email, address, total_credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', c)
  }

  // === DEALS ===
  const deals = [
    ['บริษัท แสงทอง จำกัด', null, '081-111-1111', 'Factoring', 0, 'telesale', 'Telesale', 'สนใจ Factoring งานราชการ', 'สนใจมาก'],
    ['หจก. รุ่งอรุณ', null, '082-222-2222', 'Loan', 0, 'telesale', 'Telesale', 'ต้องการเงินทุนหมุนเวียน', 'สนใจ'],
    ['บริษัท ซันไรส์ จำกัด', null, '083-333-3333', 'ขายบิล', 0, 'telesale', 'Telesale', 'มีบิลค้างชำระ', 'สนใจเล็กน้อย'],
    ['บริษัท ABC จำกัด', 1, '02-123-4567', 'Factoring', 5000000, 'sale', 'Sale', 'งานก่อสร้างถนน กรมทางหลวง', null],
    ['หจก. สมชาย', 2, '02-234-5678', 'Loan', 3000000, 'sale', 'Sale', 'ซื้อเครื่องจักร', null],
    ['บริษัท XYZ จำกัด (มหาชน)', 3, '02-345-6789', 'Trade', 12000000, 'credit_analysis', 'พิจารณาสินเชื่อ', 'นำเข้าเหล็ก', null],
    ['บริษัท โกลบอลเทรด จำกัด', 4, '02-456-7890', 'Factoring', 8000000, 'credit_analysis', 'พิจารณาสินเชื่อ', 'งานจัดซื้อ IT กระทรวงศึกษาฯ', null],
    ['หจก. ประชาพัฒนา', 5, '02-567-8901', 'ขายบิล', 7500000, 'approved', 'อนุมัติ', 'ขายบิลให้ บจก.ไทยรุ่ง', null],
    ['บริษัท ไทยพัฒนา จำกัด', 6, '02-678-9012', 'Loan', 10000000, 'contract', 'ทำสัญญา', 'เงินทุนหมุนเวียน', null],
    ['บริษัท มั่นคง จำกัด', null, '089-999-9999', 'Factoring', 6000000, 'disbursed', 'เบิกจ่าย', 'งานปรับปรุงอาคาร กรมชลประทาน', null],
    ['บริษัท สยามเทค จำกัด', null, '088-888-8888', 'Trade', 15000000, 'collection', 'ติดตามหนี้', 'นำเข้าอุปกรณ์อิเล็กทรอนิกส์', null],
    ['บริษัท อีสเทิร์น จำกัด', null, '087-777-7777', 'ขายบิล', 1800000, 'accounting', 'บัญชี', 'ชำระครบแล้ว', null],
  ]
  for (const d of deals) {
    run('INSERT INTO deals (customer_name, customer_id, phone, product_type, amount, current_step, current_step_label, notes, interest_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', d)
  }

  // Update some deals with approval data
  run("UPDATE deals SET approved_amount = 7000000, interest_rate = 5, term_months = 6 WHERE customer_name = 'หจก. ประชาพัฒนา'", [])
  run("UPDATE deals SET approved_amount = 10000000, interest_rate = 9, term_months = 12 WHERE customer_name = 'บริษัท ไทยพัฒนา จำกัด'", [])
  run("UPDATE deals SET approved_amount = 6000000, interest_rate = 8, term_months = 6, disbursed_at = '2024-01-15', interest_deducted = 240000, net_disbursement = 5760000 WHERE customer_name = 'บริษัท มั่นคง จำกัด'", [])
  run("UPDATE deals SET approved_amount = 15000000, interest_rate = 7.5, term_months = 12, disbursed_at = '2024-01-01', interest_deducted = 1125000, net_disbursement = 13875000 WHERE customer_name = 'บริษัท สยามเทค จำกัด'", [])
  run("UPDATE deals SET approved_amount = 1800000, interest_rate = 6, disbursed_at = '2023-12-01', paid_at = '2024-01-20', interest_deducted = 54000, net_disbursement = 1746000 WHERE customer_name = 'บริษัท อีสเทิร์น จำกัด'", [])

  console.log('✅ Seed completed!')
  console.log('   - 8 roles')
  console.log('   - 8 users')
  console.log('   - 6 customers')
  console.log('   - 12 deals')
  console.log('')
  console.log('📋 Login accounts:')
  console.log('   admin    / admin123  (ผู้ดูแลระบบ - เข้าได้ทุกหน้า)')
  console.log('   telesale1/ 1234      (Telesale)')
  console.log('   sale1    / 1234      (เซลล์)')
  console.log('   credit1  / 1234      (วิเคราะห์สินเชื่อ)')
  console.log('   ops1     / 1234      (ปฏิบัติการ)')
  console.log('   collect1 / 1234      (ติดตามหนี้)')
  console.log('   legal1   / 1234      (กฎหมาย)')
  console.log('   acc1     / 1234      (บัญชี)')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
