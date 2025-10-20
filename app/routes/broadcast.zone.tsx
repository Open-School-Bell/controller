import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate, useActionData} from '@remix-run/react'

import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, FormElement, Page} from '~/lib/ui'
import {getPrisma} from '~/lib/prisma.server'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'broadcast.pageTitle'),
        translate(messages, 'broadcast.zone.metaTitle')
      )
    }
  ]
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const queue = formData.get('queue') as string | undefined
  const count = formData.get('count') as string | undefined

  const desktopAlertGroups = await prisma.desktopAlertGroup.findMany({
    orderBy: {name: 'asc'}
  })
  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})

  return {queue, zones, desktopAlertGroups, count}
}

const BroadcastZone = () => {
  const navigate = useNavigate()
  const data = useActionData<typeof action>()
  const {t} = useTranslation()

  if (!data) {
    return <div>{t('common.error')}</div>
  }

  const {queue, zones, count} = data

  return (
    <Page title={t('broadcast.zone.pageTitle')}>
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `75%`}}
        />
      </div>
      <form method="post" action="/broadcast/finish">
        <FormElement
          label={t('broadcast.zone.field.zone.label')}
          helperText={t('broadcast.zone.field.zone.helper')}
        >
          <select name="zone" className={INPUT_CLASSES} defaultValue="_">
            <option value="_">{t('broadcast.zone.noneOption')}</option>
            {zones.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <input type="hidden" name="queue" value={queue} />
        <input type="hidden" name="count" value={count} />
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {
              label: t('broadcast.zone.submit'),
              color: 'bg-green-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default BroadcastZone
