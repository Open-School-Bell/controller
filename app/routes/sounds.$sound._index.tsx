import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'

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
  const navigate = useNavigate()

  return (
    <Page title={sound.name}>
      <div className="box mb-4">
        <audio controls>
          <source src={`/sounds/${sound.fileName}`} type="audio/mp3" />
        </audio>
        <p>Ringer Wire: {sound.ringerWire}</p>
      </div>
      <Actions
        actions={[
          {
            label: 'Back',
            color: 'bg-stone-200',
            onClick: () => navigate('/sounds')
          },
          {
            label: 'Edit Sound',
            color: 'bg-blue-300',
            onClick: () => navigate(`/sounds/${sound.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Sound
