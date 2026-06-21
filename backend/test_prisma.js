const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const banners = await prisma.collectionBanner.findMany();
  console.log(banners.map(b => b.mobileImage));
}
main().catch(console.error).finally(() => prisma.$disconnect());
