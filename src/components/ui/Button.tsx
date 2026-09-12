import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'soft' | 'ghost' | 'danger' | 'default'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'default',
  size = 'md',
  block = false,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = ['btn']
  if (variant !== 'default') classes.push(`btn-${variant}`)
  if (size !== 'md') classes.push(`btn-${size}`)
  if (block) classes.push('btn-block')
  if (className) classes.push(className)

  return (
    <button
      type={type}
      className={classes.join(' ')}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}