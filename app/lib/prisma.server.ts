import {PrismaClient} from '@prisma/client'

declare global {
  // This prevents us from making multiple connections to the db when the
  // require cache is cleared.
  var __prisma: PrismaClient | undefined
}

const prisma = global.__prisma ?? (global.__prisma = new PrismaClient())

export const getPrisma = () => prisma
