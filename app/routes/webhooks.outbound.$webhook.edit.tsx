import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {EVENT_TYPES} from '~/lib/constants'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Webhooks', 'Add')}]
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

export const action = async ({request, params}: ActionFunctionArgs) => {
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

  const webhook = await prisma.outboundWebhook.update({
    where: {id: params.webhook},
    data: {target, event}
  })

  return redirect(`/webhooks/outbound/${webhook.id}`)
}

const AddWebhook = () => {
  const {webhook} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Edit Outbound Webhook">
      <form method="post">
        <FormElement label="Target" helperText="The full url of the webhook.">
          <input
            name="target"
            className={INPUT_CLASSES}
            defaultValue={webhook.target}
          />
        </FormElement>
        <FormElement
          label="Event Type"
          helperText="Which actions should trigger this webhook?"
        >
          <select
            name="event"
            className={INPUT_CLASSES}
            defaultValue={webhook.event}
          >
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
              label: 'Cancel',
              onClick: e => {
                e.preventDefault()
                navigate('/webhooks')
              },
              color: 'bg-stone-200'
            },
            {label: 'Edit', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddWebhook
