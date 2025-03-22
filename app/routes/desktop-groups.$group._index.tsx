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

  const desktopGroup = await prisma.desktopAlertGroup.findFirstOrThrow({
    where: {id: params.group}
  })

  return {desktopGroup}
}

const Day = () => {
  const {desktopGroup} = useLoaderData<typeof loader>()

  return (
    <div className="box">
      <h1>{desktopGroup.name}</h1>
      <p>Key: {desktopGroup.key}</p>
    </div>
  )
}

export default Day
