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
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {initTranslations} from '~/lib/i18n.server'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'auth.login.metaTitle'))}]
}

export const action = async ({request}: ActionFunctionArgs) => {
  const checkPassword = await getSetting('password')
  const {messages} = initTranslations(request)

  const formData = await request.formData()

  const password = formData.get('password') as string | undefined

  invariant(password)

  if (password !== checkPassword) {
    await trigger('🔒 Bad password supplied', 'ignore')
    return {error: translate(messages, 'auth.login.error')}
  }

  const session = await getSession(request.headers.get('Cookie'))

  session.set('token', jwtCreate())

  await trigger('🔓 Logged in', 'login')

  return redirect('/', {headers: {'Set-Cookie': await commitSession(session)}})
}

const Login = () => {
  const {t} = useTranslation()
  return (
    <Page title={t('auth.login.pageTitle')}>
      <form method="post">
        <FormElement label={t('auth.login.password.label')} helperText="">
          <input name="password" type="password" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[{label: t('auth.login.submit'), color: 'bg-green-300'}]}
        />
      </form>
    </Page>
  )
}

export default Login
