import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {getSession, commitSession, jwtCreate} from '~/lib/session'
import {getSetting} from '~/lib/settings.server'
import {Page, FormElement, Actions} from '~/lib/ui'
import {trigger} from '~/lib/trigger'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Login')}]
}

export const action = async ({request}: ActionFunctionArgs) => {
  const checkPassword = await getSetting('password')

  const formData = await request.formData()

  const password = formData.get('password') as string | undefined

  invariant(password)

  if (password !== checkPassword) {
    await trigger('🔒 Bad password supplied', 'ignore')
    return {error: 'Incorrect Password'}
  }

  const session = await getSession(request.headers.get('Cookie'))

  session.set('token', jwtCreate())

  await trigger('🔓 Logged in', 'login')

  return redirect('/', {headers: {'Set-Cookie': await commitSession(session)}})
}

const Login = () => {
  return (
    <Page title="Login">
      <form method="post">
        <FormElement label="Password" helperText="">
          <input name="password" type="password" className={INPUT_CLASSES} />
        </FormElement>
        <Actions actions={[{label: 'Login', color: 'bg-green-300'}]} />
      </form>
    </Page>
  )
}

export default Login
