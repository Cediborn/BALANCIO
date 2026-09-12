import { create } from 'zustand'

interface ToastState {
  message: string | null
  id: number
  show: (message: string) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  id: 0,
  show: (message) => {
    const id = Date.now()
    set({ message, id })
    setTimeout(() => {
      set((s) => (s.id === id ? { message: null } : s))
    }, 2400)
  },
  hide: () => set({ message: null }),
}))

export function ToastHost() {
  const message = useToastStore((s) => s.message)
  if (!message) return null
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}