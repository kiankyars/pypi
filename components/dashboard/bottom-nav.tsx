"use client"
import Link from "next/link"
import { Home, MessageCircle, BarChart3, UserCircle } from "lucide-react" // BarChart3 for Challenges/Progress
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/chat", label: "Chat", icon: MessageCircle },
  { href: "/dashboard/progress", label: "Progress", icon: BarChart3 }, // Placeholder
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} legacyBehavior>
            <a
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-2 rounded-md transition-colors",
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-muted/50",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  )
}
