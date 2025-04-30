"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

type ToastContextType = {
  toast: (props: ToastProps) => string
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  id?: string
  duration?: number
  dismissible?: boolean
}

interface ToastState {
  toasts: Array<ToastProps & { id: string; dismissed?: boolean }>
}

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastProps & { id: string } }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "REMOVE_TOAST"; id: string }

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      // Check if a toast with this ID already exists
      if (state.toasts.some((toast) => toast.id === action.toast.id)) {
        return state // Don't add duplicate toasts
      }
      return {
        toasts: [...state.toasts, action.toast],
      }
    case "DISMISS_TOAST":
      return {
        toasts: state.toasts.map((toast) => (toast.id === action.id ? { ...toast, dismissed: true } : toast)),
      }
    case "REMOVE_TOAST":
      return {
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      }
    default:
      return state
  }
}

// Generate a truly unique ID for toasts
const generateUniqueId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] })
  const toastsRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const pendingToastsRef = React.useRef<Set<string>>(new Set())

  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || generateUniqueId()
    const duration = props.duration || 5000

    // Prevent duplicate toasts being created simultaneously
    if (pendingToastsRef.current.has(id)) {
      return id
    }

    pendingToastsRef.current.add(id)

    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      dispatch({
        type: "ADD_TOAST",
        toast: { ...props, id },
      })

      const timeoutId = setTimeout(() => {
        dispatch({ type: "DISMISS_TOAST", id })
        setTimeout(() => {
          dispatch({ type: "REMOVE_TOAST", id })
          pendingToastsRef.current.delete(id)
        }, 300)
      }, duration)

      toastsRef.current.set(id, timeoutId)
      pendingToastsRef.current.delete(id)
    }, 0)

    return id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    dispatch({ type: "DISMISS_TOAST", id })

    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", id })
    }, 300)

    const timeout = toastsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      toastsRef.current.delete(id)
    }
  }, [])

  React.useEffect(() => {
    // Store a reference to the current map of timeouts
    const currentToasts = toastsRef.current

    return () => {
      currentToasts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 w-full max-w-sm p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col-reverse">
        {state.toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              toastVariants({ variant: toast.variant }),
              toast.dismissed ? "animate-fade-out" : "animate-fade-in",
            )}
          >
            <div className="flex-1 space-y-1">
              {toast.title && <div className="font-medium">{toast.title}</div>}
              {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
            </div>
            {toast.dismissible !== false && (
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
