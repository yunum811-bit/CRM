import { Router } from 'express'
import { all, get, run } from '../db.js'

const router = Router()

// GET all customers
router.get('/', (req, res) => {
  try {
    const { search } = req.query
    let rows
    if (search) {
      const term = `%${search}%`
      rows = all('SELECT * FROM customers WHERE name LIKE ?1 OR tax_id LIKE ?2 OR contact_person LIKE ?3 ORDER BY created_at DESC', [term, term, term])
    } else {
      rows = all('SELECT * FROM customers ORDER BY created_at DESC')
    }
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single customer
router.get('/:id', (req, res) => {
  try {
    const row = get('SELECT * FROM customers WHERE id = ?', [Number(req.params.id)])
    if (!row) return res.status(404).json({ error: 'Customer not found' })
    res.json(row)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create customer
router.post('/', (req, res) => {
  try {
    const { name, tax_id, type, contact_person, phone, email, address, total_credit } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required' })

    const result = run(
      'INSERT INTO customers (name, tax_id, type, contact_person, phone, email, address, total_credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, tax_id || null, type || 'บริษัท', contact_person || null, phone || null, email || null, address || null, total_credit || 0]
    )
    const newCustomer = get('SELECT * FROM customers WHERE id = ?', [result.lastInsertRowid])
    res.status(201).json(newCustomer)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update customer
router.put('/:id', (req, res) => {
  try {
    const { name, tax_id, type, contact_person, phone, email, address, total_credit } = req.body
    run(
      'UPDATE customers SET name = ?, tax_id = ?, type = ?, contact_person = ?, phone = ?, email = ?, address = ?, total_credit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, tax_id, type, contact_person, phone, email, address, total_credit, Number(req.params.id)]
    )
    const updated = get('SELECT * FROM customers WHERE id = ?', [Number(req.params.id)])
    if (!updated) return res.status(404).json({ error: 'Customer not found' })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE customer
router.delete('/:id', (req, res) => {
  try {
    const result = run('DELETE FROM customers WHERE id = ?', [Number(req.params.id)])
    if (result.changes === 0) return res.status(404).json({ error: 'Customer not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
