import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {Form, useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getSettings, setSetting} from '~/lib/settings.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {getPrisma} from '~/lib/prisma.server'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'settings.pageTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const {
    ttsSpeed,
    enrollUrl,
    controlPointKey,
    controlPointDefaultZone,
    siteName
  } = await getSettings([
    'ttsSpeed',
    'enrollUrl',
    'controlPointKey',
    'controlPointDefaultZone',
    'siteName'
  ])

  const zones = await prisma.zone.findMany({
    select: {id: true, name: true},
    orderBy: {name: 'asc'}
  })

  return {
    ttsSpeed,
    enrollUrl,
    controlPointKey,
    controlPointDefaultZone,
    zones,
    siteName
  }
}

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()

  const enrollUrl = formData.get('enrollUrl') as string | undefined
  const ttsSpeed = formData.get('ttsSpeed') as string | undefined
  const password = formData.get('password') as string | undefined
  const checkPassword = formData.get('confirmPassword') as string | undefined
  const controlPointKey = (formData.get('controlPointKey') as
    | string
    | undefined)
    ? (formData.get('controlPointKey') as string | undefined)
    : ''
  const controlPointDefaultZone = formData.get('controlPointDefaultZone') as
    | string
    | undefined
  const siteName = formData.get('siteName') as string | undefined

  invariant(enrollUrl)
  invariant(ttsSpeed)
  invariant(controlPointKey)
  invariant(controlPointDefaultZone)
  invariant(siteName)

  await setSetting('enrollUrl', enrollUrl)
  await setSetting('ttsSpeed', ttsSpeed)
  await setSetting('controlPointKey', controlPointKey)
  await setSetting('controlPointDefaultZone', controlPointDefaultZone)
  await setSetting('siteName', siteName)

  if (password && checkPassword && password === checkPassword) {
    await setSetting('password', password)
  }

  return redirect('/settings')
}

const Settings = () => {
  const {
    ttsSpeed,
    enrollUrl,
    controlPointKey,
    controlPointDefaultZone,
    zones,
    siteName
  } = useLoaderData<typeof loader>()
  const {t} = useTranslation()

  return (
    <Page title={t('settings.pageTitle')}>
      <form method="post">
        <FormElement
          label={t('settings.siteName.label')}
          helperText={t('settings.siteName.helper')}
        >
          <input
            type="text"
            name="siteName"
            className={INPUT_CLASSES}
            defaultValue={siteName}
          />
        </FormElement>
        <FormElement
          label={t('settings.controllerUrl.label')}
          helperText={t('settings.controllerUrl.helper')}
        >
          <input
            type="text"
            name="enrollUrl"
            className={INPUT_CLASSES}
            defaultValue={enrollUrl}
          />
        </FormElement>
        <FormElement
          label={t('settings.ttsSpeed.label')}
          helperText={t('settings.ttsSpeed.helper')}
        >
          <input
            type="text"
            name="ttsSpeed"
            className={INPUT_CLASSES}
            defaultValue={ttsSpeed}
          />
        </FormElement>
        <FormElement
          label={t('settings.controlPointKey.label')}
          helperText={t('settings.controlPointKey.helper')}
        >
          <input
            type="text"
            name="controlPointKey"
            className={INPUT_CLASSES}
            defaultValue={controlPointKey}
          />
        </FormElement>
        <FormElement
          label={t('settings.controlPointDefaultZone.label')}
          helperText={t('settings.controlPointDefaultZone.helper')}
        >
          <select
            className={INPUT_CLASSES}
            name="controlPointDefaultZone"
            defaultValue={controlPointDefaultZone}
          >
            {zones.map(({id, name}) => {
              return <option value={id}>{name}</option>
            })}
          </select>
        </FormElement>
        <FormElement
          label={t('settings.password.label')}
          helperText={t('settings.password.helper')}
        >
          <input
            type="password"
            name="password"
            className={`${INPUT_CLASSES} mb-4`}
            placeholder={t('settings.password.placeholderNew')}
          />
          <input
            type="password"
            name="confirmPassword"
            className={INPUT_CLASSES}
            placeholder={t('settings.password.placeholderConfirm')}
          />
        </FormElement>
        <input
          type="submit"
          value={t('button.save')}
          className={`${INPUT_CLASSES} bg-green-300`}
        />
      </form>
    </Page>
  )
}

export default Settings
