import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {broadcast} from '~/lib/broadcast.server'
import {toggleLockdown} from '~/lib/lockdown.server'

export const action = async ({request, params}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  const webhook = await prisma.webhook.findFirst({
    where: {slug: params.hook},
    include: {action: true}
  })

  if (!webhook) {
    return {error: `Hook "${params.hook}" not found.`}
  }

  const {key, zone} = (await request.json()) as {key?: string; zone?: string}

  if (!key || key !== webhook.key) {
    return {error: 'Bad Key Provided'}
  }

  switch (webhook.action.action) {
    case 'broadcast':
      if (!zone) {
        return {error: 'No zone provided.'}
      }

      if (webhook.action.audioId) {
        await broadcast(zone, webhook.action.audioId)
      }
      break
    case 'lockdown':
      await toggleLockdown()
      break
    default:
      break
  }

  return {status: 'ok'}
}
