import type React from "react"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center bg-transparent p-4">{children}</div>
}
