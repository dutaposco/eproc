const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/vendors
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { contact: { contains: search, mode: 'insensitive' } },
            ];
        }

        const vendors = await prisma.vendor.findMany({
            where,
            include: {
                _count: { select: { transactions: true } }
            },
            orderBy: { name: 'asc' },
        });

        res.json(vendors);
    } catch (err) {
        console.error('Get vendors error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/vendors/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                transactions: {
                    include: {
                        material: true,
                        createdBy: { select: { fullName: true } }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!vendor) return res.status(404).json({ error: 'Vendor tidak ditemukan' });
        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/vendors
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, contact, address, phone, email } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Nama vendor wajib diisi' });
        }

        const existing = await prisma.vendor.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ error: 'Nama vendor sudah terdaftar' });

        const vendor = await prisma.vendor.create({
            data: { name, contact, address, phone, email },
        });

        res.status(201).json(vendor);
    } catch (err) {
        console.error('Create vendor error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/vendors/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, contact, address, phone, email } = req.body;

        const existing = await prisma.vendor.findFirst({
            where: { name, NOT: { id: parseInt(req.params.id) } },
        });
        if (existing) return res.status(400).json({ error: 'Nama vendor sudah digunakan' });

        const vendor = await prisma.vendor.update({
            where: { id: parseInt(req.params.id) },
            data: { name, contact, address, phone, email },
        });

        res.json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/vendors/:id
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        // Check if has transactions
        const vendor = await prisma.vendor.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { _count: { select: { transactions: true } } }
        });

        if (vendor._count.transactions > 0) {
            return res.status(400).json({ error: 'Vendor tidak bisa dihapus karena memiliki riwayat transaksi' });
        }

        await prisma.vendor.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Vendor berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
