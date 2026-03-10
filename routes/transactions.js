const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/transactions
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { type, search, period, page = 1, limit = 50 } = req.query;
        const where = {};
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (type) where.type = type;

        if (search) {
            where.OR = [
                { material: { name: { contains: search, mode: 'insensitive' } } },
                { material: { code: { contains: search, mode: 'insensitive' } } },
                { refNo: { contains: search, mode: 'insensitive' } },
                { party: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (period) {
            const now = new Date();
            if (period === 'today') {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                where.date = { gte: start };
            } else if (period === 'week') {
                const start = new Date(now);
                start.setDate(now.getDate() - now.getDay() + 1);
                start.setHours(0, 0, 0, 0);
                where.date = { gte: start };
            } else if (period === 'month') {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                where.date = { gte: start };
            }
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    material: { include: { category: true } },
                    createdBy: { select: { fullName: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.transaction.count({ where }),
        ]);

        res.json({ data: transactions, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('Get transactions error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/transactions
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, date, refNo, materialId, qty, party, notes } = req.body;

        if (!type || !date || !materialId || !qty) {
            return res.status(400).json({ error: 'Type, date, material, dan qty wajib diisi' });
        }

        const material = await prisma.material.findUnique({ where: { id: materialId } });
        if (!material) return res.status(404).json({ error: 'Material tidak ditemukan' });

        // Check stock for OUT
        if (type === 'OUT') {
            const inQty = await prisma.transaction.aggregate({
                where: { materialId, type: 'IN' },
                _sum: { qty: true },
            });
            const outQty = await prisma.transaction.aggregate({
                where: { materialId, type: 'OUT' },
                _sum: { qty: true },
            });
            const stock = (inQty._sum.qty || 0) - (outQty._sum.qty || 0);
            if (qty > stock) {
                return res.status(400).json({ error: `Stok tidak cukup! Tersedia: ${stock} ${material.unit}` });
            }
        }

        // Auto-generate refNo if not provided
        let finalRefNo = refNo;
        if (!finalRefNo) {
            const prefix = type === 'IN' ? 'PO' : 'WO';
            const year = new Date().getFullYear();
            const count = await prisma.transaction.count({ where: { refNo: { startsWith: prefix } } });
            finalRefNo = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
        }

        const transaction = await prisma.transaction.create({
            data: {
                type,
                date: new Date(date),
                refNo: finalRefNo,
                materialId,
                qty,
                party: party || '-',
                notes: notes || '-',
                createdById: req.user.id,
            },
            include: {
                material: { include: { category: true } },
                createdBy: { select: { fullName: true } },
            },
        });

        res.status(201).json(transaction);
    } catch (err) {
        console.error('Create transaction error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.transaction.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Transaksi berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
