import {getPrisma} from './prisma.server'

type EventType = 'action' | 'ignore' | 'lockdownEnd' | 'lockdownStart' | 'login'

export const trigger = async (logMessage: string, event: EventType) => {
  const prisma = getPrisma()

  await prisma.log.create({data: {message: logMessage}})
}
