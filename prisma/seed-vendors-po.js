const prisma = require('../lib/prisma');

async function main() {
    console.log('🌱 Seeding Vendors and Purchase Orders...');

    // 1. Create Vendors
    const vendorsData = [
        { name: 'PT. Bangun Jaya', contact: 'Bpk. Ahmad', address: 'Jl. Industri No. 12, Jakarta', phone: '021-5551234', email: 'sales@bangunjaya.com' },
        { name: 'TB. Maju Lancar', contact: 'Ibu Siti', address: 'Jl. Raya Barat No. 45, Bandung', phone: '022-4445678', email: 'majulancar@gmail.com' },
        { name: 'CV. Sinar Terang', contact: 'Bpk. Budi', address: 'Kawasan Pergudangan Delta, Surabaya', phone: '031-3339876', email: 'sinar.terang@outlook.com' },
        { name: 'PT. Material Utama', contact: 'Bpk. Kevin', address: 'Sudirman Central Business District, Tangerang', phone: '021-7772222', email: 'contact@materialutama.id' },
    ];

    const vendors = [];
    for (const v of vendorsData) {
        const vendor = await prisma.vendor.upsert({
            where: { name: v.name },
            update: v,
            create: v,
        });
        vendors.push(vendor);
    }
    console.log(`✅ ${vendors.length} Vendors created/updated.`);

    // 2. Get some materials for PO items
    const materials = await prisma.material.findMany({
        take: 20
    });

    if (materials.length === 0) {
        console.error('❌ No materials found. Please run seed.js first.');
        return;
    }

    // 3. Create Purchase Orders
    const poData = [
        {
            poNumber: 'PO/2026/03/001',
            vendorId: vendors[0].id,
            status: 'ORDERED',
            notes: 'Pesanan mendesak untuk proyek KDKMP',
            items: [
                { materialId: materials[0].id, qty: 50, price: materials[0].price || 150000 },
                { materialId: materials[2].id, qty: 100, price: materials[2].price || 130000 },
            ]
        },
        {
            poNumber: 'PO/2026/03/002',
            vendorId: vendors[1].id,
            status: 'RECEIVED',
            notes: 'Sudah diterima dengan baik',
            items: [
                { materialId: materials[1].id, qty: 20, price: materials[1].price || 100000 },
            ]
        },
        {
            poNumber: 'PO/2026/03/003',
            vendorId: vendors[2].id,
            status: 'PENDING',
            notes: 'Menunggu konfirmasi harga',
            items: [
                { materialId: materials[4].id, qty: 200, price: materials[4].price || 50000 },
                { materialId: materials[5].id, qty: 15, price: materials[5].price || 80000 },
                { materialId: materials[6].id, qty: 30, price: materials[6].price || 120000 },
            ]
        },
        {
            poNumber: 'PO/2026/03/004',
            vendorId: vendors[3].id,
            status: 'ORDERED',
            notes: 'Termin pembayaran 30 hari',
            items: [
                { materialId: materials[10].id, qty: 500, price: materials[10].price || 45000 },
            ]
        },
        {
            poNumber: 'PO/2026/03/005',
            vendorId: vendors[0].id,
            status: 'CANCELLED',
            notes: 'Salah input order',
            items: [
                { materialId: materials[15].id, qty: 10, price: materials[15].price || 200000 },
            ]
        }
    ];

    for (const po of poData) {
        // Calculate total amount
        const totalAmount = po.items.reduce((sum, item) => sum + (item.qty * item.price), 0);

        // Use upsert or find then create to avoid duplicates
        const existingPO = await prisma.purchaseOrder.findUnique({
            where: { poNumber: po.poNumber }
        });

        if (existingPO) {
            console.log(`PO ${po.poNumber} already exists, skipping...`);
            continue;
        }

        await prisma.purchaseOrder.create({
            data: {
                poNumber: po.poNumber,
                vendorId: po.vendorId,
                status: po.status,
                totalAmount: totalAmount,
                notes: po.notes,
                items: {
                    create: po.items.map(item => ({
                        materialId: item.materialId,
                        qty: item.qty,
                        price: item.price
                    }))
                }
            }
        });
        console.log(`✅ PO ${po.poNumber} created with ${po.items.length} items.`);
    }

    console.log('🎉 Vendor and PO seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
