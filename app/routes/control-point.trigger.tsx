import {type ActionFunctionArgs} from '@remix-run/node'

import {getSetting} from '~/lib/settings.server'
import {getPrisma} from '~/lib/prisma.server'

import {triggerAction} from '~/lib/trigger-action.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const controlPointKey = await getSetting('controlPointKey')

  if (controlPointKey === '') {
    return Response.json({
      result: 'error',
      error: 'Control Point Key has not been set in the settings.'
    })
  }

  const authHeader = request.headers.get('Auth')

  if (!authHeader) {
    return Response.json({result: 'error', error: 'No key provided.'})
  }

  if (authHeader !== controlPointKey) {
    return Response.json({result: 'error', error: 'Invalid Key provided.'})
  }

  const data = (await request.json()) as {pin: string; zone: string}

  const prisma = getPrisma()

  const action = await prisma.action.findFirst({where: {controlPin: data.pin}})

  if (!action) {
    return Response.json({result: 'error', error: 'No action for this pin'})
  }

  let response = {
    result: 'success',
    message: `${action.icon} ${action.name}`
  }

  await triggerAction(action, data.zone, 'Control Point', {
    onMissingZone: zone => {
      response = {result: 'error', message: 'Zone does not exist'}
    }
  })

  return Response.json(response)
}
