const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard
router.get('/', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalMaterials, totalTransactions, inTransactions, outTransactions] = await Promise.all([
            prisma.material.count(),
            prisma.transaction.count(),
            prisma.transaction.aggregate({ where: { type: 'IN' }, _sum: { qty: true } }),
            prisma.transaction.aggregate({ where: { type: 'OUT' }, _sum: { qty: true } }),
        ]);

        const [todayIn, todayOut] = await Promise.all([
            prisma.transaction.aggregate({ where: { type: 'IN', date: { gte: today } }, _sum: { qty: true } }),
            prisma.transaction.aggregate({ where: { type: 'OUT', date: { gte: today } }, _sum: { qty: true } }),
        ]);

        // Recent transactions
        const recentTransactions = await prisma.transaction.findMany({
            include: { material: true, createdBy: { select: { fullName: true } } },
            orderBy: { createdAt: 'desc' },
            take: 6,
        });

        // Low stock materials
        const materials = await prisma.material.findMany({
            include: {
                category: true,
                transactions: { select: { type: true, qty: true } },
            },
        });

        const lowStockItems = materials
            .map(m => {
                const stockIn = m.transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.qty, 0);
                const stockOut = m.transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.qty, 0);
                const stock = stockIn - stockOut;
                return { id: m.id, code: m.code, name: m.name, unit: m.unit, minStock: m.minStock, stock, category: m.category.name };
            })
            .filter(m => m.stock <= m.minStock)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 6);

        res.json({
            stats: {
                totalMaterials,
                totalTransactions,
                totalIn: inTransactions._sum.qty || 0,
                totalOut: outTransactions._sum.qty || 0,
                todayIn: todayIn._sum.qty || 0,
                todayOut: todayOut._sum.qty || 0,
            },
            recentTransactions,
            lowStockItems,
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/dashboard/report
router.get('/report', authMiddleware, async (req, res) => {
    try {
        const { month, year } = req.query;
        const m = parseInt(month);
        const y = parseInt(year);

        const startDate = new Date(y, m, 1);
        const endDate = new Date(y, m + 1, 0, 23, 59, 59);

        const transactions = await prisma.transaction.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            include: { material: true },
        });

        const totalIn = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.qty, 0);
        const totalOut = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.qty, 0);

        // Per material breakdown
        const matMap = {};
        transactions.forEach(t => {
            if (!matMap[t.materialId]) {
                matMap[t.materialId] = { code: t.material.code, name: t.material.name, unit: t.material.unit, in: 0, out: 0 };
            }
            if (t.type === 'IN') matMap[t.materialId].in += t.qty;
            if (t.type === 'OUT') matMap[t.materialId].out += t.qty;
        });

        const details = Object.values(matMap).filter(m => m.in > 0 || m.out > 0);
        const topOut = [...details].sort((a, b) => b.out - a.out).slice(0, 5);

        res.json({ totalIn, totalOut, balance: totalIn - totalOut, details, topOut });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
