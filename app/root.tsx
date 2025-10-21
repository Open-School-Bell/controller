import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData
} from '@remix-run/react'
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs
} from '@remix-run/node'
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
import CodeIcon from '@heroicons/react/24/outline/CodeBracketIcon'
import LogIcon from '@heroicons/react/24/outline/ClipboardDocumentCheckIcon'

import './tailwind.css'

import {VERSION} from '~/lib/constants'
import {locales, type SupportedLocale} from '~/locales'

import {SidebarLink, NavSep} from './lib/ui'
import {I18nProvider, useTranslation} from './lib/i18n'
import {initTranslations, type InitTranslationsReturn} from './lib/i18n.server'

const FALLBACK_LOCALE: SupportedLocale = 'en'
const FALLBACK_TRANSLATIONS: InitTranslationsReturn = {
  locale: FALLBACK_LOCALE,
  messages: locales[FALLBACK_LOCALE]
}

export const links: LinksFunction = () => []

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {locale, messages} = initTranslations(request)
  return json({locale, messages})
}

export function Layout({children}: {children: React.ReactNode}) {
  const data =
    useRouteLoaderData<typeof loader>('root') ?? FALLBACK_TRANSLATIONS
  const locale = data.locale ?? FALLBACK_LOCALE
  return (
    <html lang={locale}>
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

const AppContent = () => {
  const {t} = useTranslation()

  return (
    <div className="grid grid-cols-app min-h-screen grid-rows-app">
      <div className="p-2 flex items-center">
        <img src="/logo.png" className="w-16 mr-4" />
        <span>{t('app.title')}</span>
      </div>
      <div className="row-span-3 border-gray-300 border rounded-xl my-2 mr-2 shadow-sm bg-white p-2">
        <Outlet />
      </div>
      <div className="border-t border-gray-300">
        <SidebarLink to="/">
          <BellIcon className="w-6 mr-2" /> <span>{t('nav.dashboard')}</span>
        </SidebarLink>
        <SidebarLink to="/broadcast">
          <BellAlertIcon className="w-6 mr-2" />{' '}
          <span>{t('nav.broadcast')}</span>
        </SidebarLink>
        <SidebarLink to="/schedule">
          <CalendarIcon className="w-6 mr-2" /> <span>{t('nav.schedule')}</span>
        </SidebarLink>
        <SidebarLink to="/calendar">
          <CalendarDaysIcon className="w-6 mr-2" />{' '}
          <span>{t('nav.calendar')}</span>
        </SidebarLink>
        <SidebarLink to="/sounders">
          <SpeakerIcon className="w-6 mr-2" /> <span>{t('nav.sounders')}</span>
        </SidebarLink>
        <SidebarLink to="/sounds">
          <MusicIcon className="w-6 mr-2" /> <span>{t('nav.sounds')}</span>
        </SidebarLink>
        <SidebarLink to="/desktop-groups">
          <ComputerIcon className="w-6 mr-2" />{' '}
          <span>{t('nav.desktopGroups')}</span>
        </SidebarLink>
        <SidebarLink to="/actions">
          <ArrowIcon className="w-6 mr-2" /> <span>{t('nav.actions')}</span>
        </SidebarLink>
        <SidebarLink to="/webhooks">
          <CodeIcon className="w-6 mr-2" /> <span>{t('nav.webhooks')}</span>
        </SidebarLink>
        <SidebarLink to="/zones">
          <Square3StackIcon className="w-6 mr-2" />{' '}
          <span>{t('nav.zones')}</span>
        </SidebarLink>
        <SidebarLink to="/lockdown">
          <LockClosedIcon className="w-6 mr-2" />{' '}
          <span>{t('nav.lockdown')}</span>
        </SidebarLink>
        <NavSep />
        <SidebarLink to="/settings">
          <CogIcon className="w-6 mr-2" /> <span>{t('nav.settings')}</span>
        </SidebarLink>
        <SidebarLink to="/about">
          <InfoIcon className="w-6 mr-2" /> <span>{t('nav.about')}</span>
        </SidebarLink>
        <SidebarLink to="/log">
          <LogIcon className="w-6 mr-2" /> <span>{t('nav.log')}</span>
        </SidebarLink>
        <SidebarLink to="/backup">
          <BoxIcon className="w-6 mr-2" /> <span>{t('nav.backup')}</span>
        </SidebarLink>
        <NavSep />
        <SidebarLink to="/logout">
          <LogoutIcon className="w-6 mr-2" /> <span>{t('nav.logout')}</span>
        </SidebarLink>
      </div>
      <div className="text-sm text-gray-400 p-2 text-center">
        &copy; Open School Bell 2025 <br />
        OSB {VERSION}
      </div>
    </div>
  )
}

const App = () => {
  const data = useLoaderData<typeof loader>() ?? FALLBACK_TRANSLATIONS

  return (
    <I18nProvider locale={data.locale} messages={data.messages}>
      <AppContent />
    </I18nProvider>
  )
}

export default App
