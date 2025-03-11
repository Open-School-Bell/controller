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

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})

  return Response.json({actions})
}
