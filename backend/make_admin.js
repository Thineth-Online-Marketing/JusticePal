const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "sandulrasanjana@gmail.com";
  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" }
  });
  console.log(`Updated ${email} to role: ${user.role}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
