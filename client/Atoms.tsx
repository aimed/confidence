import React from "react"

export const Button: React.FC<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & { color: string }
> = ({ children, color, ...props }) => {
  return (
    <button
      {...props}
      className={`p-2 bg-${color}-600 text-${color}-100 rounded shadow`}
    >
      {children}
    </button>
  )
}

export const Divider: React.FC<{ size?: number }> = ({ size = 4 }) => (
  <div className={`pt-px bg-gray-700 my-${size}`} />
)

export const Spacer: React.FC<{ size?: number }> = ({ size = 2 }) => (
  <div className={`m-${size}`} />
)
