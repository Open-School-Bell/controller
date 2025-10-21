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
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'lockdown.metaTitle'))}]
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
  const {t} = useTranslation()

  return (
    <Page title={t('lockdown.pageTitle')}>
      <div
        className={`${lockdownMode === '1' ? 'bg-red-300' : 'bg-green-300'} p-2 my-4`}
      >
        {lockdownMode === '1'
          ? t('lockdown.status.active')
          : t('lockdown.status.inactive')}{' '}
      </div>
      <form method="post">
        <FormElement
          label={t('lockdown.field.entrySound.label')}
          helperText={t('lockdown.field.entrySound.helper')}
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
          label={t('lockdown.field.exitSound.label')}
          helperText={t('lockdown.field.exitSound.helper')}
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
          label={t('lockdown.field.startCount.label')}
          helperText={t('lockdown.field.startCount.helper')}
        >
          <input
            type="number"
            name="lockdownRepetitions"
            className={INPUT_CLASSES}
            defaultValue={lockdownRepetitions}
          />
        </FormElement>
        <FormElement
          label={t('lockdown.field.exitCount.label')}
          helperText={t('lockdown.field.exitCount.helper')}
        >
          <input
            type="number"
            name="lockdownExitRepeat"
            className={INPUT_CLASSES}
            defaultValue={lockdownExitRepeat}
          />
        </FormElement>
        <FormElement
          label={t('lockdown.field.repeatInterval.label')}
          helperText={t('lockdown.field.repeatInterval.helper')}
        >
          <input
            type="number"
            name="lockdownRepeat"
            className={INPUT_CLASSES}
            defaultValue={lockdownRepeat}
          />
        </FormElement>
        <FormElement
          label={t('lockdown.field.repeatRinger.label')}
          helperText={t('lockdown.field.repeatRinger.helper')}
        >
          <input
            type="checkbox"
            name="lockdownRepeatRingerWire"
            className="ml-2 shadow-xl"
            defaultChecked={lockdownRepeatRingerWire === '1'}
          />
        </FormElement>
        <Actions actions={[{label: t('button.save'), color: 'bg-green-300'}]} />
      </form>
    </Page>
  )
}

export default Lockdown
