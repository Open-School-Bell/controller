import {asyncForEach} from '@arcath/utils'

import {getSetting, setSetting} from './settings.server'
import {getPrisma} from './prisma.server'
import {addJob} from './queues.server'
import {trigger} from './trigger'

export const startLockdown = async () => {
  await setSetting('lockdownMode', '1')

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany()

  await trigger('🔐 Lockdown Start', 'lockdownStart')

  return asyncForEach(sounders, async ({ip, key}) => {
    await addJob('lockdown', {ip, key})
  })
}

export const endLockdown = async () => {
  await setSetting('lockdownMode', '0')

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany()

  await trigger('🔐 Lockdown End', 'lockdownEnd')

  return asyncForEach(sounders, async ({ip, key}) => {
    await addJob('lockdown', {ip, key})
  })
}

export const toggleLockdown = async () => {
  const lockdownMode = await getSetting('lockdownMode')

  if (lockdownMode === '0') {
    await startLockdown()
  } else {
    await endLockdown()
  }
}
