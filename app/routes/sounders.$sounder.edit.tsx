import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

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

  invariant(name)
  invariant(ip)

  const sounder = await prisma.sounder.update({
    where: {id: params.sounder},
    data: {name, ip}
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
        <input type="submit" value="Edit" />
      </form>
    </div>
  )
}

export default EditSounder
