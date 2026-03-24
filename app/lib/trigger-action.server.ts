import {type Action} from '@prisma/client'

import {broadcast} from './broadcast.server'
import {toggleLockdown} from './lockdown.server'

export const triggerAction = async (action: Action, zone: string) => {
  switch (action.action) {
    case 'broadcast':
      if (!zone || typeof zone !== 'string' || zone.trim() === '') {
        return Response.json({error: 'missing zone'}, {status: 400})
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
