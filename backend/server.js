import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { getDb } from './db.js'
import customersRouter from './routes/customers.js'
import dealsRouter from './routes/deals.js'
import dashboardRouter from './routes/dashboard.js'
import authRouter from './routes/auth.js'
import messengerRouter from './routes/messenger.js'
import legalRouter from './routes/legal.js'
import callLogsRouter from './routes/callLogs.js'
import exportRouter from './routes/export.js'
import companySettingsRouter from './routes/companySettings.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/customers', customersRouter)
app.use('/api/deals', dealsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/messenger', messengerRouter)
app.use('/api/legal', legalRouter)
app.use('/api/call-logs', callLogsRouter)
app.use('/api/export', exportRouter)
app.use('/api/company', companySettingsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve frontend (production build)
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// Serve uploads
const uploadsPath = path.join(distPath, 'uploads')
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true })

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Initialize DB then start server
getDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SerialFac CRM running on http://192.168.212.109:${PORT}`)
    console.log(`   คนในองค์กรเข้าได้ที่: http://192.168.212.109:${PORT}`)
  })
}).catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
