'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '../../../types';

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async (): Promise<void> => {
        const q = query(collection(db, 'orders'));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    };

    const handleUpdateStatus = async (id: string, newStatus: Order['status']): Promise<void> => {
        setLoading(true);
        try {
            await updateDoc(doc(db, 'orders', id), { status: newStatus });
            // Cập nhật local state
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Lỗi cập nhật status:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusOptions: Record<Order['status'], string> = {
        pending: 'Chờ xử lý',
        shipped: 'Đã giao hàng',
        delivered: 'Đã nhận',
        cancelled: 'Đã hủy'
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Quản Lý Đơn Hàng</h1>
            <table className="w-full bg-white rounded shadow">
                <thead>
                <tr>
                    <th className="p-2 border">ID Đơn Hàng</th>
                    <th>Người Dùng</th>
                    <th>Tổng Tiền</th>
                    <th>Status</th>
                    <th>Ngày Đặt</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {orders.map((o: Order) => (
                    <tr key={o.id}>
                        <td className="p-2 border">{o.id}</td>
                        <td className="p-2 border">{o.userId}</td>
                        <td className="p-2 border">{o.totalAmount.toLocaleString()} VND</td>
                        <td className="p-2 border">
                <span className={`px-2 py-1 rounded text-xs ${
                    o.status === 'pending' ? 'bg-yellow-200' :
                        o.status === 'shipped' ? 'bg-blue-200' :
                            o.status === 'delivered' ? 'bg-green-200' : 'bg-red-200'
                }`}>
                  {statusOptions[o.status]}
                </span>
                        </td>
                        <td className="p-2 border">{o.orderDate.toLocaleDateString()}</td>
                        <td className="p-2 border">
                            <select
                                value={o.status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateStatus(o.id, e.target.value as Order['status'])}
                                disabled={loading}
                                className="p-1 border rounded mr-2"
                            >
                                {Object.entries(statusOptions).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {loading && <p className="mt-4 text-blue-500">Đang cập nhật...</p>}
        </div>
    );
}