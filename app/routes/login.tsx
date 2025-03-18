import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {getSession, commitSession, jwtCreate} from '~/lib/session'
import {getSetting} from '~/lib/settings.server'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Login')}]
}

export const action = async ({request}: ActionFunctionArgs) => {
  const checkPassword = await getSetting('password')

  const formData = await request.formData()

  const password = formData.get('password') as string | undefined

  invariant(password)

  if (password !== checkPassword) {
    return {error: 'Incorrect Password'}
  }

  const session = await getSession(request.headers.get('Cookie'))

  session.set('token', jwtCreate())

  return redirect('/', {headers: {'Set-Cookie': await commitSession(session)}})
}

const Login = () => {
  return (
    <div className="border border-gray-300 p-2">
      <h1>Login</h1>
      <form method="post">
        <label>
          Password
          <input name="password" type="password" className={INPUT_CLASSES} />
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

export default Login
