const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            fullName: 'Administrator',
            role: 'ADMIN',
        },
    });

    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await prisma.user.upsert({
        where: { username: 'staff' },
        update: {},
        create: {
            username: 'staff',
            password: staffPassword,
            fullName: 'Staff Gudang',
            role: 'STAFF',
        },
    });

    console.log('✅ Users created:', admin.username, staff.username);

    // Categories
    const categoryNames = [
        'Galian & Urugan', 'Batu & Pasir', 'Dinding', 'Semen',
        'Besi & Tulangan', 'Baja', 'Hollow', 'Sanitair', 'Pintu',
        'Talang', 'Cat', 'Keramik', 'Spandek Roofing', 'Spandek Cladding',
        'Folding Door', 'Saluran Air Bersih', 'Saluran Air Kotor', 'Alat Berat'
    ];

    const categories = {};
    for (const name of categoryNames) {
        const cat = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        categories[name] = cat.id;
    }
    console.log('✅ Categories created:', Object.keys(categories).length);

    // Materials data (KEBUTUHAN MATERIAL KDKMP 1 LOKASI)
    const materialsData = [
        { code: 'GTP-001', name: 'Galian tanah pondasi', category: 'Galian & Urugan', unit: 'm3', min: 10, qty: 120, price: 0, notes: '' },
        { code: 'GTP-002', name: 'Urugan kembali & pemadatan', category: 'Galian & Urugan', unit: 'm3', min: 5, qty: 85, price: 0, notes: '' },
        { code: 'BTU-001', name: 'Batu belah', category: 'Batu & Pasir', unit: 'm3', min: 5, qty: 16, price: 150000, notes: 'Beton sloof 15 m3 18.6' },
        { code: 'BTU-002', name: 'Pasir', category: 'Batu & Pasir', unit: 'm3', min: 5, qty: 55, price: 130000, notes: 'Beton kolom 3 m3 21.2' },
        { code: 'BTU-003', name: 'Batu Split', category: 'Batu & Pasir', unit: 'm3', min: 5, qty: 30, price: 225000, notes: 'Beton ring balok m3 14.4' },
        { code: 'HBL-001', name: 'Hebel', category: 'Dinding', unit: 'm3', min: 5, qty: 80, price: 355000, notes: '355,000 (12.6)' },
        { code: 'BTU-004', name: 'Abu batu', category: 'Batu & Pasir', unit: 'm3', min: 5, qty: 10, price: 165000, notes: 'Beton plate lantai m3 9' },
        { code: 'SMN-001', name: 'Semen Mortar', category: 'Semen', unit: 'zak', min: 10, qty: 30, price: 50000, notes: '' },
        { code: 'SMN-002', name: 'Semen', category: 'Semen', unit: 'zak', min: 10, qty: 585, price: 45000, notes: 'Semen zak 600' },
        { code: 'BES-001', name: 'Wiremesh m8', category: 'Besi & Tulangan', unit: 'ea', min: 2, qty: 2, price: 660000, notes: '' },
        { code: 'BES-002', name: 'Wiremesh m6', category: 'Besi & Tulangan', unit: 'ea', min: 5, qty: 10, price: 330000, notes: '' },
        { code: 'BES-003', name: 'Besi tulangan D13', category: 'Besi & Tulangan', unit: 'btg', min: 10, qty: 350, price: 110000, notes: '' },
        { code: 'BES-004', name: 'Besi polong d12', category: 'Besi & Tulangan', unit: 'btg', min: 5, qty: 0, price: 83000, notes: '' },
        { code: 'BES-005', name: 'Besi tulangan D10', category: 'Besi & Tulangan', unit: 'btg', min: 10, qty: 300, price: 56000, notes: '' },
        { code: 'BES-006', name: 'Besi tulangan D8', category: 'Besi & Tulangan', unit: 'btg', min: 10, qty: 300, price: 56000, notes: '' },
        { code: 'BJ-001', name: 'Kolom CNP 200', category: 'Baja', unit: 'btg', min: 5, qty: 12, price: 409000, notes: '' },
        { code: 'BJ-002', name: 'Cording CNP 100', category: 'Baja', unit: 'btg', min: 5, qty: 200, price: 206000, notes: '' },
        { code: 'HLW-001', name: 'Hollow 40x40', category: 'Hollow', unit: 'btg', min: 10, qty: 250, price: 160000, notes: '' },
        { code: 'HLW-002', name: 'Hollow 40x20', category: 'Hollow', unit: 'btg', min: 5, qty: 12, price: 120000, notes: '' },
        { code: 'HLW-003', name: 'Hollow 100x100', category: 'Hollow', unit: 'btg', min: 2, qty: 4, price: 475000, notes: '' },
        { code: 'HLW-004', name: 'Hollow 40x60', category: 'Hollow', unit: 'btg', min: 2, qty: 6, price: 0, notes: '' },
        { code: 'HLW-005', name: 'Hollow 50x10', category: 'Hollow', unit: 'btg', min: 2, qty: 4, price: 30000, notes: '' },
        { code: 'BJ-003', name: 'L 38x38', category: 'Baja', unit: 'btg', min: 5, qty: 65, price: 18000, notes: '' },
        { code: 'BJ-004', name: 'Plat bar 40', category: 'Baja', unit: 'btg', min: 5, qty: 30, price: 115000, notes: '' },
        { code: 'SNT-001', name: 'Closed jongkok', category: 'Sanitair', unit: 'ea', min: 1, qty: 2, price: 120000, notes: '' },
        { code: 'SNT-002', name: 'Closed duduk + Jet Washer & acc', category: 'Sanitair', unit: 'ea', min: 1, qty: 1, price: 640000, notes: '' },
        { code: 'SNT-003', name: 'Wastafel', category: 'Sanitair', unit: 'ea', min: 1, qty: 2, price: 300000, notes: '' },
        { code: 'PNT-001', name: 'Pintu solid Engineering', category: 'Pintu', unit: 'ea', min: 2, qty: 4, price: 0, notes: '' },
        { code: 'PNT-002', name: 'Pintu PVC / Toilet', category: 'Pintu', unit: 'ea', min: 1, qty: 3, price: 170000, notes: '' },
        { code: 'TLG-001', name: 'Talang Air', category: 'Talang', unit: 'm', min: 5, qty: 64, price: 90000, notes: '' },
        { code: 'CAT-001', name: 'Cat sealer', category: 'Cat', unit: 'Pail', min: 1, qty: 3, price: 35000, notes: '' },
        { code: 'CAT-002', name: 'Cat Interior', category: 'Cat', unit: 'Pail', min: 1, qty: 3, price: 0, notes: '' },
        { code: 'CAT-003', name: 'Cat Girder', category: 'Cat', unit: 'Pail', min: 1, qty: 2, price: 1334750, notes: '' },
        { code: 'CAT-004', name: 'Cat Exterior', category: 'Cat', unit: 'Pail', min: 1, qty: 2, price: 0, notes: '' },
        { code: 'KRM-001', name: 'Keramik Polish', category: 'Keramik', unit: 'lot', min: 5, qty: 157, price: 62000, notes: '220/311' },
        { code: 'KRM-002', name: 'Keramik Unpolish', category: 'Keramik', unit: 'lot', min: 5, qty: 157, price: 40000, notes: '' },
        { code: 'SPK-001', name: 'Spandek Roofing 1m x 6m', category: 'Spandek Roofing', unit: 'sheet', min: 5, qty: 128, price: 122000, notes: '' },
        { code: 'SPK-002', name: 'Spandek Roofing 1m x 2m', category: 'Spandek Roofing', unit: 'sheet', min: 5, qty: 18, price: 0, notes: '' },
        { code: 'SPC-001', name: 'Spandek Cladding 1x6m', category: 'Spandek Cladding', unit: 'sheet', min: 5, qty: 40, price: 243243, notes: '' },
        { code: 'SPC-002', name: 'Spandek Cladding 1x2.5m', category: 'Spandek Cladding', unit: 'sheet', min: 5, qty: 30, price: 81061, notes: '' },
        { code: 'FD-001', name: 'Folding Door 3.15m x 2.4m', category: 'Folding Door', unit: 'set', min: 1, qty: 6, price: 0, notes: '' },
        { code: 'FD-002', name: 'Folding Door 4m x 4m', category: 'Folding Door', unit: 'set', min: 1, qty: 1, price: 0, notes: '' },
        { code: 'JDL-001', name: 'Jendela', category: 'Folding Door', unit: 'ea', min: 1, qty: 4, price: 0, notes: '' },
        { code: 'JDL-002', name: 'Jendela loket', category: 'Folding Door', unit: 'ea', min: 1, qty: 1, price: 0, notes: '' },
        { code: 'SAB-001', name: 'Torent', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 1, price: 1025200, notes: '' },
        { code: 'SAB-002', name: 'Pipe 1" CPVC', category: 'Saluran Air Bersih', unit: 'btg', min: 2, qty: 6, price: 45000, notes: '' },
        { code: 'SAB-003', name: 'Pipe 1/2" CPVC', category: 'Saluran Air Bersih', unit: 'btg', min: 2, qty: 6, price: 20000, notes: '' },
        { code: 'SAB-004', name: 'Pipe 3/4" CPVC', category: 'Saluran Air Bersih', unit: 'btg', min: 2, qty: 6, price: 25000, notes: '' },
        { code: 'SAB-005', name: 'Tee reducir CPVC 1/2" x 3/4"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 2, price: 0, notes: '' },
        { code: 'SAB-006', name: 'Elbow CPVC 90 1/2"', category: 'Saluran Air Bersih', unit: 'ea', min: 2, qty: 2, price: 5000, notes: '' },
        { code: 'SAB-007', name: 'Shock drat elbow 1/2"', category: 'Saluran Air Bersih', unit: 'ea', min: 2, qty: 6, price: 13000, notes: '' },
        { code: 'SAB-008', name: 'Elbow 1 1/4"', category: 'Saluran Air Bersih', unit: 'ea', min: 2, qty: 6, price: 10000, notes: '' },
        { code: 'SAB-009', name: 'Elbow CPVC 90- 3/4"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 2, price: 7000, notes: '' },
        { code: 'SAB-010', name: 'Shock drat 1/2"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 3, price: 16000, notes: '' },
        { code: 'SAB-011', name: 'Reducer 3/4" x 1/2"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 6, price: 3000, notes: '' },
        { code: 'SAB-012', name: 'Vlock Shock 3/4" x 1/2"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 3, price: 8000, notes: '' },
        { code: 'SAB-013', name: 'Elbow 90 1"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 2, price: 0, notes: '' },
        { code: 'SAB-014', name: 'Shock CPVC 1"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 1, price: 0, notes: '' },
        { code: 'SAB-015', name: 'Shock drat luar CPVC 1"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 1, price: 21000, notes: '' },
        { code: 'SAB-016', name: 'Kran air 1"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 1, price: 10000, notes: '' },
        { code: 'SAB-017', name: 'Check valve 3/4" ss', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 2, price: 350000, notes: '' },
        { code: 'SAB-018', name: 'Ball valve PVC 1"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 1, price: 0, notes: '' },
        { code: 'SAB-019', name: 'Shock drat luar CPVC 3/4"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 2, price: 0, notes: '' },
        { code: 'SAB-020', name: 'Selotip pipa', category: 'Saluran Air Bersih', unit: 'box', min: 1, qty: 1, price: 3000, notes: '' },
        { code: 'SAB-021', name: 'Lem CPVC', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 4, price: 8000, notes: '' },
        { code: 'SAB-022', name: 'Elbow 3"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 4, price: 30000, notes: '' },
        { code: 'SAB-023', name: 'Tee 3/4"', category: 'Saluran Air Bersih', unit: 'ea', min: 1, qty: 0, price: 6000, notes: '' },
        { code: 'SAB-024', name: 'Klem pipa 1 1/4" & 3/4"', category: 'Saluran Air Bersih', unit: 'box', min: 1, qty: 1, price: 0, notes: '' },
        { code: 'SAK-001', name: 'Biotank', category: 'Saluran Air Kotor', unit: 'ea', min: 1, qty: 1, price: 0, notes: '' },
        { code: 'SAK-002', name: 'Pipe 4" CPVC', category: 'Saluran Air Kotor', unit: 'btg', min: 2, qty: 10, price: 85000, notes: '' },
        { code: 'SAK-003', name: 'Elbow 90- 4" CPVC', category: 'Saluran Air Kotor', unit: 'ea', min: 2, qty: 8, price: 37000, notes: '' },
        { code: 'SAK-004', name: 'Tee CPVC 4" CPVC', category: 'Saluran Air Kotor', unit: 'ea', min: 1, qty: 3, price: 148000, notes: '' },
        { code: 'SAK-005', name: 'Klem 4"', category: 'Saluran Air Kotor', unit: 'ea', min: 1, qty: 4, price: 10000, notes: '' },
        { code: 'SAK-006', name: 'Lem CPVC (Air Kotor)', category: 'Saluran Air Kotor', unit: 'ea', min: 1, qty: 4, price: 8000, notes: '' },
        { code: 'ALT-001', name: 'Dump truck', category: 'Alat Berat', unit: 'unit', min: 1, qty: 1, price: 0, notes: '1 minggu kurang lebih' },
        { code: 'ALT-002', name: 'Excavator', category: 'Alat Berat', unit: 'unit', min: 1, qty: 1, price: 0, notes: '8 jam x 5 hari' },
    ];

    let materialCount = 0;
    let transactionCount = 0;

    for (const mat of materialsData) {
        const material = await prisma.material.upsert({
            where: { code: mat.code },
            update: {},
            create: {
                code: mat.code,
                name: mat.name,
                categoryId: categories[mat.category],
                unit: mat.unit,
                minStock: mat.min,
                price: mat.price,
                notes: mat.notes,
            },
        });
        materialCount++;

        // Create IN transaction if qty > 0
        if (mat.qty > 0) {
            const existingTx = await prisma.transaction.findFirst({
                where: { materialId: material.id, refNo: 'PO-KDKMP-001' },
            });
            if (!existingTx) {
                await prisma.transaction.create({
                    data: {
                        type: 'IN',
                        date: new Date(),
                        refNo: 'PO-KDKMP-001',
                        materialId: material.id,
                        qty: mat.qty,
                        party: 'KDKMP 1 Lokasi',
                        notes: mat.price > 0 ? `Harga Satuan: Rp ${mat.price.toLocaleString('id-ID')}` : (mat.notes || '-'),
                        createdById: admin.id,
                    },
                });
                transactionCount++;
            }
        }
    }

    console.log(`✅ Materials created: ${materialCount}`);
    console.log(`✅ Transactions created: ${transactionCount}`);
    console.log('🎉 Seed completed!');
}

main()
    .catch(e => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
