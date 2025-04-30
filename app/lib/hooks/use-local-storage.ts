import {useState, useEffect} from 'react'

export const useLocalStorage = <ValueType extends string>(
  key: string,
  initial: ValueType
): [ValueType, (newValue: ValueType) => void] => {
  const set = (newValue: ValueType) => {
    localStorage.setItem(key, newValue)
  }

  if (typeof window === 'undefined') {
    return [initial, set]
  }

  const value = localStorage.getItem(key) as ValueType | null

  return [value ? value : initial, set]
}

export const useStatefulLocalStorage = <ValueType extends string>(
  key: string,
  initial: ValueType
) => {
  const [lsValue, setLS] = useLocalStorage(key, initial)

  const [value, set] = useState(lsValue)

  useEffect(() => {
    setLS(value)
  }, [value])

  return [value, set] as const
}
