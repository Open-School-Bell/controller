import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirstOrThrow({
    where: {key, enrolled: false}
  })

  await prisma.actionButton.update({
    where: {id: button.id},
    data: {enrolled: true}
  })

  return Response.json({id: button.id, name: button.name})
}
