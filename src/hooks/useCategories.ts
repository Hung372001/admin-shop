// hooks/useCategories.ts
'use client';

import { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Category, CategoryFormData } from '@/types/category';
import { toast } from 'react-hot-toast';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const categoriesList: Category[] = [];

            for (const docSnap of querySnapshot.docs) {
                const data = docSnap.data();
                categoriesList.push({
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Category);
            }

            setCategories(categoriesList);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    // Fetch category by ID
    const fetchCategoryById = async (id: string): Promise<Category | null> => {
        try {
            const docRef = doc(db, 'categories', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Category;
            }
            return null;
        } catch (error) {
            console.error('Error fetching category:', error);
            return null;
        }
    };

    // Upload category image
    const uploadCategoryImage = async (file: File): Promise<string> => {
        if (!file) return '';

        const fileName = `categories/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        setUploading(true);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Lỗi khi upload ảnh');
            throw error;
        } finally {
            setUploading(false);
        }
    };

    // Delete category image
    const deleteCategoryImage = async (imageUrl: string) => {
        try {
            if (!imageUrl) return;
            const httpsReference = ref(storage, imageUrl);
            await deleteObject(httpsReference);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    // Create new category
    const createCategory = async (formData: CategoryFormData) => {
        try {
            let imageUrl = '';
            if (formData.image) {
                imageUrl = await uploadCategoryImage(formData.image);
            }

            const categoryData = {
                name: formData.name.trim(),
                slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
                description: formData.description.trim(),
                imageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'categories'), categoryData);

            // Update product count
            await updateProductCount(docRef.id);

            toast.success('Tạo danh mục thành công!');
            return docRef.id;
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Lỗi khi tạo danh mục');
            throw error;
        }
    };

    // Update existing category
    const updateCategory = async (id: string, formData: CategoryFormData) => {
        try {
            const categoryRef = doc(db, 'categories', id);
            const categorySnap = await getDoc(categoryRef);

            if (!categorySnap.exists()) {
                throw new Error('Category not found');
            }

            const existingData = categorySnap.data();
            let imageUrl = existingData.imageUrl || '';

            if (formData.image) {
                if (existingData.imageUrl) {
                    await deleteCategoryImage(existingData.imageUrl);
                }
                imageUrl = await uploadCategoryImage(formData.image);
            }

            const updateData = {
                name: formData.name.trim(),
                slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
                description: formData.description.trim(),
                imageUrl,
                updatedAt: serverTimestamp(),
            };

            await updateDoc(categoryRef, updateData);

            if (existingData.slug !== updateData.slug) {
                await updateProductsCategory(existingData.slug, updateData.slug);
            }

            await updateProductCount(id);
            toast.success('Cập nhật danh mục thành công!');
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Lỗi khi cập nhật danh mục');
            throw error;
        }
    };

    // Delete category
    const deleteCategory = async (id: string) => {
        try {
            const categoryRef = doc(db, 'categories', id);
            const categorySnap = await getDoc(categoryRef);

            if (!categorySnap.exists()) {
                throw new Error('Category not found');
            }

            const categoryData = categorySnap.data();

            const productsQuery = query(
                collection(db, 'products'),
                where('category', '==', categoryData.slug)
            );
            const productsSnapshot = await getDocs(productsQuery);

            if (!productsSnapshot.empty) {
                toast.error('Không thể xóa danh mục có sản phẩm!');
                return false;
            }

            if (categoryData.imageUrl) {
                await deleteCategoryImage(categoryData.imageUrl);
            }

            await deleteDoc(categoryRef);
            toast.success('Xóa danh mục thành công!');
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Lỗi khi xóa danh mục');
            return false;
        }
    };

    // Update product count for category
    const updateProductCount = async (categoryId: string) => {
        try {
            const categoryRef = doc(db, 'categories', categoryId);
            const categorySnap = await getDoc(categoryRef);

            if (categorySnap.exists()) {
                const categoryData = categorySnap.data();
                const slug = categoryData.slug;

                const productsQuery = query(
                    collection(db, 'products'),
                    where('category', '==', slug)
                );
                const productCountSnap = await getCountFromServer(productsQuery);

                await updateDoc(categoryRef, {
                    productCount: productCountSnap.data().count,
                    updatedAt: serverTimestamp(),
                });
            }
        } catch (error) {
            console.error('Error updating product count:', error);
        }
    };

    // Update products when category slug changes
    const updateProductsCategory = async (oldSlug: string, newSlug: string) => {
        try {
            const productsQuery = query(
                collection(db, 'products'),
                where('category', '==', oldSlug)
            );
            const productsSnapshot = await getDocs(productsQuery);

            for (const docSnap of productsSnapshot.docs) {
                await updateDoc(docSnap.ref, { category: newSlug });
            }
        } catch (error) {
            console.error('Error updating products category:', error);
        }
    };

    // Generate slug from name
    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categories,
        loading,
        uploading,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        fetchCategoryById,
        generateSlug,
    };
}
