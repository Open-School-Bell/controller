import {type LoaderFunctionArgs, redirect} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {Page} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const desktopGroup = await prisma.desktopAlertGroup.findFirstOrThrow({
    where: {id: params.group}
  })

  return {desktopGroup}
}

const Day = () => {
  const {desktopGroup} = useLoaderData<typeof loader>()
  const {t} = useTranslation()

  return (
    <Page title={desktopGroup.name}>
      <p>
        {t('desktopGroups.detail.key')}: {desktopGroup.key}
      </p>
    </Page>
  )
}

export default Day
