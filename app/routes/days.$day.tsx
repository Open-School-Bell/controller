import {type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const day = await prisma.dayType.findFirstOrThrow({
    where: {id: params.zone}
  })

  return {day}
}

const Day = () => {
  const {day} = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{day.name}</h1>
    </div>
  )
}

export default Day
