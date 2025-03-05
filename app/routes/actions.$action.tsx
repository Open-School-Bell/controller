import {type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action}
  })

  return {action}
}

const Action = () => {
  const {action} = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{action.name}</h1>
    </div>
  )
}

export default Action
