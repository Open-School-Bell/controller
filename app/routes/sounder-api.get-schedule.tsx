import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, day} = (await request.json()) as {key?: string; day?: string}

  invariant(key)
  invariant(day)

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true},
    include: {zones: true}
  })

  const schedules = await prisma.schedule.findMany({
    where: {
      dayTypeId: day === 'null' ? undefined : day,
      zoneId: {in: sounder.zones.map(({zoneId}) => zoneId)}
    }
  })

  const data = schedules.map(({time, dayTypeId, weekDays, audioId, count}) => {
    return {
      time,
      day: dayTypeId ? dayTypeId : 'null',
      weekDays,
      soundId: audioId,
      count
    }
  })

  return Response.json(data)
}
