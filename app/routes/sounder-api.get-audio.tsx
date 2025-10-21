import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirst({
    where: {key, enrolled: true}
  })

  if (!sounder) {
    return Response.json({error: 'invalid key'}, {status: 403})
  }

  const sounds = await prisma.audio.findMany({
    select: {id: true, fileName: true}
  })

  return Response.json(sounds)
}
