import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  invariant(key)

  const prisma = getPrisma()

  await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true}
  })

  const sounds = await prisma.audio.findMany({
    select: {id: true, fileName: true}
  })

  return Response.json(sounds)
}
