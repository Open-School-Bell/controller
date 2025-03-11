import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES} from '~/lib/utils'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder}
  })

  return {sounder}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
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
    <div>
      <h2>Edit Sounder</h2>
      <form method="post">
        <label>
          Name
          <input
            name="name"
            defaultValue={sounder.name}
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <label>
          IP
          <input
            name="ip"
            defaultValue={sounder.ip}
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <label>
          Ringer PIN
          <input
            name="ringer"
            defaultValue={sounder.ringerPin}
            className="border border-gray-200 rounded-md p-2"
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
          <p>Please restart your sounder after chaning the screen option.</p>
        </label>
        <input type="submit" value="Edit" />
      </form>
    </div>
  )
}

export default EditSounder
