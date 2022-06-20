
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const newFlashCard = await prisma.flashCard.create({
    data: {
      description: 'Fullstack tutorial for GraphQL',
      url: 'www.howtographql.com',
      isDone: 'false',
      
    },
  })

    const allFlashCards = await prisma.flashCard.findMany();
    console.log(allFlashCards);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });