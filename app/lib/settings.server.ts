import {asyncForEach} from '@arcath/utils'
import {getPrisma} from './prisma.server'

type SettingKey =
  | 'lockdownRepeat'
  | 'lockdownMode'
  | 'lockdownRepeatRingerWire'
  | 'password'
  | 'ttsSpeed'
  | 'enrollUrl'
  | 'controlPointKey'
  | 'controlPointDefaultZone'
  | 'ttsLastSeen'
  | 'workerLastSeen'
  | 'lockdownEntrySequence'
  | 'lockdownExitSequence'

export const DEFAULT_SETTINGS: {[setting in SettingKey]: string} = {
  lockdownRepeat: '5',
  lockdownRepeatRingerWire: '0',
  lockdownMode: '0',
  password: 'bell',
  ttsSpeed: '1',
  enrollUrl: 'http://controller:3000',
  controlPointKey: '',
  controlPointDefaultZone: '',
  ttsLastSeen: '"1970-01-01T23:00:00.000Z"',
  workerLastSeen: '"1970-01-01T23:00:00.000Z"',
  lockdownEntrySequence: '[]',
  lockdownExitSequence: '[]'
}

export const getSetting = async (setting: SettingKey) => {
  const prisma = getPrisma()

  const dbSetting = await prisma.setting.findFirst({where: {key: setting}})

  if (dbSetting === null) {
    return DEFAULT_SETTINGS[setting]
  }

  return dbSetting.value
}

export const getSettings = async <RequestedKey extends SettingKey>(
  settings: RequestedKey[]
) => {
  const results = Object.fromEntries(settings.map(v => [v, ''])) as {
    [key in RequestedKey]: string
  }

  await asyncForEach(settings, async setting => {
    results[setting] = await getSetting(setting)
  })

  return results
}

export const setSetting = async (setting: SettingKey, value: string) => {
  const prisma = getPrisma()

  await prisma.setting.upsert({
    where: {key: setting},
    create: {key: setting, value},
    update: {value}
  })
}
