import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: pageTitle('Sounds', data ? data.sound.name : 'View Sound')}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sound = await prisma.audio.findFirstOrThrow({
    where: {id: params.sound}
  })

  return {sound}
}

const Sound = () => {
  const {sound} = useLoaderData<typeof loader>()

  return (
    <div className="box">
      <h1>{sound.name}</h1>
      <Link to={`/sounds/${sound.id}/edit`}>Edit</Link>
      <audio controls>
        <source src={`/sounds/${sound.fileName}`} type="audio/mp3" />
      </audio>
      Ringer Wire: {sound.ringerWire}
    </div>
  )
}

export default Sound
