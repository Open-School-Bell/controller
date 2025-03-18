import {asyncForEach} from '@arcath/utils'

import {getSetting, setSetting} from './settings.server'
import {getPrisma} from './prisma.server'

export const startLockdown = async () => {
  await setSetting('lockdownMode', '1')

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany()

  return asyncForEach(sounders, async ({ip, key}) => {
    await fetch(`http://${ip}:3000/update`, {}).catch(() => {})
    await fetch(`http://${ip}:3000/lockdown`, {
      method: 'post',
      body: JSON.stringify({
        key
      }),
      headers: {'Content-Type': 'application/json'}
    }).catch(() => {})
  })
}

export const endLockdown = async () => {
  await setSetting('lockdownMode', '0')

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany()

  return asyncForEach(sounders, async ({ip, key}) => {
    await fetch(`http://${ip}:3000/update`, {}).catch(() => {})
    await fetch(`http://${ip}:3000/lockdown`, {
      method: 'post',
      body: JSON.stringify({
        key
      }),
      headers: {'Content-Type': 'application/json'}
    }).catch(() => {})
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
