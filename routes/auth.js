const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username dan password wajib diisi' });
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !user.active) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, fullName: true, role: true, active: true },
        });
        if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/auth/users (admin only)
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, fullName: true, role: true, active: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/auth/register (admin only)
router.post('/register', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { username, password, fullName, role } = req.body;
        if (!username || !password || !fullName) {
            return res.status(400).json({ error: 'Semua field wajib diisi' });
        }

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) return res.status(400).json({ error: 'Username sudah digunakan' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashedPassword, fullName, role: role || 'STAFF' },
            select: { id: true, username: true, fullName: true, role: true },
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
