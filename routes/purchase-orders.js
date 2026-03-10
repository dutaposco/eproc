const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/purchase-orders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search, status } = req.query;
        const where = {};

        if (status) where.status = status;
        if (search) {
            where.OR = [
                { poNumber: { contains: search, mode: 'insensitive' } },
                { vendor: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const pos = await prisma.purchaseOrder.findMany({
            where,
            include: {
                vendor: { select: { name: true } },
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(pos);
    } catch (err) {
        console.error('Get POs error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// GET /api/purchase-orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                vendor: true,
                items: {
                    include: { material: true }
                }
            },
        });
        if (!po) return res.status(404).json({ error: 'PO tidak ditemukan' });
        res.json(po);
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// POST /api/purchase-orders
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { vendorId, date, status, notes, items } = req.body;

        if (!vendorId || !items || items.length === 0) {
            return res.status(400).json({ error: 'Vendor dan item wajib diisi' });
        }

        // Generate PO Number
        const count = await prisma.purchaseOrder.count();
        const poNumber = `PO-${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`;

        const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

        const po = await prisma.purchaseOrder.create({
            data: {
                poNumber,
                vendorId: parseInt(vendorId),
                date: date ? new Date(date) : new Date(),
                status: status || 'PENDING',
                notes: notes || '',
                totalAmount,
                items: {
                    create: items.map(item => ({
                        materialId: parseInt(item.materialId),
                        qty: parseInt(item.qty),
                        price: parseFloat(item.price)
                    }))
                }
            },
            include: { items: true }
        });

        res.status(201).json(po);
    } catch (err) {
        console.error('Create PO error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

// PUT /api/purchase-orders/:id/status
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const poId = parseInt(req.params.id);

        const po = await prisma.purchaseOrder.update({
            where: { id: poId },
            data: { status },
            include: { items: true, vendor: true }
        });

        // If status changed to RECEIVED, create IN transactions automatically
        if (status === 'RECEIVED') {
            for (const item of po.items) {
                await prisma.transaction.create({
                    data: {
                        type: 'IN',
                        date: new Date(),
                        refNo: po.poNumber,
                        materialId: item.materialId,
                        vendorId: po.vendorId,
                        qty: item.qty,
                        party: po.vendor.name,
                        notes: `Otomatis dari ${po.poNumber}`,
                        createdById: req.user.id
                    }
                });
            }
        }

        res.json(po);
    } catch (err) {
        console.error('Update PO status error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
