export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-red-400 font-medium">Something went wrong</p>
      <p className="text-gray-500 text-sm max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 text-sm bg-uni hover:bg-uni/80 text-white rounded-lg transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
