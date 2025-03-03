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
    where: {zoneId: {in: sounder.zones.map(({zoneId}) => zoneId)}}
  })

  return Response.json({
    id: sounder.id,
    name: sounder.name,
    schedules: schedules.map(
      ({time, audioId, dayTypeId, weekDays}) =>
        `${time}/${audioId}/${dayTypeId}/${weekDays}`
    )
  })
}
