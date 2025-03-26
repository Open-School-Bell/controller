import {type ActionFunctionArgs, redirect} from '@remix-run/node'

import {checkSession} from '~/lib/session'
import {toggleLockdown} from '~/lib/lockdown.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  await toggleLockdown()

  return redirect('/')
}
