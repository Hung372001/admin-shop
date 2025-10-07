// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Menu,
    X,
    ShoppingCart,
    Users,
    Package,
    BarChart3,
    LogOut
} from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAdmin, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <ShoppingCart className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-800">Shop CMS</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAdmin && (
                            <>
                                <Link href="/dashboard" className="flex items-center space-x-1 hover:text-blue-600">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link href="/products" className="flex items-center space-x-1 hover:text-blue-600">
                                    <Package className="h-4 w-4" />
                                    <span>Sản phẩm</span>
                                </Link>
                                <Link href="/orders" className="flex items-center space-x-1 hover:text-blue-600">
                                    <Users className="h-4 w-4" />
                                    <span>Đơn hàng</span>
                                </Link>
                            </>
                        )}
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Đăng xuất</span>
                            </button>
                        ) : (
                            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                Đăng nhập
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {isAdmin && (
                            <>
                                <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                                    Dashboard
                                </Link>
                                <Link href="/products" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                                    Sản phẩm
                                </Link>
                                <Link href="/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                                    Đơn hàng
                                </Link>
                            </>
                        )}
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded"
                            >
                                Đăng xuất
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="block text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}