import {type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {getSettings} from '~/lib/settings.server'

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

  const {
    lockdownMode,
    lockdownRepeat,
    lockdownEntrySound,
    lockdownExitSound,
    lockdownRepeatRingerWire,
    lockdownRepetitions
  } = await getSettings([
    'lockdownEntrySound',
    'lockdownMode',
    'lockdownRepeat',
    'lockdownExitSound',
    'lockdownRepeatRingerWire',
    'lockdownRepetitions'
  ])

  const entrySound = await prisma.audio.findFirstOrThrow({
    where: {id: lockdownEntrySound}
  })
  const exitSound = await prisma.audio.findFirstOrThrow({
    where: {id: lockdownExitSound}
  })

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
      entrySound: entrySound.fileName,
      entrySoundRingerWire: entrySound.ringerWire,
      exitSound: exitSound.fileName,
      exitSoundRingerWire: exitSound.ringerWire,
      times: parseInt(lockdownRepetitions),
      interval: parseInt(lockdownRepeat),
      repeatRingerWire: lockdownRepeatRingerWire === '1'
    }
  })
}
