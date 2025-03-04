import {Link} from '@remix-run/react'

const DaysDashboard = () => {
  return (
    <div className="border border-gray-200 p-2">
      <Link to="/days/assignments">Assignments</Link>
    </div>
  )
}

export default DaysDashboard
