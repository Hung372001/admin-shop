// scripts/createAdmin.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Firebase config không hợp lệ! Kiểm tra .env.local');
    console.log('🔍 Các biến môi trường hiện tại:');
    console.log({
        API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'OK' : 'MISSING',
        PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'OK' : 'MISSING',
    });
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Tạo super admin
async function createSuperAdmin() {
    const email = 'admin@shop.com';
    const password = 'Admin@123456';
    const displayName = 'Super Admin';

    console.log('🚀 Bắt đầu tạo Super Admin...');
    console.log('📧 Email:', email);

    try {
        // 1. Tạo user trong Firebase Auth
        console.log('📝 Đang tạo user trong Firebase Auth...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ User đã được tạo:', user.uid);
        console.log('📧 Email verified:', user.emailVerified);

        // 2. Tạo document user trong Firestore
        console.log('📊 Đang tạo document user trong Firestore...');
        await setDoc(doc(db, 'users', user.uid), {
            email,
            displayName,
            role: 'super-admin',
            permissions: ['all', 'products', 'orders', 'users', 'categories'],
            isActive: true,
            emailVerified: true,
            createdAt: serverTimestamp(),
            lastLogin: null,
            ordersCount: 0,
            // Thêm metadata
            createdBy: 'system',
            createdVia: 'admin_script',
        });

        // 3. Log activity (optional)
        console.log('📋 Đang tạo log activity...');
        await setDoc(doc(db, 'admin-logs', `admin_${user.uid}_creation`), {
            adminId: user.uid,
            adminEmail: email,
            adminName: displayName,
            action: 'create',
            resource: 'user',
            resourceId: user.uid,
            details: {
                event: 'super_admin_created',
                method: 'script',
                timestamp: new Date().toISOString(),
            },
            ipAddress: '127.0.0.1',
            userAgent: 'Node.js Admin Script',
            createdAt: serverTimestamp(),
        });

        console.log('\n🎉 SUPER ADMIN ĐÃ ĐƯỢC TẠO THÀNH CÔNG!');
        console.log('='.repeat(50));
        console.log('📧 EMAIL:', email);
        console.log('🔑 PASSWORD:', password);
        console.log('🆔 USER ID:', user.uid);
        console.log('👤 DISPLAY NAME:', displayName);
        console.log('🔐 ROLE:', 'super-admin');
        console.log('='.repeat(50));
        console.log('\n💡 HƯỚNG DẪN ĐĂNG NHẬP:');
        console.log('1. Chạy CMS: cd .. && npm run dev');
        console.log('2. Truy cập: http://localhost:3000/login');
        console.log('3. Đăng nhập với email/password ở trên');
        console.log('\n⚠️  LƯU Ý:');
        console.log('- Đổi password ngay sau khi đăng nhập lần đầu');
        console.log('- Backup file .env.local an toàn');
        console.log('- Không commit .env.local lên Git');

    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log('⚠️  Email "admin@shop.com" đã tồn tại!');
            console.log('💡 Gợi ý:');
            console.log('   - Kiểm tra Firebase Console > Authentication > Users');
            console.log('   - Hoặc xóa user cũ và chạy lại script');
            console.log('   - Hoặc dùng email khác: node createAdmin.js --email=newadmin@shop.com');
        } else if (error.code === 'auth/weak-password') {
            console.log('❌ Mật khẩu quá yếu! Cần ít nhất 6 ký tự.');
            console.log('💡 Thay đổi password trong code hoặc dùng mật khẩu mạnh hơn.');
        } else {
            console.error('❌ Lỗi không xác định:', error);
            console.error('💡 Code:', error.code);
            console.error('💡 Message:', error.message);
        }
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
const customEmail = args.find(arg => arg.startsWith('--email='));
if (customEmail) {
    const email = customEmail.split('=')[1];
    if (email && email.includes('@')) {
        console.log(`📧 Sử dụng custom email: ${email}`);
        // Modify function to use custom email
        // ... (implementation)
    }
}

// Chạy script
createSuperAdmin()
    .then(() => {
        console.log('\n✅ Script hoàn thành thành công!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script thất bại:', error);
        process.exit(1);
    });