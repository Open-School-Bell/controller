import {asyncForEach} from '@arcath/utils'

import {getPrisma} from './prisma.server'
import {addJob} from './queues.server'

export const updateSounders = async () => {
  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany()

  return asyncForEach(sounders, async ({ip, key}) => {
    //await fetch(`http://${ip}:3000/update`, {}).catch(() => {})
    await addJob('updateConfig', {ip, key})
  })
}
