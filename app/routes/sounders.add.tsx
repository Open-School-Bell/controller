import {redirect, type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {makeKey} from '~/lib/utils'

export const action = async ({request}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const key = makeKey()

  const sounder = await prisma.sounder.create({data: {name, key}})

  return redirect(`/sounders/${sounder.id}`)
}

const AddSounder = () => {
  return (
    <div>
      <h2>Add Sounder</h2>
      <form method="post">
        <label>
          Name
          <input
            name="name"
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <input type="submit" value="Add" />
      </form>
    </div>
  )
}

export default AddSounder
