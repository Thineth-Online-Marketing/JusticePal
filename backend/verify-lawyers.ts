import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.lawyer.updateMany({
    data: { isVerified: true }
  });
  console.log('Verified lawyers count:', result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
