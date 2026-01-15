import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </>
  )
}
