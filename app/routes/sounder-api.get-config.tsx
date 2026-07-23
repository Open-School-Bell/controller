import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {getSettings} from '~/lib/settings.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const {key} = (await request.json()) as {key?: string}

  if (!key || typeof key !== 'string') {
    return Response.json({error: 'missing key'}, {status: 400})
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
    where: {zoneId: {in: sounder.zones.map(({zoneId}) => zoneId)}},
    include: {audio: true}
  })

  const date = new Date()
  date.setHours(0, 0, 0, 0)

  const dayAssignment = await prisma.dayTypeAssignment.findFirst({
    where: {date}
  })

  const {
    lockdownMode,
    lockdownRepeat,
    lockdownEntrySequence,
    lockdownExitSequence,
    lockdownRepeatRingerWire
  } = await getSettings([
    'lockdownEntrySequence',
    'lockdownExitSequence',
    'lockdownMode',
    'lockdownRepeat',
    'lockdownRepeatRingerWire'
  ])

  return Response.json({
    id: sounder.id,
    name: sounder.name,
    day: dayAssignment ? dayAssignment.dayTypeId : 'null',
    ringerPin: sounder.ringerPin,
    screen: sounder.screen,
    schedules: schedules.map(
      ({time, dayTypeId, weekDays, audio, count}) =>
        `${time}/${audio.fileName}/${dayTypeId}/${weekDays}/${audio.ringerWire}/${count}`
    ),
    lockdown: {
      enable: lockdownMode === '1',
      entrySequence: lockdownEntrySequence,
      exitSequence: lockdownExitSequence,
      interval: parseInt(lockdownRepeat),
      repeatRingerWire: lockdownRepeatRingerWire === '1'
    }
  })
}
