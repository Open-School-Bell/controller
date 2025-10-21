import {useState} from 'react'
import {type Audio} from '@prisma/client'

import {getSecondsAsTime, INPUT_CLASSES} from './utils'
import {HelperText} from './ui'
import {useTranslation} from './i18n'

export const SequenceBuilder = ({
  sounds,
  initialQueue,
  name,
  label,
  helperText
}: {
  sounds: Audio[]
  initialQueue: string[]
  name: string
  label: string
  helperText: string
}) => {
  const [queue, setQueue] = useState(initialQueue)
  const [selected, setSelected] = useState(sounds[0].id)
  const {t} = useTranslation()

  let duration = 0

  return (
    <div className="grid grid-cols-4 gap-4">
      <span className="font-semibold col-span-4">{label}</span>
      <div className="col-span-4">
        <HelperText>{helperText}</HelperText>
      </div>
      <input type="hidden" value={JSON.stringify(queue)} name={name} />
      <div>
        <select
          className={INPUT_CLASSES}
          defaultValue={sounds[0].id}
          onChange={e => {
            setSelected(e.target.value)
          }}
        >
          {sounds.map(({id, name, duration}) => {
            return (
              <option key={id} value={id}>
                {name} ({getSecondsAsTime(duration)})
              </option>
            )
          })}
        </select>
        <button
          className={`${INPUT_CLASSES} bg-green-300 mt-4`}
          onClick={e => {
            e.preventDefault()
            setQueue([...queue, selected])
          }}
        >
          Add Sound
        </button>
      </div>
      <div className="col-span-3 row-span-2">
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
        <div>
          {t('broadcast.builder.totalDuration', {
            duration: getSecondsAsTime(duration)
          })}
        </div>
      </div>
    </div>
  )
}
