import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirst({
    where: {key}
  })

  if (!button) {
    return Response.json(
      {error: 'key does not belong to button'},
      {status: 400}
    )
  }

  if (button.enrolled) {
    return Response.json({id: button.id, name: button.name})
  }

  await prisma.actionButton.update({
    where: {id: button.id},
    data: {enrolled: true}
  })

  return Response.json({id: button.id, name: button.name})
}
