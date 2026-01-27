require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@shoeshop.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@shoeshop.com',
      password: hashedPassword,
      fullName: 'Admin User',
      phone: '+91-9999999999',
      role: 'ADMIN',
      is_active: true,
      is_email_verified: new Date(),
    },
  });

  console.log('Admin user created successfully:', admin.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
  });
