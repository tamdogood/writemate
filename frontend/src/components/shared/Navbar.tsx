'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavbarProps {
  variant?: 'landing' | 'app'
  userName?: string
}

export function Navbar({ variant = 'landing', userName }: NavbarProps) {
  const pathname = usePathname()

  if (variant === 'landing') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-xl text-gray-900">WriteMate</span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link href="/editor">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Log in
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  // App variant
  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/editor', label: 'Editor' },
    { href: '/vocabulary', label: 'Vocabulary' },
  ]

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U'

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <span className="font-bold text-xl text-gray-900">WriteMate</span>
        </Link>

        {/* Center Tabs */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'text-orange-500'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </Link>
            )
          })}
        </div>

        {/* User Avatar */}
        <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
          <span className="text-white font-semibold text-sm">{userInitial}</span>
        </div>
      </div>
    </nav>
  )
}
