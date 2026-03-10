const prisma = require('./lib/prisma');

async function main() {
    try {
        const materialCount = await prisma.material.count();
        const categoryCount = await prisma.category.count();
        const transactionCount = await prisma.transaction.count();
        const userCount = await prisma.user.count();
        const vendorCount = await prisma.vendor.count();
        const poCount = await prisma.purchaseOrder.count();

        console.log('--- Database Status ---');
        console.log('Users:', userCount);
        console.log('Categories:', categoryCount);
        console.log('Materials:', materialCount);
        console.log('Transactions:', transactionCount);
        console.log('Vendors:', vendorCount);
        console.log('Purchase Orders:', poCount);
        console.log('-----------------------');
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
