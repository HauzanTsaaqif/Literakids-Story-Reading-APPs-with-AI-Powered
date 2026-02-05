// Data cerita untuk anak-anak
export const STORIES = [
  {
    id: '1',
    title: 'Petualangan Kelinci Putih',
    genre: 'animals',
    coverImage: '🐰',
    ageRange: '3-6',
    duration: '5 menit',
    pages: [
      {
        id: 1,
        text: 'Di hutan yang hijau, hiduplah seekor kelinci putih bernama Luna.',
        image: '🐰🌳',
      },
      {
        id: 2,
        text: 'Luna suka sekali melompat-lompat di padang rumput yang luas.',
        image: '🐰🌾',
      },
      {
        id: 3,
        text: 'Suatu hari, Luna bertemu dengan kupu-kupu warna-warni.',
        image: '🐰🦋',
      },
      {
        id: 4,
        text: 'Mereka bermain bersama dan menjadi teman baik.',
        image: '🐰🦋💛',
      },
      {
        id: 5,
        text: 'Luna belajar bahwa teman bisa datang dari mana saja!',
        image: '🐰🦋✨',
      },
    ],
  },
  {
    id: '2',
    title: 'Raja Singa yang Baik Hati',
    genre: 'animals',
    coverImage: '🦁',
    ageRange: '4-7',
    duration: '6 menit',
    pages: [
      {
        id: 1,
        text: 'Raja Singa adalah pemimpin hutan yang bijaksana.',
        image: '🦁👑',
      },
      {
        id: 2,
        text: 'Setiap pagi, dia membantu hewan-hewan yang kesusahan.',
        image: '🦁🐘🦒',
      },
      {
        id: 3,
        text: 'Semua hewan mencintai Raja Singa karena kebaikannya.',
        image: '🦁❤️',
      },
    ],
  },
  {
    id: '3',
    title: 'Petualangan ke Pulau Ajaib',
    genre: 'adventure',
    coverImage: '🏝️',
    ageRange: '5-9',
    duration: '8 menit',
    pages: [
      {
        id: 1,
        text: 'Tiga sahabat menemukan peta menuju pulau ajaib.',
        image: '🗺️👦👧',
      },
      {
        id: 2,
        text: 'Mereka berlayar melintasi lautan biru yang luas.',
        image: '⛵🌊',
      },
      {
        id: 3,
        text: 'Di pulau itu, mereka menemukan harta karun persahabatan.',
        image: '🏝️💎',
      },
    ],
  },
  {
    id: '4',
    title: 'Peri Bunga yang Ajaib',
    genre: 'fantasy',
    coverImage: '🧚',
    ageRange: '3-6',
    duration: '5 menit',
    pages: [
      {
        id: 1,
        text: 'Peri Lila tinggal di taman bunga yang indah.',
        image: '🧚🌸',
      },
      {
        id: 2,
        text: 'Setiap bunga yang dia sentuh akan berkilauan.',
        image: '🧚✨🌺',
      },
      {
        id: 3,
        text: 'Lila mengajarkan semua orang untuk mencintai alam.',
        image: '🧚🌈🌻',
      },
    ],
  },
  {
    id: '5',
    title: 'Belajar Angka Bersama Dino',
    genre: 'education',
    coverImage: '🦕',
    ageRange: '3-5',
    duration: '4 menit',
    pages: [
      {
        id: 1,
        text: 'Dino si dinosaur kecil suka berhitung!',
        image: '🦕1️⃣',
      },
      {
        id: 2,
        text: 'Ayo kita hitung apel merah: 1, 2, 3!',
        image: '🍎🍎🍎',
      },
      {
        id: 3,
        text: 'Dino senang bisa berhitung sampai 10!',
        image: '🦕🔢',
      },
    ],
  },
  {
    id: '6',
    title: 'Sahabat Sejati',
    genre: 'friendship',
    coverImage: '🤝',
    ageRange: '4-7',
    duration: '6 menit',
    pages: [
      {
        id: 1,
        text: 'Andi dan Budi adalah sahabat terbaik.',
        image: '👦👦',
      },
      {
        id: 2,
        text: 'Mereka selalu bermain dan berbagi mainan.',
        image: '🧸🚂',
      },
      {
        id: 3,
        text: 'Persahabatan adalah harta paling berharga!',
        image: '👦👦💛',
      },
    ],
  },
];

// Grup cerita berdasarkan genre
export const GENRES = [
  {
    id: 'keluarga',
    name: 'Keluarga & Persahabatan',
    icon: '👨‍👩‍👧‍👦',
    color: '#FFB6C1',
  },
  {
    id: 'sains',
    name: 'Sains & Teknologi',
    icon: '🔬',
    color: '#87CEEB',
  },
  {
    id: 'hewan',
    name: 'Dunia Hewan',
    icon: '🦁',
    color: '#98FB98',
  },
  {
    id: 'seni',
    name: 'Seni & Musik',
    icon: '🎨',
    color: '#FFD700',
  },
  {
    id: 'pahlawan',
    name: 'Pahlawan Super',
    icon: '🦸',
    color: '#FF6347',
  },
  {
    id: 'petualangan',
    name: 'Petualangan',
    icon: '🗺️',
    color: '#DDA0DD',
  },
];

export const getStoriesByGenre = (genre) => {
  return STORIES.filter((story) => story.genre === genre);
};

export const getStoryById = (id) => {
  return STORIES.find((story) => story.id === id);
};
