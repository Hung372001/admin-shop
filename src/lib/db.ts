import { db } from "./firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
    query,
    orderBy,
} from "firebase/firestore";


export type Product = {
    id?: string;
    name: string;
    description?: string;
    price: number;
    images?: string[];
    categoryId?: string;
    stock?: number;
    createdAt?: Timestamp;
};


const PRODUCTS = "products";


export async function addProduct(p: Omit<Product, 'id' | 'createdAt'>) {
    const ref = await addDoc(collection(db, PRODUCTS), {
        ...p,
        createdAt: Timestamp.now(),
    });
    return ref.id;
}


export async function getProducts() {
    const q = query(collection(db, PRODUCTS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}


export async function getProduct(id: string) {
    const d = await getDoc(doc(db, PRODUCTS, id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as any) };
}


export async function updateProduct(id: string, data: Partial<Product>) {
    await updateDoc(doc(db, PRODUCTS, id), data);
}


export async function deleteProduct(id: string) {
    await deleteDoc(doc(db, PRODUCTS, id));
}