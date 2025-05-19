import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {subDays, format} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page} from '~/lib/ui'
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

  const date = formData.get('date') as string | undefined
  const day = formData.get('day') as string | undefined

  invariant(date)
  invariant(day)

  await prisma.dayTypeAssignment.create({
    data: {date: new Date(date), dayTypeId: day}
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

  return (
    <Page title="Day Assignments">
      <form method="post">
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
          <tfoot>
            <tr>
              <td>
                <input
                  type="date"
                  className={INPUT_CLASSES}
                  name="date"
                  defaultValue={assignmentDate}
                  onChange={e => {
                    setAssignmentDate(e.target.value)
                  }}
                />
              </td>
              <td>
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
              </td>
              <td>
                <input
                  type="submit"
                  value="Add"
                  className={`${INPUT_CLASSES} bg-green-400`}
                />
              </td>
            </tr>
          </tfoot>
        </table>
      </form>
    </Page>
  )
}

export default DayAssignments
