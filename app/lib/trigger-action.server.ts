import {type ActionModel} from '../../prisma/generated/prisma/models'

import {broadcast} from './broadcast.server'
import {toggleLockdown} from './lockdown.server'
import {log} from './log.server'

export const triggerAction = async (
  action: ActionModel,
  zone: string | null | undefined,
  source: string,
  callbacks: {onMissingZone: (suppliedZone: string | null | undefined) => void}
) => {
  await log(`🎬 Triggering action ${action.name} from ${source}`)

  switch (action.action) {
    case 'broadcast':
      if (!zone || typeof zone !== 'string' || zone.trim() === '') {
        callbacks.onMissingZone(zone)
        return
      }

      await broadcast(zone, action.data)
      break
    case 'lockdown':
      await toggleLockdown()
      break
    default:
      break
  }
}
