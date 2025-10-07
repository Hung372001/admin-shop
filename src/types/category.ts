// types/category.ts
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    productCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
    image: File | null;
}