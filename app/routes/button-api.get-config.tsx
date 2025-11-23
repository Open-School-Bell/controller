import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {getSettings} from '~/lib/settings.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirst({
    where: {key, enrolled: true}
  })

  if (!button) {
    return Response.json({error: 'invalid key'}, {status: 403})
  }

  const {lockdownMode} = await getSettings(['lockdownMode'])

  return Response.json({
    name: button.name,
    id: button.id,
    ledPin: button.ledPin,
    buttonPin: button.buttonPin,
    holdDuration: button.holdDuration,
    cancelDuration: button.cancelDuration,
    lockdown: lockdownMode === '1'
  })
}
