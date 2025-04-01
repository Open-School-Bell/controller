import {NavLink} from '@remix-run/react'

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

export const Page: React.FC<{children: React.ReactNode; title: string}> = ({
  title,
  children
}) => {
  return (
    <div className="grid grid-cols-narrow">
      <div className="col-start-2">
        <h1 className="font-light mb-2 pb-2 border-b-stone-200 border-b">
          {title}
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
