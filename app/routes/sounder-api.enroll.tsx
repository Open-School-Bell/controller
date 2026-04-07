import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirst({
    where: {key}
  })

  if (!sounder) {
    return Response.json(
      {error: 'key does not belong to sounder'},
      {status: 400}
    )
  }

  if (sounder.enrolled) {
    return Response.json({id: sounder.id, name: sounder.name})
  }

  await prisma.sounder.update({where: {id: sounder.id}, data: {enrolled: true}})

  return Response.json({id: sounder.id, name: sounder.name})
}
