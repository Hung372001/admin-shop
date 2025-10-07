'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {Toaster} from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }){
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
            if (!currentUser) {
                router.push('/login');
            } else {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async (): Promise<void> => {
        await signOut(auth);
        router.push('/login');
    };

    if (!user) return <div>Đang tải...</div>;

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-white shadow-md p-4">
                <h1 className="text-xl font-bold mb-6">CMS Shop Admin</h1>
                <nav>
                    <ul className="space-y-2">
                        <li><Link href="/admin/dashboard" className="block p-2 hover:bg-gray-200 rounded">Dashboard</Link></li>
                        <li><Link href="/admin/products" className="block p-2 hover:bg-gray-200 rounded">Sản Phẩm</Link></li>
                        <li><Link href="/admin/categories" className="block p-2 hover:bg-gray-200 rounded">Danh Mục</Link></li>
                        <li><Link href="/admin/users" className="block p-2 hover:bg-gray-200 rounded">Người Dùng</Link></li>
                        <li><Link href="/admin/orders" className="block p-2 hover:bg-gray-200 rounded">Đơn Hàng</Link></li>
                    </ul>
                </nav>
                <button onClick={handleLogout} className="mt-6 w-full bg-red-500 text-white p-2 rounded">Đăng Xuất</button>
            </div>
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>

            <Toaster />
        </div>
    );
}