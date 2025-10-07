'use client';
import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Category } from '@/types';  // Import Category
import { useUploadImage } from '@/hooks/useUploadImage';
import { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import toast from 'react-hot-toast';

// Shadcn imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';  // Thêm Select imports

// Zod schema (categoryId vẫn là string)
const productSchema = z.object({
    name: z.string().min(1, 'Tên sản phẩm bắt buộc'),
    description: z.string().min(1, 'Mô tả bắt buộc'),
    price: z.number().positive('Giá phải > 0'),
    categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),  // Validation cho select
    stock: z.number().int().nonnegative('Tồn kho >= 0'),
});

type ProductForm = z.infer<typeof productSchema>;

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);  // State mới cho categories
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const { uploadImage, uploading, progress } = useUploadImage();
    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm<ProductForm>({
        resolver: zodResolver(productSchema),
        defaultValues: { name: '', description: '', price: 0, categoryId: '', stock: 0 },
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();  // Fetch categories
    }, []);

    const fetchProducts = async (): Promise<void> => {
        try {
            const q = query(collection(db, 'products'));
            const snap = await getDocs(q);
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        } catch (error) {
            console.error('Lỗi fetch products:', error);
            toast.error('Lỗi tải danh sách sản phẩm!');
        }
    };

    const fetchCategories = async (): Promise<void> => {  // Function mới
        try {
            const q = query(collection(db, 'categories'));
            const snap = await getDocs(q);
            setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
        } catch (error) {
            console.error('Lỗi fetch categories:', error);
            toast.error('Lỗi tải danh mục!');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const urls = await uploadImage(files);
        if (urls) {
            setSelectedImages(prev => [...prev, ...urls]);
            toast.success(`${urls.length} ảnh đã upload thành công!`);
        } else {
            toast.error('Lỗi upload ảnh!');
        }
        event.target.value = '';
    };

    const onSubmit: SubmitHandler<ProductForm> = async (data: ProductForm): Promise<void> => {
        const productData: Partial<Product> = {
            ...data,
            imageUrls: selectedImages,
            createdAt: editingId ? undefined : new Date(),
            isActive: true,
        };
        try {
            if (editingId) {
                await updateDoc(doc(db, 'products', editingId), productData);
                toast.success('Cập nhật sản phẩm thành công!');
            } else {
                await addDoc(collection(db, 'products'), productData);
                toast.success('Thêm sản phẩm thành công!');
            }
            form.reset();
            setSelectedImages([]);
            setEditingId(null);
            fetchProducts();
        } catch (error) {
            console.error('Lỗi submit:', error);
            toast.error('Lỗi khi lưu sản phẩm!');
        }
    };

    const handleEdit = (product: Product): void => {
        form.reset({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,  // Pre-select categoryId
            stock: product.stock,
        });
        setSelectedImages(product.imageUrls || []);
        setEditingId(product.id);
    };

    const handleDelete = async (id: string): Promise<void> => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await deleteDoc(doc(db, 'products', id));
            fetchProducts();
            toast.success('Xóa sản phẩm thành công!');
        } catch (error) {
            console.error('Lỗi delete:', error);
            toast.error('Lỗi khi xóa sản phẩm!');
        }
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-bold">Quản Lý Sản Phẩm</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{editingId ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên Sản Phẩm</Label>
                            <Input id="name" {...form.register('name')} />
                            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô Tả</Label>
                            <Textarea id="description" {...form.register('description')} />
                            {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Giá (VND)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...form.register('price', { valueAsNumber: true })}
                                />
                                {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
                            </div>

                            {/* Thay Input bằng Select cho categoryId */}
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Danh Mục</Label>
                                <Select
                                    onValueChange={(value) => form.setValue('categoryId', value)}  // Set value cho form
                                    defaultValue={form.watch('categoryId')}  // Pre-select khi edit
                                >
                                    <SelectTrigger id="categoryId">
                                        <SelectValue placeholder="Chọn danh mục..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat: Category) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.categoryId && <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Tồn Kho</Label>
                            <Input
                                id="stock"
                                type="number"
                                {...form.register('stock', { valueAsNumber: true })}
                            />
                            {form.formState.errors.stock && <p className="text-sm text-red-500">{form.formState.errors.stock.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Ảnh Sản Phẩm</Label>
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {uploading && <p className="text-sm text-blue-500">Uploading... {Math.round(progress)}%</p>}
                            {selectedImages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedImages.map((img, idx) => (
                                        <Dialog key={idx}>
                                            <DialogTrigger asChild>
                                                <div className="relative">
                                                    <img
                                                        src={img}
                                                        alt={`Preview ${idx}`}
                                                        className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                                                    />
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Preview Ảnh {idx + 1}</DialogTitle>
                                                </DialogHeader>
                                                <img src={img} alt={`Full ${idx}`} className="w-full max-h-96 object-contain" />
                                            </DialogContent>
                                        </Dialog>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button type="submit" disabled={uploading || form.formState.isSubmitting} className="w-full">
                            {editingId ? 'Cập Nhật' : 'Thêm'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Danh Sách Sản Phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <p className="text-gray-500">Chưa có sản phẩm nào.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên</TableHead>
                                    <TableHead>Giá</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Trạng Thái</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((p: Product) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>{p.price.toLocaleString()} VND</TableCell>
                                        <TableCell>{p.stock}</TableCell>
                                        <TableCell>
                                            <Badge variant={p.isActive ? 'default' : 'secondary'}>
                                                {p.isActive ? 'Hoạt động' : 'Ẩn'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                                                Sửa
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                                                Xóa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}