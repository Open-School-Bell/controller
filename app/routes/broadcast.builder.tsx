/* eslint react-hooks/exhaustive-deps: 0 */
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate, useLoaderData, useSearchParams} from '@remix-run/react'
import {useState, useEffect} from 'react'

import {getPrisma} from '~/lib/prisma.server'
import {pageTitle, INPUT_CLASSES, getSecondsAsTime} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, Page, FormElement} from '~/lib/ui'
import {
  useStatefulLocalStorage,
  clearLocalStorage
} from '~/lib/hooks/use-local-storage'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'broadcast.pageTitle'),
        translate(messages, 'broadcast.builder.metaTitle')
      )
    }
  ]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

const BroadcastSound = () => {
  const {sounds} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [LSqueue, setLSQueue] = useStatefulLocalStorage('broadcast-queue', '[]')
  const [selectedSound, setSelectedSound] = useState(sounds[0].id)
  const [searchParams] = useSearchParams()
  const {t} = useTranslation()

  const queue = JSON.parse(LSqueue) as string[]

  const setQueue = (array: string[]) => {
    setLSQueue(JSON.stringify(array) as any)
  }

  useEffect(() => {
    if (searchParams.get('tts') !== null) {
      setQueue([...queue, searchParams.get('tts')!])
    }
  }, [searchParams])

  let duration = 0

  return (
    <Page title={t('broadcast.builder.pageTitle')}>
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `25%`}}
        />
      </div>
      <form method="post" action="/broadcast/zone">
        <FormElement
          label={t('broadcast.builder.sound.label')}
          helperText={t('broadcast.builder.sound.helper')}
        >
          <select
            name="sound"
            className={INPUT_CLASSES}
            defaultValue={sounds[0].id}
            onChange={e => {
              setSelectedSound(e.target.value)
            }}
          >
            {sounds.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <input type="hidden" name="queue" value={LSqueue} />
        <div>
          {queue.map((queuedId, i) => {
            const sound = sounds.filter(({id}) => {
              return id === queuedId
            })[0]

            duration += sound.duration

            return (
              <div
                key={`${sound.id}-${i}`}
                className="border-b border-b-stone-100 mb-2 pb-2 grid grid-cols-5"
              >
                <p className="col-span-4">{sound.name}</p>
                <button
                  className="cursor-pointer row-span-2"
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    setQueue([
                      ...queue.filter((v, di) => {
                        return di !== i
                      })
                    ])
                  }}
                >
                  ❌
                </button>
                <p className="col-span-4 text-sm text-gray-400">
                  {getSecondsAsTime(sound.duration)}
                </p>
              </div>
            )
          })}
        </div>
        <div>
          {t('broadcast.builder.totalDuration', {
            duration: getSecondsAsTime(duration)
          })}
        </div>
        <Actions
          actions={[
            {
              label: t('button.back'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {
              label: t('button.add'),
              color: 'bg-green-300',
              onClick: e => {
                e.preventDefault()
                setQueue([...queue, selectedSound])
              }
            },
            {
              label: t('broadcast.builder.createTts'),
              color: 'bg-green-300',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast/tts')
              }
            },
            {
              label: t('button.next'),
              color: 'bg-blue-300',
              onClick: () => {
                clearLocalStorage('broadcast-queue')
              }
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default BroadcastSound
