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
import {SequenceBuilder} from '~/lib/sequence-builder'

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
    lockdownRepeatRingerWire,
    lockdownEntrySequence,
    lockdownExitSequence
  } = await getSettings([
    'lockdownMode',
    'lockdownRepeat',
    'lockdownRepeatRingerWire',
    'lockdownEntrySequence',
    'lockdownExitSequence'
  ])

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {
    lockdownMode,
    lockdownRepeat,
    lockdownRepeatRingerWire,
    lockdownEntrySequence,
    lockdownExitSequence,
    sounds
  }
}

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()

  const lockdownRepeat = formData.get('lockdownRepeat') as string | undefined
  const lockdownEntrySequence = formData.get('lockdownEntrySequence') as
    | string
    | undefined
  const lockdownExitSequence = formData.get('lockdownExitSequence') as
    | string
    | undefined
  const lockdownRepeatRingerWire = !!(formData.get(
    'lockdownRepeatRingerWire'
  ) as string | undefined)
    ? '1'
    : '0'

  invariant(lockdownRepeat)
  invariant(lockdownEntrySequence)
  invariant(lockdownExitSequence)

  await setSetting('lockdownRepeat', lockdownRepeat)
  await setSetting('lockdownRepeatRingerWire', lockdownRepeatRingerWire)
  await setSetting('lockdownEntrySequence', lockdownEntrySequence)
  await setSetting('lockdownExitSequence', lockdownExitSequence)

  return redirect('/lockdown')
}

const Lockdown = () => {
  const {
    lockdownMode,
    lockdownRepeat,
    lockdownRepeatRingerWire,
    lockdownEntrySequence,
    lockdownExitSequence,
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
        <SequenceBuilder
          sounds={sounds}
          initialQueue={JSON.parse(lockdownEntrySequence)}
          name="lockdownEntrySequence"
          label={t('lockdown.field.entrySequence.label')}
          helperText={t('lockdown.field.entrySequence.helper')}
        />
        <SequenceBuilder
          sounds={sounds}
          initialQueue={JSON.parse(lockdownExitSequence)}
          name="lockdownExitSequence"
          label={t('lockdown.field.exitSequence.label')}
          helperText={t('lockdown.field.exitSequence.helper')}
        />
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
