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
  return [{title: pageTitle('Sounders')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})

  return {sounders}
}

const Sounders = () => {
  const {sounders} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page
      title={`Sounders (${sounders.length})`}
      helpLink="/docs/configuration/sounders/"
    >
      <div className="box mb-4">
        <table className="box-table">
          <thead>
            <tr>
              <th>Sounder</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sounders.map(({id, name}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/sounders/${id}`}>{name}</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Actions
        actions={[
          {
            label: 'Add Sounder',
            color: 'bg-green-300',
            onClick: () => navigate('/sounders/add')
          }
        ]}
      />
    </Page>
  )
}

export default Sounders
