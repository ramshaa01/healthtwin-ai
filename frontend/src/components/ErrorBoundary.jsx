import { Component } from "react"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production, you could send this to a logging service
    console.error("ErrorBoundary caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          padding: "24px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", maxWidth: "360px", marginBottom: "28px" }}>
            An unexpected error occurred. Please reload the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg,#10b981,#3b82f6)",
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
            }}
          >
            🔄 Reload Page
          </button>
          {import.meta.env.DEV && (
            <details style={{ marginTop: "24px", textAlign: "left", maxWidth: "600px" }}>
              <summary style={{ color: "#9ca3af", cursor: "pointer", fontSize: "12px" }}>
                Developer details
              </summary>
              <pre style={{
                marginTop: "8px", padding: "12px", background: "#1f2937",
                color: "#f9fafb", borderRadius: "8px", fontSize: "11px",
                overflow: "auto", maxHeight: "200px"
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
