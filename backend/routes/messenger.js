import { Router } from 'express'
import { all, get, run } from '../db.js'

const router = Router()

// GET expenses by deal
router.get('/deal/:dealId', (req, res) => {
  try {
    const rows = all('SELECT * FROM messenger_expenses WHERE deal_id = ? ORDER BY trip_date DESC', [Number(req.params.dealId)])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET all expenses (optional filter by status)
router.get('/', (req, res) => {
  try {
    const { status } = req.query
    let rows
    if (status) {
      rows = all('SELECT me.*, d.customer_name FROM messenger_expenses me LEFT JOIN deals d ON me.deal_id = d.id WHERE me.status = ? ORDER BY me.trip_date DESC', [status])
    } else {
      rows = all('SELECT me.*, d.customer_name FROM messenger_expenses me LEFT JOIN deals d ON me.deal_id = d.id ORDER BY me.trip_date DESC')
    }
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create expense
router.post('/', (req, res) => {
  try {
    const { deal_id, messenger_name, trip_date, destination, distance_km, travel_cost, other_cost, notes } = req.body
    if (!deal_id || !messenger_name || !trip_date) {
      return res.status(400).json({ error: 'deal_id, messenger_name, and trip_date are required' })
    }
    const totalCost = (Number(travel_cost) || 0) + (Number(other_cost) || 0)
    const result = run(
      'INSERT INTO messenger_expenses (deal_id, messenger_name, trip_date, destination, distance_km, travel_cost, other_cost, total_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [deal_id, messenger_name, trip_date, destination || null, distance_km || 0, travel_cost || 0, other_cost || 0, totalCost, notes || null]
    )
    const newRecord = get('SELECT * FROM messenger_expenses WHERE id = ?', [result.lastInsertRowid])
    res.status(201).json(newRecord)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update expense status
router.put('/:id', (req, res) => {
  try {
    const { status, notes } = req.body
    run('UPDATE messenger_expenses SET status = ?, notes = ? WHERE id = ?', [status, notes, Number(req.params.id)])
    const updated = get('SELECT * FROM messenger_expenses WHERE id = ?', [Number(req.params.id)])
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE expense
router.delete('/:id', (req, res) => {
  try {
    const result = run('DELETE FROM messenger_expenses WHERE id = ?', [Number(req.params.id)])
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET summary (total costs per deal)
router.get('/summary/:dealId', (req, res) => {
  try {
    const summary = get('SELECT COUNT(*) as trip_count, COALESCE(SUM(total_cost), 0) as total_expense FROM messenger_expenses WHERE deal_id = ?', [Number(req.params.dealId)])
    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
