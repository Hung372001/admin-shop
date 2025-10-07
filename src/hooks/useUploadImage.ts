'use client';
import { useState } from 'react';

export const useUploadImage = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadImage = async (files: File[]): Promise<string[] | null> => {
        if (files.length === 0) return null;
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload thất bại');

            const data = await response.json();
            setProgress(100);
            return data.urls || [];
        } catch (error) {
            console.error('Lỗi upload:', error);
            return null;
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return { uploadImage, uploading, progress };
};