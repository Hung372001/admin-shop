'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Stats {
    users: number;
    products: number;
    orders: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({ users: 0, products: 0, orders: 0 });

    useEffect(() => {
        const fetchStats = async (): Promise<void> => {
            const usersSnap = await getDocs(collection(db, 'users'));
            const productsSnap = await getDocs(collection(db, 'products'));
            const ordersSnap = await getDocs(collection(db, 'orders'));
            setStats({
                users: usersSnap.size,
                products: productsSnap.size,
                orders: ordersSnap.size,
            });
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg">Người Dùng</h2>
                    <p className="text-2xl">{stats.users}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg">Sản Phẩm</h2>
                    <p className="text-2xl">{stats.products}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg">Đơn Hàng</h2>
                    <p className="text-2xl">{stats.orders}</p>
                </div>
            </div>
        </div>
    );
}