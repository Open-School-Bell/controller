import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {triggerAction} from '~/lib/trigger-action.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, action, zone} = (await request.json()) as {
    key?: string
    action?: string
    zone?: string
  }

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  if (!action || typeof action !== 'string') {
    return Response.json({error: 'missing action'}, {status: 400})
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirst({
    where: {key, enrolled: true}
  })

  if (!sounder) {
    return Response.json({error: 'sounder not found'}, {status: 401})
  }

  const dbAction = await prisma.action.findFirst({
    where: {id: action}
  })

  if (!dbAction) {
    return Response.json(
      {result: 'error', error: 'action not found'},
      {status: 404}
    )
  }

  let response: {result: 'error' | 'ok'; error?: string} = {
    result: 'ok'
  }
  let status = 200

  await triggerAction(dbAction, zone, `Sounder: ${sounder.name}`, {
    onMissingZone: () => {
      response = {result: 'error', error: 'Zone not found.'}
      status = 400
    }
  })

  return Response.json(response, {status})
}
