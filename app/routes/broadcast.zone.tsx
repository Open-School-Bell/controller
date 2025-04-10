import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate, useActionData} from '@remix-run/react'

import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, FormElement, Page} from '~/lib/ui'
import {getPrisma} from '~/lib/prisma.server'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast', 'Zone')}]
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const sound = formData.get('sound') as string | undefined
  const count = formData.get('count') as string | undefined

  const desktopAlertGroups = await prisma.desktopAlertGroup.findMany({
    orderBy: {name: 'asc'}
  })
  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})

  return {sound, zones, desktopAlertGroups, count}
}

const BroadcastZone = () => {
  const navigate = useNavigate()
  const data = useActionData<typeof action>()

  if (!data) {
    return <div>ERROR</div>
  }

  const {sound, zones, desktopAlertGroups, count} = data

  return (
    <Page title="Broadcast (Zone)">
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `75%`}}
        />
      </div>
      <form method="post" action="/broadcast/finish">
        <FormElement
          label="Zone"
          helperText="The sounder zone to broadcast the sound to."
        >
          <select name="zone" className={INPUT_CLASSES} defaultValue="_">
            <option value="_">None</option>
            {zones.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <FormElement
          label="Desktop Group"
          helperText="The desktop group to broadcast the sound to."
        >
          <select
            name="desktopGroup"
            className={INPUT_CLASSES}
            defaultValue="_"
          >
            <option value="_">None</option>
            {desktopAlertGroups.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <input type="hidden" name="sound" value={sound} />
        <input type="hidden" name="count" value={count} />
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {
              label: 'Broadcast!',
              color: 'bg-green-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default BroadcastZone
