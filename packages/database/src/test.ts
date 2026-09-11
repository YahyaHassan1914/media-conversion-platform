import { prisma } from "./index.js";

const result = await prisma.$queryRaw<{ value: number }[]>`
  SELECT 1 AS value
`;

console.log(result);

await prisma.$disconnect();