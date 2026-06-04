import { Router } from 'express'
import { all, get, run } from '../db.js'

const router = Router()

// POST login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const user = get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])
    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }

    // Get role permissions
    const role = get('SELECT * FROM roles WHERE id = ?', [user.role_id])
    const permissions = all('SELECT page FROM role_permissions WHERE role_id = ?', [user.role_id])
    const allowedPages = permissions.map(p => p.page)

    res.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: role?.name || 'unknown',
      role_label: role?.label || '',
      allowedPages,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET all users (admin only)
router.get('/users', (req, res) => {
  try {
    const users = all(`
      SELECT u.id, u.username, u.full_name, u.role_id, r.name as role, r.label as role_label, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create user
router.post('/users', (req, res) => {
  try {
    const { username, password, full_name, role_id } = req.body
    if (!username || !password || !full_name || !role_id) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    const existing = get('SELECT id FROM users WHERE username = ?', [username])
    if (existing) return res.status(400).json({ error: 'Username already exists' })

    const result = run(
      'INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?)',
      [username, password, full_name, role_id]
    )
    const newUser = get('SELECT u.*, r.name as role, r.label as role_label FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?', [result.lastInsertRowid])
    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update user
router.put('/users/:id', (req, res) => {
  try {
    const { username, password, full_name, role_id } = req.body
    if (password) {
      run('UPDATE users SET username = ?, password = ?, full_name = ?, role_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [username, password, full_name, role_id, Number(req.params.id)])
    } else {
      run('UPDATE users SET username = ?, full_name = ?, role_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [username, full_name, role_id, Number(req.params.id)])
    }
    const updated = get('SELECT u.*, r.name as role, r.label as role_label FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?', [Number(req.params.id)])
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE user
router.delete('/users/:id', (req, res) => {
  try {
    const result = run('DELETE FROM users WHERE id = ?', [Number(req.params.id)])
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET all roles
router.get('/roles', (req, res) => {
  try {
    const roles = all('SELECT * FROM roles ORDER BY id')
    const rolesWithPermissions = roles.map(role => {
      const permissions = all('SELECT page FROM role_permissions WHERE role_id = ?', [role.id])
      return { ...role, pages: permissions.map(p => p.page) }
    })
    res.json(rolesWithPermissions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update role permissions
router.put('/roles/:id/permissions', (req, res) => {
  try {
    const { pages } = req.body // array of page strings
    if (!Array.isArray(pages)) return res.status(400).json({ error: 'pages must be an array' })

    run('DELETE FROM role_permissions WHERE role_id = ?', [Number(req.params.id)])
    for (const page of pages) {
      run('INSERT INTO role_permissions (role_id, page) VALUES (?, ?)', [Number(req.params.id), page])
    }

    const role = get('SELECT * FROM roles WHERE id = ?', [Number(req.params.id)])
    const permissions = all('SELECT page FROM role_permissions WHERE role_id = ?', [Number(req.params.id)])
    res.json({ ...role, pages: permissions.map(p => p.page) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
