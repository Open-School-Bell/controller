import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {triggerAction} from '~/lib/trigger-action.server'

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

  let response: {result: 'ok' | 'error'; error?: string} = {result: 'ok'}
  let status = 200

  await triggerAction(button.action, zone, `Button ${button.name}`, {
    onMissingZone: () => {
      response = {result: 'error', error: 'missing zone'}
      status = 400

      return
    }
  })

  return Response.json(response, {status})
}
