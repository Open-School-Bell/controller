import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {broadcast} from '~/lib/broadcast.server'
import {toggleLockdown} from '~/lib/lockdown.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {
    key?: string
  }

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirst({
    where: {key, enrolled: true},
    include: {action: true}
  })

  if (!button) {
    return Response.json({error: 'sounder not found'}, {status: 401})
  }

  const zone = button.zoneId

  switch (button.action.action) {
    case 'broadcast':
      if (!zone || typeof zone !== 'string' || zone.trim() === '') {
        return Response.json({error: 'missing zone'}, {status: 400})
      }

      if (button.action.audioId) {
        const zoneId = zone.trim()
        await broadcast(zoneId, JSON.stringify([button.action.audioId]))
      }
      break
    case 'lockdown':
      await toggleLockdown()
      break
    default:
      break
  }

  return Response.json({ping: 'pong'})
}
