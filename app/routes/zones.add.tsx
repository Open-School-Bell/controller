import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle, INPUT_CLASSES} from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Zones', 'Add')}]
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

  const name = formData.get('name') as string | undefined

  invariant(name)

  const zone = await prisma.zone.create({data: {name}})

  return redirect(`/zones/${zone.id}`)
}

const AddZone = () => {
  return (
    <div>
      <h2>Add Zone</h2>
      <form method="post">
        <label>
          Name
          <input name="name" className={INPUT_CLASSES} />
        </label>
        <input
          type="submit"
          value="Add"
          className={`${INPUT_CLASSES} bg-green-300 mt-2`}
        />
      </form>
    </div>
  )
}

export default AddZone
