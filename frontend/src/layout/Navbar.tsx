"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, CalendarDays, LogOut, Menu, X, Video, Settings } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/#meetings", label: "Meetings", icon: CalendarDays },
];

// --- Sidebar (desktop) — matches Zoom's 56px sidebar ---
function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-14 bg-zoom-dark-sidebar h-screen sticky top-0 z-30 shrink-0 border-r border-zoom-dark-border">
      {/* Logo */}
      <div className="flex items-center justify-center h-12">
        <Link href="/" aria-label="Home" className="flex items-center justify-center">
          <div className="w-7 h-7 rounded-lg bg-zoom-blue flex items-center justify-center">
            <Video className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-0.5 pt-1">
        {navItems.map((item) => {
          const isActive = pathname ? (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center w-11 h-11 rounded-lg transition-colors duration-150",
                isActive
                  ? "text-white"
                  : "text-zoom-text-muted hover:text-zoom-text"
              )}
              title={item.label}
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] font-medium mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom — like Zoom */}
      <div className="flex flex-col items-center pb-3">
        <button
          className="flex flex-col items-center justify-center w-11 h-11 rounded-lg text-zoom-text-muted hover:text-zoom-text transition-colors duration-150"
          title="Settings"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span className="text-[9px] font-medium mt-0.5 leading-none">Settings</span>
        </button>
      </div>
    </aside>
  );
}

// --- Top Bar — minimal like Zoom ---
function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between px-4 lg:px-5 bg-zoom-dark-bg border-b border-zoom-dark-border">
      {/* Left: hamburger (mobile) + brand (desktop) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-zoom-text-muted hover:bg-zoom-dark-hover hover:text-zoom-text transition-colors duration-150"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <Link href="/" className="hidden lg:flex items-center gap-1.5">
          <span className="text-[11px] text-zoom-text-muted font-medium tracking-wide">zoom</span>
          <span className="text-[11px] text-zoom-text font-semibold tracking-wide">Workplace</span>
        </Link>
      </div>

      {/* Center: Logo on mobile */}
      <div className="lg:hidden flex items-center gap-1.5">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-zoom-blue flex items-center justify-center">
            <Video className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-zoom-text">Zoom</span>
        </Link>
      </div>

      {/* Right: user controls */}
      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right mr-1">
              <p className="text-[11px] font-medium text-zoom-text leading-tight">{user.full_name}</p>
              <p className="text-[10px] text-zoom-text-muted truncate max-w-[120px]">{user.email}</p>
            </div>
            <Avatar
              fallback={getInitials(user.full_name)}
              size="md"
              className="h-7 w-7 text-[10px] bg-zoom-blue text-white font-semibold"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-zoom-text-muted hover:text-zoom-red hover:bg-zoom-red/10 text-[11px] h-7 px-2"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-zoom-dark-surface rounded-full text-[10px] font-medium text-zoom-text-muted border border-zoom-dark-border mr-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Guest
            </div>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zoom-text-muted hover:text-zoom-text text-[11px] h-7 px-2">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="default" size="sm" className="text-[11px] h-7 px-3">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

// --- Mobile Sidebar Overlay ---
function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed top-0 left-0 z-50 w-[260px] h-screen bg-zoom-dark-sidebar border-r border-zoom-dark-border flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between h-12 px-4 border-b border-zoom-dark-border">
              <Link href="/" className="flex items-center gap-1.5" onClick={onClose}>
                <div className="w-7 h-7 rounded-lg bg-zoom-blue flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold text-zoom-text">Zoom</span>
              </Link>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-zoom-text-muted hover:bg-zoom-dark-hover"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-0.5 p-2 pt-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 text-[13px] font-medium",
                      isActive
                        ? "text-white bg-white/5"
                        : "text-zoom-text-muted hover:bg-zoom-dark-hover hover:text-zoom-text"
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Exported Layout Wrapper ---
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-zoom-dark-bg">
      <Sidebar />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export { Sidebar, TopBar, MobileSidebar };

export function Navbar() {
  return null;
}
