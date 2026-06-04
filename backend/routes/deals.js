import { Router } from 'express'
import { all, get, run } from '../db.js'

const router = Router()

const STEP_LABELS = {
  telesale: 'Telesale',
  sale: 'Sale',
  credit_analysis: 'พิจารณาสินเชื่อ',
  approved: 'อนุมัติ',
  contract: 'นิติกรรมสัญญา',
  disbursed: 'เบิกจ่าย',
  collection: 'ติดตามหนี้',
  legal: 'กฎหมาย',
  accounting: 'บัญชี',
  closed: 'ปิดรายการ',
  rejected: 'ปฏิเสธ',
}

// GET all deals (optionally filtered by step and search)
router.get('/', (req, res) => {
  try {
    const { step, search } = req.query
    let rows
    if (step && search) {
      const term = `%${search}%`
      rows = all(
        'SELECT * FROM deals WHERE current_step = ?1 AND (customer_name LIKE ?2 OR product_type LIKE ?3 OR phone LIKE ?4 OR company_name LIKE ?5 OR project_name LIKE ?6) ORDER BY updated_at DESC',
        [step, term, term, term, term, term]
      )
    } else if (step) {
      rows = all('SELECT * FROM deals WHERE current_step = ?1 ORDER BY updated_at DESC', [step])
    } else if (search) {
      const term = `%${search}%`
      rows = all('SELECT * FROM deals WHERE customer_name LIKE ?1 OR product_type LIKE ?2 OR phone LIKE ?3 OR company_name LIKE ?4 OR project_name LIKE ?5 OR bill_no LIKE ?6 ORDER BY updated_at DESC', [term, term, term, term, term, term])
    } else {
      rows = all('SELECT * FROM deals ORDER BY updated_at DESC')
    }
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single deal
router.get('/:id', (req, res) => {
  try {
    const row = get('SELECT * FROM deals WHERE id = ?', [Number(req.params.id)])
    if (!row) return res.status(404).json({ error: 'Deal not found' })
    res.json(row)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create deal
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_id, phone, product_type, amount, current_step, notes, interest_level } = req.body
    if (!customer_name) return res.status(400).json({ error: 'customer_name is required' })

    const step = current_step || 'telesale'
    const stepLabel = STEP_LABELS[step] || step

    const result = run(
      `INSERT INTO deals (customer_name, customer_id, phone, product_type, amount, current_step, current_step_label, notes, interest_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_id || null, phone || null, product_type || 'Factoring', amount || 0, step, stepLabel, notes || null, interest_level || null]
    )
    const newDeal = get('SELECT * FROM deals WHERE id = ?', [result.lastInsertRowid])
    res.status(201).json(newDeal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update deal
router.put('/:id', (req, res) => {
  try {
    const existing = get('SELECT * FROM deals WHERE id = ?', [Number(req.params.id)])
    if (!existing) return res.status(404).json({ error: 'Deal not found' })

    const fields = req.body
    const updates = []
    const values = []

    for (const [key, value] of Object.entries(fields)) {
      if (key === 'id' || key === 'created_at') continue
      if (key === 'current_step') {
        updates.push('current_step = ?')
        values.push(value)
        updates.push('current_step_label = ?')
        values.push(STEP_LABELS[value] || value)
      } else {
        updates.push(`${key} = ?`)
        values.push(value)
      }
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(Number(req.params.id))

    run(`UPDATE deals SET ${updates.join(', ')} WHERE id = ?`, values)
    const updated = get('SELECT * FROM deals WHERE id = ?', [Number(req.params.id)])
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST move deal to next step
router.post('/:id/move', (req, res) => {
  try {
    const { step } = req.body
    if (!step) return res.status(400).json({ error: 'step is required' })

    const stepLabel = STEP_LABELS[step] || step
    run(
      'UPDATE deals SET current_step = ?, current_step_label = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [step, stepLabel, Number(req.params.id)]
    )
    const updated = get('SELECT * FROM deals WHERE id = ?', [Number(req.params.id)])
    if (!updated) return res.status(404).json({ error: 'Deal not found' })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE deal
router.delete('/:id', (req, res) => {
  try {
    const result = run('DELETE FROM deals WHERE id = ?', [Number(req.params.id)])
    if (result.changes === 0) return res.status(404).json({ error: 'Deal not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
