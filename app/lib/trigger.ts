import {getPrisma} from './prisma.server'
import {addJob} from './queues.server'

import {type EVENT_TYPES} from './constants'

type EventType = (typeof EVENT_TYPES)[number]

export const trigger = async (logMessage: string, event: EventType) => {
  const prisma = getPrisma()

  await prisma.log.create({data: {message: logMessage}})

  const outboundWebhooks = await prisma.outboundWebhook.findMany({
    where: {event}
  })

  outboundWebhooks.forEach(({target, key}) => {
    void addJob('outboundWebhook', {target, key})
  })
}
