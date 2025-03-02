import {type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sound = await prisma.audio.findFirstOrThrow({
    where: {id: params.sound}
  })

  return {sound}
}

const Sound = () => {
  const {sound} = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{sound.name}</h1>
      <audio controls>
        <source src={`/sounds/${sound.fileName}`} type="audio/mp3" />
      </audio>
    </div>
  )
}

export default Sound
