import {type LoaderFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {VERSION} from '~/lib/constants'
import {getSettings} from '~/lib/settings.server'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const {lockdownMode} = await getSettings(['lockdownMode'])

  const sounders = await prisma.sounder.findMany({
    select: {id: true, name: true, lastCheckIn: true, enrolled: true, ip: true}
  })
  const zones = await prisma.zone.findMany()

  const date = new Date()
  date.setHours(0, 0, 0, 0)

  const dayAssignment = await prisma.dayTypeAssignment.findFirst({
    where: {date},
    include: {dayType: true}
  })

  return Response.json({
    day: dayAssignment ? dayAssignment.dayType.name : 'Normal',
    lockdown: lockdownMode === '1',
    sounders,
    version: VERSION,
    zones
  })
}
