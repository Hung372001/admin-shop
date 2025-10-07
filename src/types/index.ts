export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        zip: string;
    };
    createdAt: Date;
    role: 'user' | 'admin';
}

export interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl:string;
    createdAt: Date;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    stock: number;
    imageUrls: string[];
    createdAt: Date;
    isActive: boolean;
}

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    priceAtAdd: number;
    updatedAt: Date;
}

export interface Order {
    id: string;
    userId: string;
    orderDate: Date;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    shippingAddress: {
        street: string;
        city: string;
    };
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    paymentMethod: string;
}