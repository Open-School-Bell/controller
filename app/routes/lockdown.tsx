import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {getSettings, setSetting} from '~/lib/settings.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Lockdown')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

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

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {
    lockdownMode,
    lockdownRepeat,
    lockdownEntrySound,
    lockdownExitSound,
    lockdownRepeatRingerWire,
    lockdownRepetitions,
    sounds
  }
}

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()

  const lockdownEntrySound = formData.get('lockdownEntrySound') as
    | string
    | undefined
  const lockdownExitSound = formData.get('lockdownExitSound') as
    | string
    | undefined
  const lockdownRepetitions = formData.get('lockdownRepetitions') as
    | string
    | undefined
  const lockdownRepeat = formData.get('lockdownRepeat') as string | undefined
  const lockdownRepeatRingerWire = !!(formData.get(
    'lockdownRepeatRingerWire'
  ) as string | undefined)
    ? '1'
    : '0'

  invariant(lockdownEntrySound)
  invariant(lockdownExitSound)
  invariant(lockdownRepetitions)
  invariant(lockdownRepeat)

  await setSetting('lockdownEntrySound', lockdownEntrySound)
  await setSetting('lockdownExitSound', lockdownExitSound)
  await setSetting('lockdownRepetitions', lockdownRepetitions)
  await setSetting('lockdownRepeat', lockdownRepeat)
  await setSetting('lockdownRepeatRingerWire', lockdownRepeatRingerWire)

  return redirect('/lockdown')
}

const Lockdown = () => {
  const {
    lockdownMode,
    lockdownRepeat,
    lockdownEntrySound,
    lockdownExitSound,
    lockdownRepeatRingerWire,
    lockdownRepetitions,
    sounds
  } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Lockdown</h1>
      <div
        className={`${lockdownMode === '1' ? 'bg-red-300' : 'bg-green-300'} p-2 my-4`}
      >{`${lockdownMode === '1' ? 'Lockdown Active' : 'Lockdown Inactive'} `}</div>
      <form method="post">
        <label>
          Lockdown Start Sound
          <select
            className={INPUT_CLASSES}
            name="lockdownEntrySound"
            defaultValue={lockdownEntrySound}
          >
            {sounds.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </label>
        <label>
          Lockdown End Sound
          <select
            className={INPUT_CLASSES}
            name="lockdownExitSound"
            defaultValue={lockdownExitSound}
          >
            {sounds.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </label>
        <label>
          Repeat Lockdown Start Sound Count
          <input
            type="number"
            name="lockdownRepetitions"
            className={INPUT_CLASSES}
            defaultValue={lockdownRepetitions}
          />
          <span className="text-gray-400">
            How many times should the start of lockdown sound be played, both
            when it starts and on repeats.
          </span>
        </label>
        <label>
          Repeat Lockdown Start Sound interval (minutes).
          <input
            type="number"
            name="lockdownRepeat"
            className={INPUT_CLASSES}
            defaultValue={lockdownRepeat}
          />
          <span className="text-gray-400">
            How often should the start of lockdown sound be repeated.
          </span>
        </label>
        <label>
          Repeat ringer wire on repetitions.
          <input
            type="checkbox"
            name="lockdownRepeatRingerWire"
            className={INPUT_CLASSES}
            defaultChecked={lockdownRepeatRingerWire === '1'}
          />
          <span className="text-gray-400">
            Should the ringer wire be used on repeats?
          </span>
        </label>
        <input
          type="submit"
          value="Update"
          className={`${INPUT_CLASSES} bg-green-300`}
        />
      </form>
    </div>
  )
}

export default Lockdown
