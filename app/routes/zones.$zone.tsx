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

  const zone = await prisma.zone.findFirstOrThrow({
    where: {id: params.zone},
    include: {sounders: {include: {sounder: true}}}
  })

  return {zone}
}

const Zone = () => {
  const {zone} = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{zone.name}</h1>
      <h2>Sounders</h2>
      <ul>
        {zone.sounders.map(({sounder}) => {
          return <li key={sounder.id}>{sounder.name}</li>
        })}
      </ul>
    </div>
  )
}

export default Zone
