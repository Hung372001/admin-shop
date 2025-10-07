'use client'
import Link from 'next/link'


export default function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="font-bold">CMS - Dashboard</h1>
                    <nav className="space-x-4">
                        <Link href="/dashboard">Home</Link>
                        <Link href="/dashboard/products">Products</Link>
                    </nav>
                </div>
            </header>
            <main className="max-w-6xl mx-auto p-6">{children}</main>
        </div>
    )
}