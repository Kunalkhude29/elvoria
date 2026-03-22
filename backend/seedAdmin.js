const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@elvoria.com';
    const plainPassword = 'adminpassword'; // Change this later

    console.log(`Checking for existing admin user (${adminEmail})...`);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log(`✅ Admin user already exists! You can log in with:`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: (your previously set password)`);
        return;
    }

    // Hash the password securely
    console.log('Generating password hash...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Insert into Supabase
    console.log('Creating admin record in the database...');
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('');
    console.log('🎉 Admin user created successfully in Supabase!');
    console.log('-----------------------------------------');
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log('-----------------------------------------');
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
