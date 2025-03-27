import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  invariant(key)

  const prisma = getPrisma()

  await prisma.sounder.findFirstOrThrow({
    where: {key, enrolled: true}
  })

  const date = new Date()
  date.setHours(0, 0, 0, 0)

  const dayAssignment = await prisma.dayTypeAssignment.findFirst({
    where: {date}
  })

  const dayTypeId = dayAssignment ? dayAssignment.dayTypeId : null

  const schedules = await prisma.schedule.findMany({
    where: {dayTypeId},
    orderBy: {time: 'asc'}
  })

  let dayType = 'Default'
  if (dayTypeId) {
    const dayTypeDb = await prisma.dayType.findFirstOrThrow({
      where: {id: dayTypeId}
    })

    dayType = dayTypeDb.name
  }

  return Response.json({schedules, dayType})
}
