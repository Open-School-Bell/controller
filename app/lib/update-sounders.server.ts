import {asyncForEach} from '@arcath/utils'

import {getPrisma} from './prisma.server'

export const updateSounders = async () => {
  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany()

  return asyncForEach(sounders, async ({ip}) => {
    await fetch(`http://${ip}:3000/update`, {}).catch(() => {})
  })
}
