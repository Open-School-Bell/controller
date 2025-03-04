import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, message} = (await request.json()) as {
    key?: string
    message?: string
  }

  invariant(key)
  invariant(message)

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true}
  })

  await prisma.sounderLog.create({data: {message, sounderId: sounder.id}})

  return Response.json({status: 'ok'})
}
