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

  const sounder = await prisma.sounder.findFirst({
    where: {key, enrolled: true}
  })

  if (!sounder) {
    return Response.json({error: 'sounder not found'}, {status: 401})
  }

  await prisma.sounderLog.create({data: {message, sounderId: sounder.id}})

  return Response.json({status: 'ok'})
}
