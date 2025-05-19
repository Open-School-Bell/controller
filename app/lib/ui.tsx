import {NavLink} from '@remix-run/react'

import {docsLink} from './utils'

export const SidebarLink: React.FC<{
  to: string
  children: React.ReactNode
}> = ({to, children}) => {
  return (
    <NavLink
      to={to}
      className={({isActive}) => {
        return `!text-gray-500 flex items-center border-l-6 pl-2 my-2 transition ${isActive ? `border-l-white font-semibold` : `border-l-stone-200 hover:border-l-stone-300`}`
      }}
    >
      {children}
    </NavLink>
  )
}

export const NavSep = () => {
  return <div className="border-t-gray-300 border-t my-4" />
}

export const Page: React.FC<{
  children: React.ReactNode
  title: string
  wide?: boolean
  helpLink?: string
}> = ({title, wide, children, helpLink}) => {
  return (
    <div className={`grid ${wide ? 'grid-cols-wide' : 'grid-cols-narrow'}`}>
      <div className="col-start-2">
        <h1 className="font-light mb-2 pb-2 border-b-stone-200 border-b">
          {title}
          {helpLink ? (
            <span className="float-right text-base pt-3">
              <a href={docsLink(helpLink)} target="_blank">
                📖 Docs
              </a>
            </span>
          ) : (
            ''
          )}
        </h1>
        {children}
      </div>
    </div>
  )
}

export const FormElement: React.FC<{
  children: React.ReactNode
  label: string
  helperText: string
}> = ({children, label, helperText}) => {
  return (
    <div className="border-b border-b-stone-100 mb-4">
      <label className="grid grid-cols-2 gap-4 mb-2">
        <span className="font-semibold">{label}</span>
        <div className="row-span-2">{children}</div>
        <span className="text-neutral-400">{helperText}</span>
      </label>
    </div>
  )
}

export const Actions: React.FC<{
  actions: {
    label: string
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    color: string
  }[]
}> = ({actions}) => {
  return (
    <div className="flex flex-row justify-end w-full gap-4">
      {actions.map(({label, onClick, color}, i) => {
        return (
          <button
            key={i}
            onClick={onClick}
            className={`${color} p-2 rounded-md shadow-md cursor-pointer`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
