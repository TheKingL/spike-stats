export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
      <div className="w-10 h-10 border-2 border-gray-700 border-t-uni rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
