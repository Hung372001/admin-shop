import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cấu hình multer: lưu vào public/uploads/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];  // Hỗ trợ multiple files

        const urls: string[] = [];
        for (const file of files) {
            if (file instanceof File) {
                // Tạo buffer từ File
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Lưu file với multer logic (tương tự)
                const uploadDir = path.join(process.cwd(), 'public/uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const filename = `${uniqueSuffix}${path.extname(file.name)}`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, buffer);

                urls.push(`/uploads/${filename}`);  // Local URL
            }
        }

        return NextResponse.json({ urls }, { status: 200 });
    } catch (error) {
        console.error('Lỗi upload:', error);
        return NextResponse.json({ error: 'Upload thất bại' }, { status: 500 });
    }
}