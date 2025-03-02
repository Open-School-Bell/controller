import {type LoaderFunction} from '@remix-run/node'
import {Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader: LoaderFunction = async () => {
  const prisma = getPrisma()

  return {}
}

const Schedule = () => {
  return (
    <div className="grid grid-cols-7 gap-4">
      <div className="border border-gray-400 p-2">DATE</div>
      <div className="border border-gray-400 p-2 col-span-6">
        <Link to={`/schedule/add`}>Add</Link>
      </div>
      <div className="border border-gray-400 p-2">Monday</div>
      <div className="border border-gray-400 p-2">Tuesday</div>
      <div className="border border-gray-400 p-2">Wednesday</div>
      <div className="border border-gray-400 p-2">Thursday</div>
      <div className="border border-gray-400 p-2">Friday</div>
      <div className="border border-gray-400 p-2">Saturday</div>
      <div className="border border-gray-400 p-2">Sunday</div>
      <div className="border border-gray-400 h-[48vh] relative">
        <ul>
          {[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24
          ].map(i => {
            return (
              <li
                key={i}
                className="absolute border-b border-gray-200 w-full h-[2vh]"
                style={{top: `${i * 2 - 2}vh`}}
              >
                {i.toString().padStart(2, '0')}:00
              </li>
            )
          })}
        </ul>
      </div>
      <div className="border border-gray-400 h-[48vh]"></div>
      <div className="border border-gray-400 h-[48vh]"></div>
      <div className="border border-gray-400 h-[48vh]"></div>
      <div className="border border-gray-400 h-[48vh]"></div>
      <div className="border border-gray-400 h-[48vh]"></div>
      <div className="border border-gray-400 h-[48vh]"></div>
    </div>
  )
}

export default Schedule
