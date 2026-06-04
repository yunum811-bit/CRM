import { Router } from 'express'
import { all } from '../db.js'

const router = Router()

// Helper: convert array of objects to CSV string
function toCSV(data, columns) {
  if (!data || data.length === 0) return ''
  const headers = columns.map(c => c.label).join(',')
  const rows = data.map(row =>
    columns.map(c => {
      let val = row[c.key]
      if (val === null || val === undefined) val = ''
      val = String(val).replace(/"/g, '""')
      if (val.includes(',') || val.includes('"') || val.includes('\n')) val = `"${val}"`
      return val
    }).join(',')
  )
  return '\uFEFF' + headers + '\n' + rows.join('\n') // BOM for Excel Thai support
}

// Export all deals
router.get('/deals', (req, res) => {
  try {
    const { step } = req.query
    let data
    if (step) {
      data = all('SELECT * FROM deals WHERE current_step = ? ORDER BY updated_at DESC', [step])
    } else {
      data = all('SELECT * FROM deals ORDER BY updated_at DESC')
    }

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'customer_name', label: 'ลูกค้า' },
      { key: 'phone', label: 'โทร' },
      { key: 'product_type', label: 'ประเภท' },
      { key: 'amount', label: 'วงเงินขอ' },
      { key: 'approved_amount', label: 'วงเงินอนุมัติ' },
      { key: 'interest_rate', label: 'ดอกเบี้ย%' },
      { key: 'term_months', label: 'ระยะ(เดือน)' },
      { key: 'interest_deducted', label: 'ดอกเบี้ยหัก' },
      { key: 'net_disbursement', label: 'จ่ายจริง' },
      { key: 'current_step_label', label: 'ขั้นตอน' },
      { key: 'purpose', label: 'วัตถุประสงค์' },
      { key: 'company_name', label: 'บริษัท' },
      { key: 'tax_id', label: 'เลขภาษี' },
      { key: 'collateral', label: 'หลักประกัน' },
      { key: 'collateral_value', label: 'มูลค่าหลักประกัน' },
      { key: 'project_name', label: 'โครงการ' },
      { key: 'government_agency', label: 'หน่วยงาน' },
      { key: 'disbursed_at', label: 'วันเบิกจ่าย' },
      { key: 'paid_at', label: 'วันชำระ' },
      { key: 'created_at', label: 'วันที่สร้าง' },
    ]

    const csv = toCSV(data, columns)
    const filename = step ? `deals_${step}.csv` : 'deals_all.csv'
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export customers
router.get('/customers', (req, res) => {
  try {
    const data = all('SELECT * FROM customers ORDER BY id')
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'ชื่อ' },
      { key: 'tax_id', label: 'เลขภาษี' },
      { key: 'type', label: 'ประเภท' },
      { key: 'contact_person', label: 'ผู้ติดต่อ' },
      { key: 'phone', label: 'โทร' },
      { key: 'email', label: 'อีเมล' },
      { key: 'address', label: 'ที่อยู่' },
      { key: 'total_credit', label: 'วงเงินรวม' },
      { key: 'created_at', label: 'วันที่สร้าง' },
    ]
    const csv = toCSV(data, columns)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export call logs
router.get('/call-logs', (req, res) => {
  try {
    const data = all('SELECT cl.*, d.customer_name FROM call_logs cl LEFT JOIN deals d ON cl.deal_id = d.id ORDER BY cl.call_date DESC')
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'customer_name', label: 'ลูกค้า' },
      { key: 'call_date', label: 'วันที่โทร' },
      { key: 'call_result', label: 'ผลการโทร' },
      { key: 'appointment_date', label: 'วันนัด' },
      { key: 'appointment_time', label: 'เวลานัด' },
      { key: 'contact_person', label: 'คุยกับ' },
      { key: 'notes', label: 'หมายเหตุ' },
    ]
    const csv = toCSV(data, columns)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="call_logs.csv"')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export messenger expenses
router.get('/messenger', (req, res) => {
  try {
    const data = all('SELECT me.*, d.customer_name FROM messenger_expenses me LEFT JOIN deals d ON me.deal_id = d.id ORDER BY me.trip_date DESC')
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'customer_name', label: 'ลูกค้า' },
      { key: 'messenger_name', label: 'Messenger' },
      { key: 'trip_date', label: 'วันที่' },
      { key: 'destination', label: 'ปลายทาง' },
      { key: 'distance_km', label: 'ระยะทาง(กม)' },
      { key: 'travel_cost', label: 'ค่าเดินทาง' },
      { key: 'other_cost', label: 'ค่าอื่น' },
      { key: 'total_cost', label: 'รวม' },
      { key: 'status', label: 'สถานะ' },
    ]
    const csv = toCSV(data, columns)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="messenger_expenses.csv"')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export legal actions
router.get('/legal', (req, res) => {
  try {
    const data = all('SELECT la.*, d.customer_name FROM legal_actions la LEFT JOIN deals d ON la.deal_id = d.id ORDER BY la.action_date DESC')
    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'customer_name', label: 'ลูกค้า' },
      { key: 'action_type', label: 'ประเภท' },
      { key: 'action_date', label: 'วันที่' },
      { key: 'lawyer_name', label: 'ทนาย' },
      { key: 'court_name', label: 'ศาล' },
      { key: 'case_number', label: 'เลขคดี' },
      { key: 'description', label: 'รายละเอียด' },
      { key: 'cost', label: 'ค่าใช้จ่าย' },
      { key: 'status', label: 'สถานะ' },
      { key: 'next_date', label: 'นัดถัดไป' },
    ]
    const csv = toCSV(data, columns)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="legal_actions.csv"')
    res.send(csv)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
