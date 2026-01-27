"use client"
import React from "react"

type State = { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    console.error("Dashboard ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: "red" }}>
          <h2>Dashboard client render failed</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      )
    }

    return this.props.children
  }
}
