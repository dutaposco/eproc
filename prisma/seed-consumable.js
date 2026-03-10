require('dotenv').config();
const prisma = require('../lib/prisma');

async function main() {
    console.log('🔧 Adding Consumable category & materials...');

    // Get admin user
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });

    // Create Consumable category
    const category = await prisma.category.upsert({
        where: { name: 'Consumable' },
        update: {},
        create: { name: 'Consumable' },
    });
    console.log('✅ Category:', category.name, '(id:', category.id + ')');

    const items = [
        { code: 'CSM-001', name: 'Tang gegep', unit: 'ea', min: 2, qty: 2, price: 0 },
        { code: 'CSM-002', name: 'Pacul', unit: 'ea', min: 2, qty: 2, price: 0 },
        { code: 'CSM-003', name: 'Sekop', unit: 'ea', min: 2, qty: 2, price: 47000 },
        { code: 'CSM-004', name: 'Ember semen', unit: 'ea', min: 5, qty: 5, price: 0 },
        { code: 'CSM-005', name: 'Sendok Semen', unit: 'ea', min: 5, qty: 5, price: 8000 },
        { code: 'CSM-006', name: 'Kawat Bendrat', unit: 'roll', min: 2, qty: 2, price: 350000 },
        { code: 'CSM-007', name: 'Paku', unit: 'kg', min: 5, qty: 10, price: 0 },
        { code: 'CSM-008', name: 'Papan', unit: 'lbr', min: 5, qty: 10, price: 0 },
        { code: 'CSM-009', name: 'Gerobak dorong', unit: 'ea', min: 1, qty: 2, price: 0 },
        { code: 'CSM-010', name: 'Kawat Potong Polos KPB Grade Abu', unit: 'kg', min: 5, qty: 10, price: 0 },
        { code: 'CSM-011', name: 'Kawat Potong Ulir KDE / Grade Abu', unit: 'kg', min: 5, qty: 10, price: 0 },
        { code: 'CSM-012', name: 'Kepala cangkul', unit: 'ea', min: 2, qty: 2, price: 0 },
        { code: 'CSM-013', name: 'Palu kambing haston', unit: 'ea', min: 2, qty: 2, price: 0 },
        { code: 'CSM-014', name: 'Linggis', unit: 'ea', min: 1, qty: 2, price: 0 },
        { code: 'CSM-015', name: 'Selang waterpass', unit: 'ea', min: 1, qty: 2, price: 0 },
        { code: 'CSM-016', name: 'Kunci pipa 12"', unit: 'ea', min: 1, qty: 1, price: 85000 },
        { code: 'CSM-017', name: 'Kaso', unit: 'btg', min: 5, qty: 10, price: 47900 },
        { code: 'CSM-018', name: 'Lampu tembak', unit: 'ea', min: 1, qty: 2, price: 100000 },
        { code: 'CSM-019', name: 'Kaca mata', unit: 'ea', min: 5, qty: 10, price: 15000 },
    ];

    let matCount = 0, txCount = 0;

    for (const item of items) {
        const material = await prisma.material.upsert({
            where: { code: item.code },
            update: {},
            create: {
                code: item.code,
                name: item.name,
                categoryId: category.id,
                unit: item.unit,
                minStock: item.min,
                price: item.price,
                notes: '',
            },
        });
        matCount++;

        if (item.qty > 0) {
            const existing = await prisma.transaction.findFirst({
                where: { materialId: material.id, refNo: 'PO-CSM-001' },
            });
            if (!existing) {
                await prisma.transaction.create({
                    data: {
                        type: 'IN',
                        date: new Date(),
                        refNo: 'PO-CSM-001',
                        materialId: material.id,
                        qty: item.qty,
                        party: 'KDKMP 1 Lokasi',
                        notes: item.price > 0 ? `Harga: Rp ${item.price.toLocaleString('id-ID')}` : '-',
                        createdById: admin.id,
                    },
                });
                txCount++;
            }
        }
    }

    console.log(`✅ Materials added: ${matCount}`);
    console.log(`✅ Transactions added: ${txCount}`);
    console.log('🎉 Consumable seeding done!');
}

main()
    .catch(e => { console.error('❌ Error:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
