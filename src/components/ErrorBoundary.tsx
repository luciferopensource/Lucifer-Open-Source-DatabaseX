import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Last line of defence: a render error shows a readable panel with the message
 * and a reload, instead of a blank screen. The router stays unobstructed so the
 * rest of the site keeps working.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lucifer Database X render error', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="error-panel" role="alert">
        <p className="eyebrow">Render error</p>
        <h1>This view could not be drawn</h1>
        <p className="lede">
          The datasets are intact — a component threw while rendering. Reload to start clean, or go back to the overview.
        </p>
        <pre className="error-panel__detail">{error.message}</pre>
        <div className="notfound__links">
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload the page
          </button>
          <a className="btn btn--ghost" href="/">
            Back to overview
          </a>
        </div>
      </div>
    )
  }
}
