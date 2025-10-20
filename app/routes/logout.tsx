import {type ActionFunctionArgs, redirect} from '@remix-run/node'
import {getSession, destroySession} from '~/lib/session'
import {useTranslation} from '~/lib/i18n'

export const action = async ({request}: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session)
    }
  })
}

export default function LogoutRoute() {
  const {t} = useTranslation()
  return (
    <>
      <p>{t('auth.logout.message')}</p>
      <form method="post">
        <button>{t('auth.logout.submit')}</button>
      </form>
    </>
  )
}
