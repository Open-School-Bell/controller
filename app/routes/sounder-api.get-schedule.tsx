import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key, day} = (await request.json()) as {key?: string; day?: string}

  invariant(key)
  invariant(day)

  const prisma = getPrisma()

  const schedules = await prisma.schedule.findMany({
    where: {dayTypeId: day === 'null' ? undefined : day}
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
