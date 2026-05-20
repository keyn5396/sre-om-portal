/**
 * layout.tsx
 *
 * Layout raíz del portal SRE OM Operations.
 * Define la estructura visual que envuelve TODAS las páginas:
 * Sidebar fijo a la izquierda + Topbar fijo arriba + contenido al centro.
 *
 * En Next.js App Router, este archivo se renderiza UNA sola vez
 * y las páginas se insertan en {children} sin recargar el layout.
 * Eso hace que la navegación sea instantánea — el sidebar nunca parpadea.
 */

import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"

// Fuente principal del portal — Geist es la fuente de Vercel, moderna y legible
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Metadatos del portal — aparecen en la pestaña del navegador
export const metadata: Metadata = {
  title:       "SRE OM Operations Portal",
  description: "Portal interno de soporte para Order Management · Salesforce",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="bg-surface-950 text-surface-100 antialiased">

        {/* Sidebar fijo — siempre visible a la izquierda */}
        <Sidebar />

        {/* Topbar fijo — siempre visible arriba, a la derecha del sidebar */}
        <Topbar />

        {/* Área de contenido principal
            ml-64 → deja espacio para el sidebar (w-64)
            pt-16 → deja espacio para el topbar (h-16)
            min-h-screen → ocupa toda la altura de la pantalla */}
        <main className="
          ml-64 pt-16
          min-h-screen
          bg-surface-950
        ">
          {/* Contenedor con padding interno para todas las páginas */}
          <div className="p-6">
            {children}
          </div>
        </main>

      </body>
    </html>
  )
}