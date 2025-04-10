import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate, useSearchParams} from '@remix-run/react'

import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, Page, FormElement} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast', 'Test to Speech')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

const BroadcastSound = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <Page title="Broadcast (Text to Speech)">
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `50%`}}
        />
      </div>
      <form method="post" action="/broadcast/zone">
        <div className="box mb-4">Broadcast Generated!</div>
        <input type="hidden" value={searchParams.get('tts')!} name="sound" />
        <FormElement
          label="Count"
          helperText="How many times should the sound be played?"
        >
          <input
            name="count"
            type="number"
            className={INPUT_CLASSES}
            defaultValue={1}
          />
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
