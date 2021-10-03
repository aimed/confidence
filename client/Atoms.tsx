import React from "react"

export const Button: React.FC<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & { variant?: "destructive" | "primary" }
> = ({ children, variant = "primary", ...props }) => {
  return (
    <button {...props} className={`button button--${variant} shadow`}>
      {children}
    </button>
  )
}

export const Divider: React.FC<{}> = () => <div className="divider" />

export const Spacer: React.FC<{}> = () => <div className="spacer" />
