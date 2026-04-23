export function AlertError({ message }: { message: string }) {
  return (
    <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 text-sm p-4 rounded-r-lg shadow-soft flex items-start gap-3 animate-pulse-once">
      <span className="text-xl mt-0.5">⚠️</span>
      <div>
        <p className="font-medium">Error</p>
        <p className="text-danger-600">{message}</p>
      </div>
    </div>
  )
}

export function AlertSuccess({ message }: { message: string }) {
  return (
    <div className="bg-success-50 border-l-4 border-success-500 text-success-700 text-sm p-4 rounded-r-lg shadow-soft flex items-start gap-3">
      <span className="text-xl mt-0.5">✅</span>
      <div>
        <p className="font-medium">Éxito</p>
        <p className="text-success-600">{message}</p>
      </div>
    </div>
  )
}

export function AlertInfo({ message }: { message: string }) {
  return (
    <div className="bg-info-50 border-l-4 border-info-500 text-info-700 text-sm p-4 rounded-r-lg shadow-soft flex items-start gap-3">
      <span className="text-xl mt-0.5">ℹ️</span>
      <div>
        <p className="font-medium">Información</p>
        <p className="text-info-600">{message}</p>
      </div>
    </div>
  )
}

export function AlertWarning({ message }: { message: string }) {
  return (
    <div className="bg-warning-50 border-l-4 border-warning-500 text-warning-700 text-sm p-4 rounded-r-lg shadow-soft flex items-start gap-3">
      <span className="text-xl mt-0.5">⚡</span>
      <div>
        <p className="font-medium">Advertencia</p>
        <p className="text-warning-600">{message}</p>
      </div>
    </div>
  )
}