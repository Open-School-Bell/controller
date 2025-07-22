import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useNavigate, useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {INPUT_CLASSES} from '~/lib/utils'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})

  return {days}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const copyFrom = formData.get('copyFrom') as string | undefined

  invariant(name)
  invariant(copyFrom)

  const dayType = await prisma.dayType.create({data: {name}})

  if (copyFrom !== '-') {
    const schedules = await prisma.schedule.findMany({
      where: {dayTypeId: copyFrom === '_' ? undefined : copyFrom}
    })

    await prisma.schedule.createMany({
      data: schedules.map(({time, weekDays, zoneId, audioId}) => {
        return {dayTypeId: dayType.id, time, weekDays, zoneId, audioId}
      })
    })
  }

  return redirect(`/calendar`)
}

const AddDay = () => {
  const navigate = useNavigate()
  const {days} = useLoaderData<typeof loader>()

  return (
    <Page title="Add Day">
      <form method="post">
        <FormElement label="Name" helperText="Descriptive name for the day.">
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="Copy From"
          helperText="The day type to copy the schedule from"
        >
          <select name="copyFrom" className={INPUT_CLASSES}>
            <option value="-" selected>
              None
            </option>
            <option value="_">Default</option>
            {days.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/calendar')
              }
            },
            {
              label: 'Add Day',
              color: 'bg-green-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default AddDay
