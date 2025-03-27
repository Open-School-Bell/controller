import {asyncForEach} from '@arcath/utils'

import {getPrisma} from './prisma.server'
import {addJob} from './queues.server'

export const updateSounders = async () => {
  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany()

  return asyncForEach(sounders, async ({ip, key}) => {
    await addJob('updateConfig', {ip, key})
  })
}
