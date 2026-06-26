import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const files = await prisma.caseFile.findMany({
    include: {
      user: {
        select: { name: true, email: true, role: true }
      }
    }
  });
  console.log('--- ALL CASE FILES IN DB ---');
  console.log(JSON.stringify(files, null, 2));
  console.log('----------------------------');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
