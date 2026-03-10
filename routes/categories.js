const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories
router.get('/', authMiddleware, async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { materials: true } } },
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/categories
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

        const existing = await prisma.category.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ error: 'Kategori sudah ada' });

        const category = await prisma.category.create({ data: { name } });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
