import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {getSetting} from '~/lib/settings.server'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'webhooks.metaTitle'))}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const webhook = await prisma.webhook.findFirstOrThrow({
    where: {id: params.webhook},
    include: {action: true}
  })

  const controllerUrl = await getSetting('enrollUrl')

  return {webhook, controllerUrl}
}

const Webhook = () => {
  const {webhook, controllerUrl} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={webhook.slug}>
      <div className="box mb-4">
        <p>
          {t('webhooks.detail.key')}: {webhook.key}
        </p>
        <p>
          {t('webhooks.detail.action')}{' '}
          <Link to={`/actions/${webhook.actionId}`}>{webhook.action.name}</Link>
        </p>
        <p className="bg-stone-200 p-2 rounded-md">
          {`curl -H 'Content-Type: application/json' -d '{"key": "${webhook.key}"}' -X POST ${controllerUrl}/hook/${webhook.slug}`}
        </p>
        <p>{t('webhooks.detail.broadcastNotice')} </p>
      </div>
      <Actions
        actions={[
          {
            label: t('button.back'),
            color: 'bg-stone-200',
            onClick: () => navigate('/webhooks')
          },
          {
            label: t('webhooks.detail.editButton'),
            color: 'bg-blue-300',
            onClick: () => navigate(`/webhooks/${webhook.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Webhook
