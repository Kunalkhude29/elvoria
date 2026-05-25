const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Note: With Supabase Auth, you must first create a user in Supabase Auth Dashboard
    // Then use their ID (UUID) here to grant them ADMIN status in the profiles table.
    
    const adminId = process.argv[2]; // Pass UUID as argument: node seedAdmin.js <UUID>

    if (!adminId) {
        console.error('❌ Please provide the Supabase User UUID as an argument.');
        console.log('Usage: node seedAdmin.js <UUID>');
        return;
    }

    console.log(`Setting role to ADMIN for profile: ${adminId}...`);

    const admin = await prisma.profile.upsert({
        where: { id: adminId },
        update: { role: 'ADMIN' },
        create: {
            id: adminId,
            role: 'ADMIN',
            firstName: 'System',
            lastName: 'Administrator'
        },
    });

    console.log('🎉 Admin role updated successfully!');
    console.log(`👤 ID: ${admin.id}`);
    console.log(`🎖️ Role: ${admin.role}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error creating admin user:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
