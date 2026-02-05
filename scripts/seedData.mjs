/**
 * Script untuk inject data awal ke Firestore
 * 
 * Cara menjalankan:
 * 1. Pastikan sudah mengaktifkan Authentication di Firebase Console
 * 2. Jalankan: node scripts/seedData.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBkumMHHOZRLHZABIq9oE-Qmso6TuUfrH0',
  authDomain: 'literakids-a05b3.firebaseapp.com',
  projectId: 'literakids-a05b3',
  storageBucket: 'literakids-a05b3.firebasestorage.app',
  messagingSenderId: '605290540376',
  appId: '1:605290540376:android:62a0180f4defd2b2ca092d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Data buku awal dengan genre baru
const initialBooks = [
  {
    id: 'book1',
    title: 'Sahabat Sejati',
    content: [
      'Tommy adalah anak baru di sekolah. Dia merasa kesepian karena belum punya teman. 😔',
      'Di waktu istirahat, Tommy duduk sendiri di pojok. Dia membawa kotak pensil warna kesayangannya. ✏️',
      'Seorang anak bernama Dika melihat Tommy sendirian. Dika menghampiri dengan senyum ramah. 😊',
      '"Halo! Namaku Dika. Mau bermain bersamaku?" tanya Dika. Tommy kaget tapi senang. 🤗',
      '"Aku Tommy. Aku suka menggambar," kata Tommy sambil menunjukkan pensilnya. 🎨',
      '"Wah! Aku juga suka menggambar!" seru Dika excited. Mereka mulai menggambar bersama. 🖍️',
      'Tommy menggambar rumah, Dika menggambar pohon. Mereka menggabungkan gambarnya jadi satu! 🏠🌳',
      'Sejak itu, Tommy dan Dika selalu bermain bersama. Mereka menjadi sahabat terbaik. 👦👦',
      'Tommy belajar bahwa teman sejati adalah yang menerima kita apa adanya. ❤️'
    ],
    genre: 'keluarga',
    moralValue: 'Persahabatan dimulai dengan kebaikan dan penerimaan',
    coverEmoji: '👦',
    ageRange: '6-9',
    estimatedDuration: 6,
    isGlobal: true,
  },
  {
    id: 'book2',
    title: 'Robot Riko Si Penjelajah Angkasa',
    content: [
      'Riko adalah robot pintar yang suka belajar tentang angkasa. 🤖✨',
      'Suatu hari, Riko menemukan teleskop di garasi. "Wah, aku bisa melihat bintang!" 🔭',
      'Riko mulai mengamati langit malam. Dia melihat bulan yang bersinar terang. 🌙',
      'Riko membuat roket mini dari kardus dan botol bekas. ♻️🚀',
      'Dengan bantuan energi surya, roket Riko berhasil meluncur ke langit! ☀️⚡',
      'Di angkasa, Riko bertemu satelit komunikasi. "Halo, Satelit! Aku Riko!" 📡',
      'Satelit bercerita tentang misi penting menjaga komunikasi di bumi. 🌍',
      'Riko turun ke bumi dengan parachute buatannya sendiri. 🪂',
      'Riko belajar bahwa sains membantu kita menjelajah dan memahami dunia. 🌟'
    ],
    genre: 'sains',
    moralValue: 'Rasa ingin tahu dan teknologi membawa petualangan',
    coverEmoji: '🤖',
    ageRange: '6-9',
    estimatedDuration: 7,
    isGlobal: true,
  },
  {
    id: 'book3',
    title: 'Raja Singa dan Tikus Kecil',
    content: [
      'Di hutan rimba, hiduplah Raja Singa yang sangat kuat. 🦁👑',
      'Suatu hari, Raja Singa menangkap seekor tikus kecil yang melewati kakinya. 🐭',
      '"Tolong lepaskan aku, Raja! Suatu hari aku akan membalas budimu!" pinta tikus. 🙏',
      'Raja Singa tertawa. "Kau terlalu kecil untuk membantuku!" tapi ia melepaskan tikus itu. 😊',
      'Beberapa hari kemudian, Raja Singa terjebak di jaring pemburu! 😱',
      'Tikus kecil mendengar auman Raja Singa. Dia berlari secepat mungkin. 🏃‍♂️💨',
      'Dengan gigi kecilnya, tikus menggerogoti jaring hingga putus! ✂️',
      'Raja Singa bebas! "Terima kasih, teman kecilku!" kata Raja Singa. 🤗',
      'Raja Singa belajar bahwa ukuran tidak menentukan kebesaran hati. ❤️'
    ],
    genre: 'hewan',
    moralValue: 'Kebaikan akan dibalas dan jangan meremehkan orang lain',
    coverEmoji: '🦁',
    ageRange: '3-6',
    estimatedDuration: 6,
    isGlobal: true,
  },
  {
    id: 'book4',
    title: 'Melody dan Piano Ajaib',
    content: [
      'Melody adalah gadis kecil yang suka mendengarkan musik. 🎵👧',
      'Di loteng rumah nenek, dia menemukan piano tua yang berdebu. 🎹',
      'Ketika Melody menekan tuts piano, musik indah mengalun! ✨',
      'Tiba-tiba, warna-warni cahaya keluar dari piano! 🌈',
      'Setiap not musik menciptakan warna berbeda di udara. Do merah, Re oranye! 🎨',
      'Melody bermain lagu ceria, dan seluruh ruangan dipenuhi cahaya indah. 💫',
      'Burung-burung datang ke jendela, ikut bernyanyi bersama Melody. 🐦🎶',
      'Nenek tersenyum. "Piano ini dulu milik kakekmu. Dia musisi hebat." 👴',
      'Melody belajar bahwa musik dan seni bisa membawa kebahagiaan. 🎼❤️'
    ],
    genre: 'seni',
    moralValue: 'Seni dan musik membawa keindahan dalam hidup',
    coverEmoji: '🎨',
    ageRange: '4-7',
    estimatedDuration: 6,
    isGlobal: true,
  },
  {
    id: 'book5',
    title: 'Super Kiko Penyelamat Kota',
    content: [
      'Kiko adalah anak biasa yang suka membantu orang lain. 👦💙',
      'Suatu hari, ia menemukan jubah bercahaya di taman kota. ✨🦸',
      'Ketika Kiko memakai jubah itu, ia bisa terbang dan sangat kuat! 🚀',
      'Tiba-tiba, Kiko mendengar teriakan. "Tolong! Kucingku di pohon tinggi!" 😱🐱',
      'Super Kiko terbang dan menyelamatkan kucing itu dengan hati-hati. 🦸‍♂️',
      'Esok hari, ada anak kecil tersesat di pasar. Super Kiko membantunya pulang. 👶🏠',
      'Lalu, ada nenek yang kesulitan menyeberang jalan. Super Kiko membantu nenek itu. 👵',
      'Kiko sadar, kekuatan super sesungguhnya adalah kebaikan hati! 💪❤️',
      'Kiko tidak perlu jubah untuk menjadi pahlawan. Setiap orang bisa jadi pahlawan! 🌟'
    ],
    genre: 'pahlawan',
    moralValue: 'Setiap orang bisa menjadi pahlawan dengan kebaikan',
    coverEmoji: '🦸',
    ageRange: '5-8',
    estimatedDuration: 7,
    isGlobal: true,
  },
  {
    id: 'book6',
    title: 'Petualangan ke Pulau Harta Karun',
    content: [
      'Rina dan Rudi menemukan peta harta karun di loteng rumah kakek. 🗺️',
      'Mereka memutuskan untuk berpetualang mencari Pulau Ajaib! ⛵',
      'Di perjalanan, mereka bertemu lumba-lumba yang ramah. 🐬',
      'Lumba-lumba membimbing mereka melewati ombak besar dengan aman. 🌊',
      'Sesampainya di pulau, mereka menemukan gua tersembunyi! 🏝️',
      'Di dalam gua, ada teka-teki: "Apa yang berharga tapi tak terlihat?" 🤔',
      'Rina dan Rudi berpikir keras. Akhirnya mereka menjawab: "Persahabatan!" 💡',
      'Gua terbuka dan mereka menemukan buku cerita ajaib! 📚✨',
      'Mereka belajar harta sejati adalah pengalaman dan kenangan bersama. ❤️'
    ],
    genre: 'petualangan',
    moralValue: 'Petualangan dan pengalaman lebih berharga dari harta',
    coverEmoji: '🗺️',
    ageRange: '6-9',
    estimatedDuration: 8,
    isGlobal: true,
  },
];

// Data akun orang tua
const parentAccount = {
  email: 'hauzantsaaqif@upi.edu',
  username: 'hauzan Edu',
  password: 'hauzanEDu132',
  gender: 'male',
  birthDate: '2003-03-10',
  childAge: 6,
};

async function seedData() {
  try {
    console.log('🚀 Memulai proses seeding data...\n');

    // Step 1: Membuat akun orang tua
    console.log('📝 Step 1: Membuat akun orang tua...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      parentAccount.email,
      parentAccount.password
    );
    const userId = userCredential.user.uid;
    console.log(`✅ Akun dibuat dengan UID: ${userId}`);

    // Step 2: Menyimpan profil orang tua ke Firestore
    console.log('\n📝 Step 2: Menyimpan profil orang tua...');
    await setDoc(doc(firestore, 'parents', userId), {
      email: parentAccount.email,
      username: parentAccount.username,
      gender: parentAccount.gender,
      birthDate: parentAccount.birthDate,
      childAge: parentAccount.childAge,
      settings: {
        fontSize: 'medium',
        autoPlay: false,
        soundEnabled: true,
      },
      createdAt: serverTimestamp(),
    });
    console.log('✅ Profil orang tua disimpan');

    // Step 3: Menambahkan buku ke masterBooks collection
    console.log('\n📝 Step 3: Menambahkan buku ke masterBooks...');
    for (const book of initialBooks) {
      const bookId = book.id;
      const bookData = { ...book };
      delete bookData.id; // Hapus id dari data
      bookData.createdAt = serverTimestamp();
      
      await setDoc(doc(firestore, 'masterBooks', bookId), bookData);
      console.log(`✅ Buku ditambahkan: ${book.title}`);
    }

    // Step 4: Menambahkan buku ke koleksi orang tua
    console.log('\n📝 Step 4: Menghubungkan buku dengan akun orang tua...');
    for (const book of initialBooks) {
      const parentBookId = `${userId}_${book.id}`;
      await setDoc(doc(firestore, 'parentBooks', parentBookId), {
        parentId: userId,
        masterBookId: book.id,
        addedAt: serverTimestamp(),
      });
      console.log(`✅ Buku dihubungkan: ${book.title}`);
    }

    console.log('\n\n🎉 SEEDING DATA BERHASIL! 🎉\n');
    console.log('📋 Ringkasan:');
    console.log(`   • Akun Orang Tua: ${parentAccount.email}`);
    console.log(`   • Password: ${parentAccount.password}`);
    console.log(`   • Username: ${parentAccount.username}`);
    console.log(`   • Total Buku: ${initialBooks.length}`);
    console.log('\n💡 Sekarang Anda bisa login menggunakan kredensial di atas!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n📋 Detail Error:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 Email sudah digunakan. Gunakan email lain atau hapus akun yang ada.');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.log('\n💡 Authentication belum diaktifkan di Firebase Console.');
      console.log('   Ikuti langkah berikut:');
      console.log('   1. Buka https://console.firebase.google.com/');
      console.log('   2. Pilih project literakids-a05b3');
      console.log('   3. Klik "Authentication" di menu kiri');
      console.log('   4. Klik tab "Sign-in method"');
      console.log('   5. Aktifkan "Email/Password"');
      console.log('   6. Jalankan script ini lagi');
    }
    
    process.exit(1);
  }
}

// Jalankan seeding
seedData();
