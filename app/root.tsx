import {Links, Meta, Outlet, Scripts, ScrollRestoration} from '@remix-run/react'
import {type LinksFunction} from '@remix-run/node'
import BellIcon from '@heroicons/react/24/outline/BellIcon'
import BellAlertIcon from '@heroicons/react/24/outline/BellAlertIcon'
import Square3StackIcon from '@heroicons/react/24/outline/Square3Stack3DIcon'
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon'
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon'
import CogIcon from '@heroicons/react/24/outline/Cog6ToothIcon'
import SpeakerIcon from '@heroicons/react/24/outline/SpeakerWaveIcon'
import InfoIcon from '@heroicons/react/24/outline/InformationCircleIcon'
import BoxIcon from '@heroicons/react/24/outline/ArchiveBoxArrowDownIcon'
import ArrowIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon'
import LogoutIcon from '@heroicons/react/24/outline/ArrowRightStartOnRectangleIcon'
import ComputerIcon from '@heroicons/react/24/outline/ComputerDesktopIcon'
import LockClosedIcon from '@heroicons/react/24/outline/LockClosedIcon'
import MusicIcon from '@heroicons/react/24/outline/MusicalNoteIcon'

import './tailwind.css'

import {VERSION} from '~/lib/constants'

import {SidebarLink, NavSep} from './lib/ui'

export const links: LinksFunction = () => []

export function Layout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const App = () => {
  return (
    <div className="grid grid-cols-app min-h-screen grid-rows-app">
      <div className="p-2 flex items-center">
        <img src="/logo.png" className="w-16 mr-4" />
        <span>Open School Bell</span>
      </div>
      <div className="row-span-3 border-gray-300 border rounded-xl my-2 mr-2 shadow-sm bg-white p-2">
        <Outlet />
      </div>
      <div className="border-t border-gray-300">
        <SidebarLink to="/">
          <BellIcon className="w-6 mr-2" /> <span>Dashboard</span>
        </SidebarLink>
        <SidebarLink to="/broadcast">
          <BellAlertIcon className="w-6 mr-2" /> <span>Broadcast</span>
        </SidebarLink>
        <SidebarLink to="/schedule">
          <CalendarIcon className="w-6 mr-2" /> <span>Schedule</span>
        </SidebarLink>
        <SidebarLink to="/days">
          <CalendarDaysIcon className="w-6 mr-2" /> <span>Days</span>
        </SidebarLink>
        <SidebarLink to="/sounders">
          <SpeakerIcon className="w-6 mr-2" /> <span>Sounders</span>
        </SidebarLink>
        <SidebarLink to="/sounds">
          <MusicIcon className="w-6 mr-2" /> <span>Sounds</span>
        </SidebarLink>
        <SidebarLink to="/desktop-groups">
          <ComputerIcon className="w-6 mr-2" /> <span>Desktop Groups</span>
        </SidebarLink>
        <SidebarLink to="/actions">
          <ArrowIcon className="w-6 mr-2" /> <span>Actions</span>
        </SidebarLink>
        <SidebarLink to="/zones">
          <Square3StackIcon className="w-6 mr-2" /> <span>Zones</span>
        </SidebarLink>
        <SidebarLink to="/lockdown">
          <LockClosedIcon className="w-6 mr-2" /> <span>Lockdown</span>
        </SidebarLink>
        <NavSep />
        <SidebarLink to="/settings">
          <CogIcon className="w-6 mr-2" /> <span>Settings</span>
        </SidebarLink>
        <SidebarLink to="/about">
          <InfoIcon className="w-6 mr-2" /> <span>About</span>
        </SidebarLink>
        <SidebarLink to="/backup">
          <BoxIcon className="w-6 mr-2" /> <span>Backup</span>
        </SidebarLink>
        <NavSep />
        <SidebarLink to="/logout">
          <LogoutIcon className="w-6 mr-2" /> <span>Logout</span>
        </SidebarLink>
      </div>
      <div className="text-sm text-gray-400 p-2 text-center">
        &copy; Open School Bell 2025 <br />
        OSB {VERSION}
      </div>
    </div>
  )
}

export default App

/*export default function App() {
  return (
    <div className="grid grid-cols-app min-h-screen grid-rows-app">
      <div className="bg-green-200 p-2 flex items-center">
        <img src="/logo.png" className="w-16 mr-4" />
        <span>Open School Bell</span>
      </div>
      <div className="bg-green-200"></div>
      <div className="bg-gray-300">
        <ul>
          <li>
            <NavLink
              to="/"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/broadcast"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Broadcast
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/zones"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Zones
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/sounders"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Sounders
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/schedule"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Schedules
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/days"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Days
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/sounds"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Sounds
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/actions"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Actions
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/lockdown"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Lockdown
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/desktop-groups"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Desktop Groups
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/change-password"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Change Password
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/backup"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Backup
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/logout"
              className={({isActive}) => {
                return `${isActive ? 'bg-blue-800' : '!text-blue-800'} w-full block p-2`
              }}
            >
              Logout
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="p-4">
        <Outlet />
      </div>
      <div className="bg-gray-100 col-span-2 p-2 text-gray-500">
        &copy; Open School Bell 2025 - OSB {VERSION}
      </div>
    </div>
  )
}*/
