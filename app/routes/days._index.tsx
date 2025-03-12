import {type LoaderFunctionArgs, redirect} from '@remix-run/node'
import {Link} from '@remix-run/react'

import {checkSession} from '~/lib/session'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

const DaysDashboard = () => {
  return (
    <div className="border border-gray-200 p-2">
      <Link to="/days/assignments">Assignments</Link>
    </div>
  )
}

export default DaysDashboard
