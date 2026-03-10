const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/materials
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search, category } = req.query;
        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) where.categoryId = parseInt(category);

        const materials = await prisma.material.findMany({
            where,
            include: {
                category: true,
                transactions: { select: { type: true, qty: true } },
            },
            orderBy: { code: 'asc' },
        });

        // Calculate stock
        const result = materials.map(m => {
            const stockIn = m.transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.qty, 0);
            const stockOut = m.transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.qty, 0);
            const { transactions, ...rest } = m;
            return { ...rest, stockIn, stockOut, stock: stockIn - stockOut };
        });

        res.json(result);
    } catch (err) {
        console.error('Get materials error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/materials/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const material = await prisma.material.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                category: true,
                transactions: {
                    include: { createdBy: { select: { fullName: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!material) return res.status(404).json({ error: 'Material tidak ditemukan' });

        const stockIn = material.transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.qty, 0);
        const stockOut = material.transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.qty, 0);

        res.json({ ...material, stockIn, stockOut, stock: stockIn - stockOut });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/materials
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { code, name, categoryId, unit, minStock, price, notes } = req.body;
        if (!code || !name || !categoryId || !unit) {
            return res.status(400).json({ error: 'Code, name, category, dan unit wajib diisi' });
        }

        const existing = await prisma.material.findUnique({ where: { code } });
        if (existing) return res.status(400).json({ error: 'Kode material sudah digunakan' });

        const material = await prisma.material.create({
            data: { code, name, categoryId, unit, minStock: minStock || 5, price: price || 0, notes: notes || '' },
            include: { category: true },
        });

        res.status(201).json(material);
    } catch (err) {
        console.error('Create material error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/materials/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { code, name, categoryId, unit, minStock, price, notes } = req.body;

        const existing = await prisma.material.findFirst({
            where: { code, NOT: { id: parseInt(req.params.id) } },
        });
        if (existing) return res.status(400).json({ error: 'Kode material sudah digunakan' });

        const material = await prisma.material.update({
            where: { id: parseInt(req.params.id) },
            data: { code, name, categoryId, unit, minStock, price, notes },
            include: { category: true },
        });

        res.json(material);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/materials/:id
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        await prisma.material.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Material berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
