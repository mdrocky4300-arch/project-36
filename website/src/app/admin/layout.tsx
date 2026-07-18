import * as React from "react"
import Link from "next/link"
import { LucideLayoutDashboard, LucideServer, LucideUsers, LucideSettings } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="w-64 flex-col hidden sm:flex border-r bg-background">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <LucideServer className="h-6 w-6" />
            <span>Admin Panel</span>
          </Link>
        </div>
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <LucideLayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/generator"
            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
          >
            <LucideServer className="h-4 w-4" />
            Device Generator
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <LucideUsers className="h-4 w-4" />
            Users
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <LucideSettings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>
      <main className="flex flex-1 flex-col p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  )
}
