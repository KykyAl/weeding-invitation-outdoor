import { useCallback, useEffect, useRef, useState } from 'react'
import type { Music } from '@/types'

/**
 * Optional background music. Playback only ever starts from a user gesture
 * (opening the invitation or pressing the toggle), so browsers never block it.
 */
export function useBackgroundMusic(music?: Music) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!music?.url) return
    const audio = new Audio(music.url)
    audio.loop = music.loop ?? true
    audio.volume = music.volume ?? 0.6
    audio.preload = 'none'
    audioRef.current = audio

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audioRef.current = null
    }
  }, [music?.url, music?.loop, music?.volume])

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => setPlaying(false))
  }, [])

  const pause = useCallback(() => audioRef.current?.pause(), [])

  const toggle = useCallback(() => {
    if (audioRef.current?.paused) play()
    else pause()
  }, [play, pause])

  return { available: !!music?.url, playing, play, pause, toggle }
}
