import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {getRedis} from '~/lib/redis.server.mjs'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, version} = (await request.json()) as {
    key?: string
    version?: string
  }

  invariant(key)

  const prisma = getPrisma()
  const redis = getRedis()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true}
  })

  await prisma.sounder.update({
    where: {id: sounder.id},
    data: {lastCheckIn: new Date()}
  })

  if (version) {
    void redis.set(`osb-sounder-version-${sounder.id}`, version)
  }

  return Response.json({ping: 'pong'})
}
