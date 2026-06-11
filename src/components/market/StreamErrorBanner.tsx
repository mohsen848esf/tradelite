import './StreamErrorBanner.css'

type StreamErrorBannerProps = {
  message: string
  onRetry: () => void
}

export function StreamErrorBanner({ message, onRetry }: StreamErrorBannerProps) {
  return (
    <div className="stream-error-banner" role="alert">
      <span>{message}</span>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}
