"use client"

import type React from "react"
import { User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translations, type Language } from "@/lib/translations"
import { useRole } from "@/components/security/useRole"
import { useLanguage } from "@/hooks/useLanguage"
import { AppSettings } from "../navigation/AppSettings"


export default function UserProfile({
  userName,
  onClose,
}: {
  userName: string,
  onClose: () => void
}
) {
  const { role } = useRole();
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // const handleLogout = async () => {
  //   setIsLoggingOut(true)
  //   setLogoutError("")

  //   try {
  //     const response = await fetch(`${URL}/auth/logout`, {
  //       method: "POST",
  //       headers: {
  //         'X-Session-Id': sessionId || '',
  //         "Content-Type": "application/json",
  //       },
  //     })

  //     const data: LogoutResponse = await response.json()

  //     if (!response.ok) {
  //       throw new Error(data.error || `HTTP error! status: ${response.status}`)
  //     }

  //     if (data.sessionInvalidated || data.message === "Logout successful") {
  //       clearSession()
  //       onLogout()
  //     } else if (data.message === "No active session found") {
  //       clearSession()
  //       onLogout()
  //     } else {
  //       setLogoutError(data.message || t.logoutError || "Logout failed")
  //     }
  //   } catch (err) {
  //     setLogoutError(err instanceof Error ? err.message : t.connectionError || "Connection error")
  //     console.error("Logout error:", err)
  //   } finally {
  //     setIsLoggingOut(false)
  //   }
  // }

  return (

    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center shadow-soft bg-muted">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{userName}</h2>
            {role && <p className="text-muted-foreground text-sm">{t[role]}</p>}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Account Info */}
      <div className="space-y-6 mb-8">
        {/* Settings */}
        <div className="bg-muted rounded-xl p-4">
          <h3 className="text-foreground font-medium mb-3">{t.settings}</h3>
          <AppSettings />
        </div>
      </div>

      {/* Logout Button */}
      {/* <div className="space-y-2">
        {logoutError && (
          <p className="text-destructive text-sm text-center">{logoutError}</p>
        )}
        <Button
          onClick={handleLogout}
          variant="destructive"
          disabled={isLoggingOut}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg transition-all duration-200"
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t.loggingOut || "Logging out..."}
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              {t.logout}
            </>
          )}
        </Button>
      </div> */}
    </>
  )
}