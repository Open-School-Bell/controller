import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {broadcast} from '~/lib/broadcast.server'
import {startLockdown} from '~/lib/lockdown.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, action, zone} = (await request.json()) as {
    key?: string
    action?: string
    zone?: string
  }

  invariant(key)
  invariant(action)
  invariant(zone)

  const prisma = getPrisma()

  await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true}
  })

  const dbAction = await prisma.action.findFirstOrThrow({
    where: {id: action}
  })

  switch (dbAction.action) {
    case 'broadcast':
      if (dbAction.audioId) {
        await broadcast(zone, dbAction.audioId)
      }
      break
    case 'lockdown':
      await startLockdown()
      break
    default:
      break
  }

  return Response.json({ping: 'pong'})
}
