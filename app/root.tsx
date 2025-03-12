import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink
} from '@remix-run/react'
import {type LinksFunction} from '@remix-run/node'

import './tailwind.css'

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

export default function App() {
  return (
    <div className="grid grid-cols-app">
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
    </div>
  )
}
