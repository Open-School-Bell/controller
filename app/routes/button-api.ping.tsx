import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {getRedis} from '~/lib/redis.server.mjs'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, version} = (await request.json()) as {
    key?: string
    version?: string
  }

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  const prisma = getPrisma()
  const redis = getRedis()

  const button = await prisma.actionButton.findFirst({
    where: {key, enrolled: true}
  })

  if (!button) {
    return Response.json({error: 'invalid key'}, {status: 403})
  }

  await prisma.actionButton.update({
    where: {id: button.id},
    data: {lastCheckIn: new Date()}
  })

  if (version) {
    void redis.set(`osb-button-version-${button.id}`, version)
  }

  return Response.json({ping: 'pong'})
}
