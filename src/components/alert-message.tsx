export function AlertError({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg flex items-center gap-2">
      <span className="text-lg">⚠️</span>
      <span>{message}</span>
    </div>
  )
}

export function AlertSuccess({ message }: { message: string }) {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg flex items-center gap-2">
      <span className="text-lg">✅</span>
      <span>{message}</span>
    </div>
  )
}

export function AlertInfo({ message }: { message: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-4 rounded-lg flex items-center gap-2">
      <span className="text-lg">ℹ️</span>
      <span>{message}</span>
    </div>
  )
}