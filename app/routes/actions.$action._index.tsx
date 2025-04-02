import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Actions')}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action},
    include: {audio: true}
  })

  return {action}
}

const Action = () => {
  const {action} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title={action.name}>
      <div className="box mb-4">
        <p>Icon: {action.icon}</p>
        <p>Type: {action.action}</p>
        <p>
          Sound:{' '}
          <Link to={`/sounds/${action.audioId}`}>{action.audio!.name}</Link>
        </p>
      </div>
      <Actions
        actions={[
          {
            label: 'Back',
            color: 'bg-stone-200',
            onClick: () => navigate('/actions')
          },
          {
            label: 'Edit',
            color: 'bg-blue-300',
            onClick: () => navigate(`/actions/${action.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Action
