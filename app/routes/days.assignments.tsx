import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant, asyncForEach} from '@arcath/utils'
import {subDays, format, eachDayOfInterval} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions, HelperText} from '~/lib/ui'
import {useLocalStorage} from '~/lib/hooks/use-local-storage'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Days', 'Assignments')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const dayAssigments = await prisma.dayTypeAssignment.findMany({
    where: {date: {gt: subDays(new Date(), 1)}},
    include: {dayType: true},
    orderBy: {date: 'asc'}
  })

  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})

  return {dayAssigments, days}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const startDate = formData.get('startDate') as string | undefined
  const endDate = formData.get('endDate') as string | undefined
  const day = formData.get('day') as string | undefined

  invariant(startDate)
  invariant(endDate)
  invariant(day)

  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate)
  })

  await asyncForEach(days, async date => {
    await prisma.dayTypeAssignment.create({
      data: {date, dayTypeId: day}
    })
  })

  return redirect(`/days/assignments`)
}

const DayAssignments = () => {
  const {dayAssigments, days} = useLoaderData<typeof loader>()
  const [day, setDay] = useLocalStorage<string>('day', days[0].id)
  const [assignmentDate, setAssignmentDate] = useLocalStorage<string>(
    'assignmentDate',
    format(new Date(), 'yyyy-LL-dd')
  )
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-4">
      <Page title="Day Assignments">
        <HelperText>
          These assignments change the day type for the given days to that day
          types schedule.
        </HelperText>
        <table className="box-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dayAssigments.map(({id, dayType, date}) => {
              return (
                <tr key={id}>
                  <td>{format(date, 'dd/MM/yyyy')}</td>
                  <td>{dayType.name}</td>
                  <td className="text-center">
                    <form
                      method="post"
                      action={`/days/assignments/${id}/delete`}
                    >
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Page>
      <Page title="Add Assignments">
        <form method="post">
          <FormElement
            label="From"
            helperText="The date to start assigning from. To only assign one day set both From and To to the same date."
          >
            <input
              type="date"
              name="startDate"
              className={INPUT_CLASSES}
              defaultValue={assignmentDate}
              onChange={e => {
                setAssignmentDate(e.target.value)
              }}
            />
          </FormElement>
          <FormElement
            label="To"
            helperText="The date to end assignments. To only assign one day set both From and To to the same date."
          >
            <input
              type="date"
              className={INPUT_CLASSES}
              name="endDate"
              defaultValue={assignmentDate}
              onChange={e => {
                setAssignmentDate(e.target.value)
              }}
            />
          </FormElement>
          <FormElement
            label="Day"
            helperText="The day type to assign to these dates"
          >
            <select
              className={INPUT_CLASSES}
              name="day"
              defaultValue={day}
              onChange={e => {
                setDay(e.target.value)
              }}
            >
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
                label: 'Add Assignments',
                color: 'bg-green-300'
              }
            ]}
          />
        </form>
      </Page>
    </div>
  )
}

export default DayAssignments
