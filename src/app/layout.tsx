// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Shop CMS - Admin Dashboard',
    description: 'Quản lý cửa hàng trực tuyến',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
        <body className={inter.className}>
        <AuthProvider>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="container mx-auto p-4">
                    {children}
                </main>
                <Toaster position="top-right" />
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}