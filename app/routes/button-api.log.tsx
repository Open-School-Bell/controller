import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, message} = (await request.json()) as {
    key?: string
    message?: string
  }

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  if (!message || typeof message !== 'string') {
    return Response.json({error: 'missing message'}, {status: 400})
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirst({
    where: {key, enrolled: true}
  })

  if (!button) {
    return Response.json({error: 'invalid key'}, {status: 403})
  }

  await prisma.actionButtonLog.create({
    data: {message, actionButtonId: button.id}
  })

  return Response.json({status: 'ok'})
}
