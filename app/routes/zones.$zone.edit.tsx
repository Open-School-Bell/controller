import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle, INPUT_CLASSES} from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Zones', 'Edit')}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const zone = await prisma.zone.findFirstOrThrow({where: {id: params.zone}})

  return {zone}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const zone = await prisma.zone.update({
    where: {id: params.zone},
    data: {name}
  })

  return redirect(`/zones/${zone.id}`)
}

const AddZone = () => {
  const {zone} = useLoaderData<typeof loader>()

  return (
    <div className="box">
      <h2>Edit Zone</h2>
      <form method="post">
        <label>
          Name
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={zone.name}
          />
        </label>
        <input
          type="submit"
          value="Edit"
          className={`${INPUT_CLASSES} bg-green-300 mt-2`}
        />
      </form>
    </div>
  )
}

export default AddZone
