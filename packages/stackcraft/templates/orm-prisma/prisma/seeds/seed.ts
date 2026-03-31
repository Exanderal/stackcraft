import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Example:
  // await prisma.user.create({ data: { email: 'admin@example.com', name: 'Admin' } });
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
