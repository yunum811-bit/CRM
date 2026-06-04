import { Router } from 'express'
import { get, run } from '../db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()

// GET company settings
router.get('/', (req, res) => {
  try {
    const settings = get('SELECT * FROM company_settings WHERE id = 1')
    res.json(settings || { company_name: 'SerialFac', company_subtitle: 'CRM ระบบสินเชื่อ', logo_url: '' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update company settings
router.put('/', (req, res) => {
  try {
    const { company_name, company_subtitle } = req.body
    run('UPDATE company_settings SET company_name = ?, company_subtitle = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [company_name || 'SerialFac', company_subtitle || 'CRM ระบบสินเชื่อ'])
    const updated = get('SELECT * FROM company_settings WHERE id = 1')
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST upload logo
router.post('/logo', (req, res) => {
  try {
    // Expect base64 image in body
    const { logo_data } = req.body
    if (!logo_data) return res.status(400).json({ error: 'logo_data is required' })

    // Save to file
    const uploadsDir = path.join(__dirname, '..', '..', 'dist', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    // Extract base64
    const matches = logo_data.match(/^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,(.+)$/)
    if (!matches) return res.status(400).json({ error: 'Invalid image format' })

    const ext = matches[1].replace('+xml', '')
    const buffer = Buffer.from(matches[2], 'base64')
    const filename = `logo.${ext}`
    const filepath = path.join(uploadsDir, filename)

    fs.writeFileSync(filepath, buffer)

    const logoUrl = `/uploads/${filename}?t=${Date.now()}`
    run('UPDATE company_settings SET logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [logoUrl])

    res.json({ logo_url: logoUrl })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
