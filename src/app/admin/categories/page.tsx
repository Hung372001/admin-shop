'use client';
import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '../../../types';

interface CategoryForm {
    name: string;
    description: string;
    imageUrl: string;
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [form, setForm] = useState<CategoryForm>({ name: '', description: '', imageUrl: '' });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async (): Promise<void> => {
        const q = query(collection(db, 'categories'));
        const snap = await getDocs(q);
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const formData = { ...form, createdAt: editingId ? undefined : new Date() };
        if (editingId) {
            await updateDoc(doc(db, 'categories', editingId), formData);
        } else {
            await addDoc(collection(db, 'categories'), formData);
        }
        setForm({ name: '', description: '', imageUrl: '' });
        setEditingId(null);
        fetchCategories();
    };

    const handleEdit = (category: Category): void => {
        setForm({ name: category.name, description: category.description, imageUrl: category.imageUrl });
        setEditingId(category.id);
    };

    const handleDelete = async (id: string): Promise<void> => {
        await deleteDoc(doc(db, 'categories', id));
        fetchCategories();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Quản Lý Danh Mục</h1>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
                <input
                    type="text"
                    placeholder="Tên danh mục"
                    value={form.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                    className="block w-full p-2 mb-2 border rounded"
                    required
                />
                <textarea
                    placeholder="Mô tả"
                    value={form.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                    className="block w-full p-2 mb-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="URL ảnh đại diện"
                    value={form.imageUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, imageUrl: e.target.value })}
                    className="block w-full p-2 mb-2 border rounded"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    {editingId ? 'Cập Nhật' : 'Thêm'}
                </button>
            </form>
            <table className="w-full bg-white rounded shadow">
                <thead>
                <tr>
                    <th className="p-2 border">Tên</th>
                    <th>Mô tả</th>
                    <th>URL Ảnh</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((c: Category) => (
                    <tr key={c.id}>
                        <td className="p-2 border">{c.name}</td>
                        <td className="p-2 border">{c.description}</td>
                        <td className="p-2 border">{c.imageUrl}</td>
                        <td className="p-2 border">
                            <button onClick={() => handleEdit(c)} className="bg-yellow-500 text-white px-2 py-1 mr-2 rounded">Sửa</button>
                            <button onClick={() => handleDelete(c.id)} className="bg-red-500 text-white px-2 py-1 rounded">Xóa</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}