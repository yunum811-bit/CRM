import { Router } from 'express'
import { all, get, run } from '../db.js'

const router = Router()

// GET legal actions by deal
router.get('/deal/:dealId', (req, res) => {
  try {
    const rows = all('SELECT * FROM legal_actions WHERE deal_id = ? ORDER BY action_date DESC', [Number(req.params.dealId)])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET all legal actions
router.get('/', (req, res) => {
  try {
    const { status } = req.query
    let rows
    if (status) {
      rows = all('SELECT la.*, d.customer_name FROM legal_actions la LEFT JOIN deals d ON la.deal_id = d.id WHERE la.status = ? ORDER BY la.action_date DESC', [status])
    } else {
      rows = all('SELECT la.*, d.customer_name FROM legal_actions la LEFT JOIN deals d ON la.deal_id = d.id ORDER BY la.action_date DESC')
    }
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create legal action
router.post('/', (req, res) => {
  try {
    const { deal_id, action_type, action_date, lawyer_name, court_name, case_number, description, cost, status, result, next_date, notes } = req.body
    if (!deal_id || !action_type || !action_date) {
      return res.status(400).json({ error: 'deal_id, action_type, and action_date are required' })
    }
    const insertResult = run(
      'INSERT INTO legal_actions (deal_id, action_type, action_date, lawyer_name, court_name, case_number, description, cost, status, result, next_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [deal_id, action_type, action_date, lawyer_name || null, court_name || null, case_number || null, description || null, cost || 0, status || 'ดำเนินการ', result || null, next_date || null, notes || null]
    )
    const newRecord = get('SELECT * FROM legal_actions WHERE id = ?', [insertResult.lastInsertRowid])
    res.status(201).json(newRecord)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update legal action
router.put('/:id', (req, res) => {
  try {
    const fields = req.body
    const updates = []
    const values = []
    for (const [key, value] of Object.entries(fields)) {
      if (key === 'id' || key === 'created_at') continue
      updates.push(`${key} = ?`)
      values.push(value)
    }
    values.push(Number(req.params.id))
    run(`UPDATE legal_actions SET ${updates.join(', ')} WHERE id = ?`, values)
    const updated = get('SELECT * FROM legal_actions WHERE id = ?', [Number(req.params.id)])
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE legal action
router.delete('/:id', (req, res) => {
  try {
    const result = run('DELETE FROM legal_actions WHERE id = ?', [Number(req.params.id)])
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET summary per deal
router.get('/summary/:dealId', (req, res) => {
  try {
    const summary = get('SELECT COUNT(*) as action_count, COALESCE(SUM(cost), 0) as total_cost FROM legal_actions WHERE deal_id = ?', [Number(req.params.dealId)])
    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
