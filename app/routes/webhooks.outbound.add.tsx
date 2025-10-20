import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle, makeKey} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {EVENT_TYPES} from '~/lib/constants'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'webhooks.metaTitle'),
        translate(messages, 'webhooks.outbound.add.metaTitle')
      )
    }
  ]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const target = formData.get('target') as string | undefined
  const event = formData.get('event') as string | undefined

  invariant(target)
  invariant(event)

  const key = makeKey()

  const newWebhook = await prisma.outboundWebhook.create({
    data: {target, key, event}
  })

  return redirect(`/webhooks/outbound/${newWebhook.id}`)
}

const AddWebhook = () => {
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('webhooks.outbound.add.pageTitle')}>
      <form method="post">
        <FormElement
          label={t('webhooks.outbound.form.target.label')}
          helperText={t('webhooks.outbound.form.target.helper')}
        >
          <input name="target" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('webhooks.outbound.form.event.label')}
          helperText={t('webhooks.outbound.form.event.helper')}
        >
          <select name="event" className={INPUT_CLASSES}>
            {EVENT_TYPES.map(event => {
              return (
                <option key={event} value={event}>
                  {event}
                </option>
              )
            })}
          </select>
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              onClick: e => {
                e.preventDefault()
                navigate('/webhooks')
              },
              color: 'bg-stone-200'
            },
            {label: t('webhooks.outbound.add.submit'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddWebhook
