import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'

import {pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, Page} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

const Broadcast = () => {
  const navigate = useNavigate()

  return (
    <Page title="Broadcast" helpLink="/guides/broadcast/">
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `0`}}
        />
      </div>
      <div>
        <div className="box mb-4">
          Broadcast a sound (and its ringer wire) to a given zone or desktop
          group.
        </div>
        <Actions
          actions={[
            {
              label: 'Existing Sound',
              color: 'bg-blue-300',
              onClick: () => navigate('/broadcast/sound')
            },
            {
              label: 'New Text to Speech',
              color: 'bg-blue-300',
              onClick: () => navigate('/broadcast/tts')
            }
          ]}
        />
      </div>
    </Page>
  )
}

export default Broadcast
