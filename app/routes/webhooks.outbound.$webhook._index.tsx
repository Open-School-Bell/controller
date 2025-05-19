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

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Webhooks')}]
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

  return (
    <Page title="Outbound Webhook">
      <div className="box mb-4">
        <p>Key: {webhook.key}</p>
        <p>Target: {webhook.target}</p>
      </div>
      <Actions
        actions={[
          {
            label: 'Back',
            color: 'bg-stone-200',
            onClick: () => navigate('/webhooks')
          },
          {
            label: 'Edit',
            color: 'bg-blue-300',
            onClick: () => navigate(`/webhooks/outbound/${webhook.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Webhook
