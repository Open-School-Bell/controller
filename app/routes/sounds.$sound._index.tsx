import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {parseFile} from 'music-metadata'
import path from 'path'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle, getSecondsAsTime} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  const {messages} = getRootI18n(matches)
  const name = data ? data.sound.name : translate(messages, 'sounds.detail.metaFallback')
  return [{title: pageTitle(translate(messages, 'sounds.metaTitle'), name)}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sound = await prisma.audio.findFirstOrThrow({
    where: {id: params.sound}
  })

  if (sound.audioContainer === '' || sound.duration === 0) {
    console.log('updating meta data')
    const meta = await parseFile(
      path.join(process.cwd(), 'public', 'sounds', sound.fileName)
    )

    await prisma.audio.update({
      where: {id: sound.id},
      data: {
        duration: meta.format.duration,
        audioContainer: meta.format.container
      }
    })

    sound.audioContainer = meta.format.container ? meta.format.container : ''
    sound.duration = meta.format.duration ? meta.format.duration : 0
  }

  return {sound}
}

const Sound = () => {
  const {sound} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={sound.name}>
      <div className="box mb-4">
        <audio controls>
          <source src={`/sounds/${sound.fileName}`} type="audio/mp3" />
        </audio>
        <p>
          {t('sounds.detail.ringerWire')}: {sound.ringerWire}
        </p>
        <p>
          {t('sounds.detail.duration')}: {getSecondsAsTime(sound.duration)}
        </p>
        <p>
          {t('sounds.detail.audioType')}: {sound.audioContainer}
        </p>
      </div>
      <Actions
        actions={[
          {
            label: t('button.back'),
            color: 'bg-stone-200',
            onClick: () => navigate('/sounds')
          },
          {
            label: t('sounds.detail.editButton'),
            color: 'bg-blue-300',
            onClick: () => navigate(`/sounds/${sound.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Sound
