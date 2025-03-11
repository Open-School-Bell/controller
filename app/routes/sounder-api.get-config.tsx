import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  invariant(key)

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true},
    include: {zones: true}
  })

  const schedules = await prisma.schedule.findMany({
    where: {zoneId: {in: sounder.zones.map(({zoneId}) => zoneId)}},
    include: {audio: true}
  })

  const date = new Date()
  date.setHours(0, 0, 0, 0)

  const dayAssignment = await prisma.dayTypeAssignment.findFirst({
    where: {date}
  })

  return Response.json({
    id: sounder.id,
    name: sounder.name,
    day: dayAssignment ? dayAssignment.dayTypeId : 'null',
    ringerPin: sounder.ringerPin,
    screen: sounder.screen,
    schedules: schedules.map(
      ({time, dayTypeId, weekDays, audio}) =>
        `${time}/${audio.fileName}/${dayTypeId}/${weekDays}/${audio.ringerWire}`
    )
  })
}
