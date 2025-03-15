import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'

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

  return (
    <div className="box">
      <h2>Edit Sounder</h2>
      <form method="post">
        <label>
          Name
          <input
            name="name"
            defaultValue={sounder.name}
            className={INPUT_CLASSES}
          />
        </label>
        <label>
          IP
          <input
            name="ip"
            defaultValue={sounder.ip}
            className={INPUT_CLASSES}
          />
        </label>
        <label>
          Ringer PIN
          <input
            name="ringer"
            defaultValue={sounder.ringerPin}
            className={INPUT_CLASSES}
          />
        </label>
        <label>
          Screen
          <input
            type="checkbox"
            className={INPUT_CLASSES}
            defaultChecked={sounder.screen}
            name="screen"
          />
          <p>Please restart your sounder after changing the screen option.</p>
        </label>
        <input
          type="submit"
          value="Edit"
          className={`${INPUT_CLASSES} mt-2 bg-green-300`}
        />
      </form>
    </div>
  )
}

export default EditSounder
