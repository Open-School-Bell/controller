import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  invariant(key)

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: false}
  })

  await prisma.sounder.update({where: {id: sounder.id}, data: {enrolled: true}})

  return Response.json({id: sounder.id, name: sounder.name})
}
