import {type LoaderFunctionArgs, redirect} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

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
