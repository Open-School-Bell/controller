import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
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

  const webhook = await prisma.outboundWebhook.findFirstOrThrow({
    where: {id: params.webhook}
  })

  return {webhook}
}

const Webhook = () => {
  const {webhook} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('webhooks.outbound.detail.pageTitle')}>
      <div className="box mb-4">
        <p>
          {t('webhooks.outbound.detail.key')}: {webhook.key}
        </p>
        <p>
          {t('webhooks.outbound.detail.target')}: {webhook.target}
        </p>
      </div>
      <Actions
        actions={[
          {
            label: t('button.back'),
            color: 'bg-stone-200',
            onClick: () => navigate('/webhooks')
          },
          {
            label: t('webhooks.outbound.detail.editButton'),
            color: 'bg-blue-300',
            onClick: () => navigate(`/webhooks/outbound/${webhook.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Webhook
