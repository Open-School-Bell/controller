import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import {formatDistance} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {getSetting} from '~/lib/settings.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  invariant(key)

  const prisma = getPrisma()

  await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true}
  })

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})

  return Response.json({
    system: 'ok',
    lockdown: (await getSetting('lockdownMode')) === '1',
    sounders: sounders.map(sounder => {
      return {
        ...sounder,
        lastSeen: formatDistance(new Date(sounder.lastCheckIn), new Date(), {
          addSuffix: true
        }),
        status:
          new Date().getTime() / 1000 - sounder.lastCheckIn.getTime() / 1000 <
          65
            ? '🟢'
            : '🔴'
      }
    })
  })
}
