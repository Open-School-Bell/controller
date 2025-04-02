import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getSettings, setSetting} from '~/lib/settings.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Lockdown')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const {ttsSpeed} = await getSettings(['ttsSpeed'])

  return {
    ttsSpeed
  }
}

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()

  const ttsSpeed = formData.get('ttsSpeed') as string | undefined
  const password = formData.get('password') as string | undefined
  const checkPassword = formData.get('confirmPassword') as string | undefined

  invariant(ttsSpeed)

  await setSetting('ttsSpeed', ttsSpeed)

  if (password && checkPassword && password === checkPassword) {
    await setSetting('password', password)
  }

  return redirect('/settings')
}

const Settings = () => {
  const {ttsSpeed} = useLoaderData<typeof loader>()

  return (
    <Page title="Settings">
      <form method="post">
        <FormElement
          label="Text to Speech Speed"
          helperText="Set the speed factor of text to speech generation. Default is 1, lower is faster."
        >
          <input
            type="text"
            name="ttsSpeed"
            className={INPUT_CLASSES}
            defaultValue={ttsSpeed}
          />
        </FormElement>
        <FormElement label="Change Password" helperText="">
          <input
            type="password"
            name="password"
            className={`${INPUT_CLASSES} mb-4`}
          />
          <input
            type="password"
            name="confirmPassword"
            className={INPUT_CLASSES}
          />
        </FormElement>
        <input
          type="submit"
          value="Update"
          className={`${INPUT_CLASSES} bg-green-300`}
        />
      </form>
    </Page>
  )
}

export default Settings
