import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  onError?: () => void
  children: ReactNode
}

/** If the WebGL layer throws (context lost, driver issue), keep the invitation usable. */
export class WebGLErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.warn('[cinematic] WebGL layer disabled:', error)
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
