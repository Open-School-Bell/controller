import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, day} = (await request.json()) as {key?: string; day?: string}

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
  }

  if (!day || typeof day !== 'string') {
    return Response.json({error: 'missing day'}, {status: 400})
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirst({
    where: {key, enrolled: true},
    include: {zones: true}
  })

  if (!sounder) {
    return Response.json({error: 'invalid key'}, {status: 403})
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      dayTypeId: day === 'null' ? undefined : day,
      zoneId: {in: sounder.zones.map(({zoneId}) => zoneId)}
    }
  })

  const data = schedules.map(({time, dayTypeId, weekDays, audioSequence}) => {
    return {
      time,
      day: dayTypeId ? dayTypeId : 'null',
      weekDays,
      sequence: audioSequence
    }
  })

  return Response.json(data)
}
