"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Package,
  Menu,
  X,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  disabled?: boolean
}

const navigation: NavItem[] = [
  {
    title: "Comercial",
    icon: TrendingUp,
    children: [
      {
        title: "Em breve",
        href: "/comercial",
        disabled: true
      }
    ]
  },
  {
    title: "Operacional",
    icon: Package,
    children: [
      {
        title: "Controle de Vendas",
        href: "/operacional/controle-vendas",
        icon: ShoppingCart
      }
    ]
  }
]

function NavItemComponent({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(true)

  const isActive = item.href ? pathname === item.href : false
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            level === 0 && "text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.title}
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.title} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (item.disabled) {
    return (
      <span
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed",
          level > 0 && "pl-4"
        )}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        {item.title}
        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">Em breve</span>
      </span>
    )
  }

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium",
        level > 0 && "pl-4"
      )}
    >
      {item.icon && <item.icon className="h-4 w-4" />}
      {item.title}
    </Link>
  )
}

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r bg-background transition-transform md:translate-x-0 flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-6 w-6" />
            <span>Gestão FacilityPay</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => (
            <NavItemComponent key={item.title} item={item} />
          ))}
        </nav>
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  )
}
