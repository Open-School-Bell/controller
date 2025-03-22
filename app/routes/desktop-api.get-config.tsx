import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  invariant(key)

  const prisma = getPrisma()

  const desktopGroup = await prisma.desktopAlertGroup.findFirstOrThrow({
    where: {key}
  })

  return Response.json({
    group: desktopGroup.id,
    groupName: desktopGroup.name,
    playData: desktopGroup.playData
  })
}
