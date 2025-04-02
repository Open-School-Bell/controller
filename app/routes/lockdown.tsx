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
import {Page, FormElement, Actions} from '~/lib/ui'

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
    lockdownExitRepeat,
    lockdownEntrySound,
    lockdownExitSound,
    lockdownRepeatRingerWire,
    lockdownRepetitions
  } = await getSettings([
    'lockdownEntrySound',
    'lockdownMode',
    'lockdownRepeat',
    'lockdownExitRepeat',
    'lockdownExitSound',
    'lockdownRepeatRingerWire',
    'lockdownRepetitions'
  ])

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {
    lockdownMode,
    lockdownRepeat,
    lockdownExitRepeat,
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
  const lockdownExitRepeat = formData.get('lockdownExitRepeat') as
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
  invariant(lockdownExitRepeat)

  await setSetting('lockdownEntrySound', lockdownEntrySound)
  await setSetting('lockdownExitSound', lockdownExitSound)
  await setSetting('lockdownRepetitions', lockdownRepetitions)
  await setSetting('lockdownExitRepeat', lockdownExitRepeat)
  await setSetting('lockdownRepeat', lockdownRepeat)
  await setSetting('lockdownRepeatRingerWire', lockdownRepeatRingerWire)

  return redirect('/lockdown')
}

const Lockdown = () => {
  const {
    lockdownMode,
    lockdownRepeat,
    lockdownExitRepeat,
    lockdownEntrySound,
    lockdownExitSound,
    lockdownRepeatRingerWire,
    lockdownRepetitions,
    sounds
  } = useLoaderData<typeof loader>()

  return (
    <Page title="Lockdown">
      <div
        className={`${lockdownMode === '1' ? 'bg-red-300' : 'bg-green-300'} p-2 my-4`}
      >{`${lockdownMode === '1' ? 'Lockdown Active' : 'Lockdown Inactive'} `}</div>
      <form method="post">
        <FormElement
          label="Lockdown Start Sound"
          helperText="The sound used to start the lockdown and used on repetitions."
        >
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
        </FormElement>
        <FormElement
          label="Lockdown End Sound"
          helperText="The sound used to end the lockdown"
        >
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
        </FormElement>
        <FormElement
          label="Lockdown Start Count"
          helperText="How many times should the start of lockdown sound be played, both when it starts and on repeats."
        >
          <input
            type="number"
            name="lockdownRepetitions"
            className={INPUT_CLASSES}
            defaultValue={lockdownRepetitions}
          />
        </FormElement>
        <FormElement
          label="Lockdown End Count"
          helperText="How many times should the end of lockdown sound be played."
        >
          <input
            type="number"
            name="lockdownExitRepeat"
            className={INPUT_CLASSES}
            defaultValue={lockdownExitRepeat}
          />
        </FormElement>
        <FormElement
          label="Lockdown Repeat Interval"
          helperText="How often should the start of lockdown sound be repeated in minutes."
        >
          <input
            type="number"
            name="lockdownRepeat"
            className={INPUT_CLASSES}
            defaultValue={lockdownRepeat}
          />
        </FormElement>
        <FormElement
          label="Ringer Wire on Repeat?"
          helperText="Should the ringer wire be triggered on repetitions. Useful to avoid abiguity over number of bells meaning start/end of lockdown"
        >
          <input
            type="checkbox"
            name="lockdownRepeatRingerWire"
            className="ml-2 shadow-xl"
            defaultChecked={lockdownRepeatRingerWire === '1'}
          />
        </FormElement>
        <Actions actions={[{label: 'Update', color: 'bg-green-300'}]} />
      </form>
    </Page>
  )
}

export default Lockdown
