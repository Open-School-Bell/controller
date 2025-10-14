import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate, useLoaderData, useSearchParams} from '@remix-run/react'
import {useState, useEffect} from 'react'

import {getPrisma} from '~/lib/prisma.server'
import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, Page, FormElement} from '~/lib/ui'
import {
  useStatefulLocalStorage,
  clearLocalStorage
} from '~/lib/hooks/use-local-storage'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast', 'Sound')}]
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

  const queue = JSON.parse(LSqueue) as string[]

  const setQueue = (array: string[]) => {
    setLSQueue(JSON.stringify(array) as any)
  }

  useEffect(() => {
    if (searchParams.get('tts') !== null) {
      setQueue([...queue, searchParams.get('tts')!])
    }
  }, [searchParams])

  return (
    <Page title="Broadcast Builder">
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `25%`}}
        />
      </div>
      <form method="post" action="/broadcast/zone">
        <FormElement label="Sound" helperText="The sound to add to the queue.">
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

            return (
              <div
                key={`${sound.id}-${i}`}
                className="border-b border-b-stone-100 mb-2 pb-2"
              >
                {sound.name}{' '}
                <button
                  className="cursor-pointer"
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
              </div>
            )
          })}
        </div>
        <Actions
          actions={[
            {
              label: 'Back',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {
              label: 'Add',
              color: 'bg-green-300',
              onClick: e => {
                e.preventDefault()
                setQueue([...queue, selectedSound])
              }
            },
            {
              label: 'Create new TTS',
              color: 'bg-green-300',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast/tts')
              }
            },
            {
              label: 'Next',
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
