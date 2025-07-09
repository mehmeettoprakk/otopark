import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 backdrop-blur-sm'
    
    const variants = {
      primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl border border-indigo-400/20',
      secondary: 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white/90 border border-slate-200 shadow-sm hover:shadow-md',
      outline: 'border-2 border-indigo-500/60 text-indigo-600 bg-white/50 backdrop-blur-sm hover:bg-indigo-50/80 hover:border-indigo-600',
      ghost: 'text-slate-600 hover:bg-white/60 hover:text-slate-800 backdrop-blur-sm border border-transparent hover:border-slate-200',
      danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl border border-red-400/20'
    }
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 py-2.5 text-sm',
      lg: 'h-12 px-8 text-base'
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button 