import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, className, ...props }) {
        // Sérialiser les éventuels objets complexes dans la description
        let safeDescription = description;
        if (typeof description === 'object' && description !== null) {
          try {
            safeDescription = JSON.stringify(description);
          } catch (err) {
            safeDescription = "Impossible d'afficher le contenu";
          }
        }
        
        return (
          <Toast key={id} variant={variant} className={className} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {safeDescription && (
                <ToastDescription>{safeDescription}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
