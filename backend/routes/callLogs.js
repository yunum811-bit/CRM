import { Router } from 'express'
import { all, get, run } from '../db.js'

const router = Router()

// GET logs by deal
router.get('/deal/:dealId', (req, res) => {
  try {
    const rows = all('SELECT * FROM call_logs WHERE deal_id = ? ORDER BY call_date DESC, created_at DESC', [Number(req.params.dealId)])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create log
router.post('/', (req, res) => {
  try {
    const { deal_id, call_date, call_result, appointment_date, appointment_time, contact_person, notes } = req.body
    if (!deal_id || !call_date || !call_result) {
      return res.status(400).json({ error: 'deal_id, call_date, and call_result are required' })
    }
    const result = run(
      'INSERT INTO call_logs (deal_id, call_date, call_result, appointment_date, appointment_time, contact_person, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [deal_id, call_date, call_result, appointment_date || null, appointment_time || null, contact_person || null, notes || null]
    )
    const newRecord = get('SELECT * FROM call_logs WHERE id = ?', [result.lastInsertRowid])
    res.status(201).json(newRecord)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE log
router.delete('/:id', (req, res) => {
  try {
    const result = run('DELETE FROM call_logs WHERE id = ?', [Number(req.params.id)])
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
