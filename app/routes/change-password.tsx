import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {checkSession} from '~/lib/session'
import {INPUT_CLASSES} from '~/lib/utils'
import {setSetting} from '~/lib/settings.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const formData = await request.formData()

  const password = formData.get('password') as string | undefined
  const checkPassword = formData.get('confirmPassword') as string | undefined

  invariant(password)
  invariant(checkPassword)

  if (password !== checkPassword) {
    return {error: 'Incorrect Password'}
  }

  await setSetting('password', password)

  return redirect('/')
}

const ChangePassword = () => {
  return (
    <div className="border border-gray-300 p-2">
      <h1>Login</h1>
      <form method="post">
        <label>
          Password
          <input name="password" type="password" className={INPUT_CLASSES} />
        </label>
        <label>
          Confirm Password
          <input
            name="confirmPassword"
            type="password"
            className={INPUT_CLASSES}
          />
        </label>
        <input
          type="submit"
          value="Login"
          className={`${INPUT_CLASSES} bg-green-300 mt-4`}
        />
      </form>
    </div>
  )
}

export default ChangePassword
