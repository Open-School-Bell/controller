import {getPrisma} from './prisma.server'

export const log = async (message: string) => {
  const prisma = getPrisma()

  await prisma.log.create({data: {message}})
}
