/**
 * Script untuk populate initial data ke Firestore
 * Data buku dengan tema dan cover baru
 */

const INITIAL_BOOKS = [
  {
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
    coverImage: require('../assets/images/cover/keluarga_persahabatan.png'),
    ageRange: '6-9',
    estimatedDuration: 6,
    isGlobal: true,
  },
  {
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
    coverImage: require('../assets/images/cover/sains_teknologi.png'),
    ageRange: '6-9',
    estimatedDuration: 7,
    isGlobal: true,
  },
  {
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
    coverImage: require('../assets/images/cover/dunia_hewan.png'),
    ageRange: '3-6',
    estimatedDuration: 6,
    isGlobal: true,
  },
  {
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
    coverImage: require('../assets/images/cover/seni_musik.png'),
    ageRange: '4-7',
    estimatedDuration: 6,
    isGlobal: true,
  },
  {
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
    coverImage: require('../assets/images/cover/pahlawan_super.png'),
    ageRange: '5-8',
    estimatedDuration: 7,
    isGlobal: true,
  },
  {
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
    coverImage: require('../assets/images/cover/petualangan.png'),
    ageRange: '6-9',
    estimatedDuration: 8,
    isGlobal: true,
  },
];

export default INITIAL_BOOKS;
