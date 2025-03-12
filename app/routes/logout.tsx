import {type ActionFunctionArgs, redirect} from '@remix-run/node'
import {getSession, destroySession} from '~/lib/session'

export const action = async ({request}: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session)
    }
  })
}

export default function LogoutRoute() {
  return (
    <>
      <p>Are you sure you want to log out?</p>
      <form method="post">
        <button>Logout</button>
      </form>
    </>
  )
}
