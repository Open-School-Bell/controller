import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate, useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, Page, FormElement} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast', 'Sound')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

const BroadcastSound = () => {
  const {sounds} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Broadcast (Existing Sound)">
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `25%`}}
        />
      </div>
      <form method="post" action="/broadcast/zone">
        <FormElement label="Sound" helperText="The sound to be played">
          <select
            name="sound"
            className={INPUT_CLASSES}
            defaultValue={sounds[0].id}
          >
            {sounds.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Back',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {
              label: 'Next',
              color: 'bg-blue-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default BroadcastSound
