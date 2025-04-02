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

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {
      title: pageTitle(
        'Sounders',
        data ? `Edit ${data.sounder.name}` : 'Edit Sounder'
      )
    }
  ]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder}
  })

  return {sounder}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const ip = formData.get('ip') as string | undefined
  const ringerPin = formData.get('ringer') as string | undefined
  const screen = formData.get('screen') as string | undefined

  invariant(name)
  invariant(ip)
  invariant(ringerPin)

  const sounder = await prisma.sounder.update({
    where: {id: params.sounder},
    data: {name, ip, ringerPin: parseInt(ringerPin), screen: !!screen}
  })

  return redirect(`/sounders/${sounder.id}`)
}

const EditSounder = () => {
  const {sounder} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Edit Sounder">
      <form method="post">
        <FormElement
          label="Name"
          helperText="The descriptive name of the sounder"
        >
          <input
            name="name"
            defaultValue={sounder.name}
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label="IP"
          helperText="The IP address the controller can contact the sounder on."
        >
          <input
            name="ip"
            defaultValue={sounder.ip}
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label="Ringer PIN"
          helperText="The GPIO pin number to activate the ringer wire"
        >
          <input
            name="ringer"
            defaultValue={sounder.ringerPin}
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label="Screen"
          helperText="Enable the screen interface on this sounder? You will need to restart your sounder after changing this option."
        >
          <input
            type="checkbox"
            defaultChecked={sounder.screen}
            name="screen"
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate(`/sounders/${sounder.id}`)
              }
            },
            {label: 'Edit Sounder', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default EditSounder
