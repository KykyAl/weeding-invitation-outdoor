import { useState } from 'react'
import { isWebGLAvailable } from '@/utils/webgl'

export function useWebGLSupport(): boolean {
  const [supported] = useState(isWebGLAvailable)
  return supported
}
