import { Router } from 'express'
import { all, get } from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    // Count deals per step
    const steps = ['telesale', 'sale', 'credit_analysis', 'approved', 'contract', 'disbursed', 'collection', 'legal', 'accounting']
    const stepCounts = {}

    for (const step of steps) {
      const row = get('SELECT COUNT(*) as count FROM deals WHERE current_step = ?', [step])
      stepCounts[step] = row?.count || 0
    }

    // Recent deals
    const recentDeals = all('SELECT * FROM deals WHERE current_step != ? ORDER BY updated_at DESC LIMIT 10', ['closed'])

    res.json({ stepCounts, recentDeals })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
