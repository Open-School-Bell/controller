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

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Webhooks', 'Add')}]
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

  return (
    <Page title="Add Outbound Webhook">
      <form method="post">
        <FormElement label="Target" helperText="The full url of the webhook.">
          <input name="target" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="Event Type"
          helperText="Which actions should trigger this webhook?"
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
              label: 'Cancel',
              onClick: e => {
                e.preventDefault()
                navigate('/webhooks')
              },
              color: 'bg-stone-200'
            },
            {label: 'Add', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddWebhook
