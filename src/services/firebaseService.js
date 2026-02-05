import { auth, firestore } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

// =====================
// AUTHENTICATION SERVICE
// =====================

export const authService = {
  // Register new parent
  register: async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Create parent profile in Firestore
      await setDoc(doc(firestore, 'parents', user.uid), {
        email: userData.email,
        username: userData.username,
        gender: userData.gender,
        birthDate: userData.birthDate,
        childAge: userData.childAge,
        createdAt: serverTimestamp(),
        settings: {
          fontSize: 'medium',
          autoPlay: false,
          soundEnabled: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Register Error:', error);
      throw error;
    }
  },

  // Login parent
  login: async (emailOrUsername, password) => {
    try {
      let email = emailOrUsername;

      if (!emailOrUsername.includes('@')) {
        const q = query(
          collection(firestore, 'parents'),
          where('username', '==', emailOrUsername),
          limit(1),
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Username tidak ditemukan');
        }

        email = querySnapshot.docs[0].data().email;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential.user;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Get parent profile
  getParentProfile: async uid => {
    try {
      const docRef = doc(firestore, 'parents', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Get Parent Profile Error:', error);
      throw error;
    }
  },
};

// =====================
// BOOKS SERVICE
// =====================

export const booksService = {
  getAllMasterBooks: async () => {
    try {
      const q = query(
        collection(firestore, 'masterBooks'),
        orderBy('createdAt', 'desc'),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
    } catch (error) {
      console.error('Get Master Books Error:', error);
      throw error;
    }
  },

  getMasterBook: async bookId => {
    try {
      const docRef = doc(firestore, 'masterBooks', bookId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Get Master Book Error:', error);
      throw error;
    }
  },

  createMasterBook: async bookData => {
    try {
      const docRef = await addDoc(collection(firestore, 'masterBooks'), {
        title: bookData.title,
        content: bookData.content,
        genre: bookData.genre,
        moralValue: bookData.moralValue,
        coverEmoji: bookData.coverEmoji || '📖',
        ageRange: bookData.ageRange || '3-6',
        estimatedDuration: bookData.estimatedDuration || 5,
        createdAt: serverTimestamp(),
        isGlobal: true,
      });

      return docRef.id;
    } catch (error) {
      console.error('Create Master Book Error:', error);
      throw error;
    }
  },

  updateMasterBook: async (bookId, bookData) => {
    try {
      const docRef = doc(firestore, 'masterBooks', bookId);
      await updateDoc(docRef, {
        ...bookData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update Master Book Error:', error);
      throw error;
    }
  },

  deleteMasterBook: async bookId => {
    try {
      const docRef = doc(firestore, 'masterBooks', bookId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Delete Master Book Error:', error);
      throw error;
    }
  },
};

// =====================
// PARENT BOOKS SERVICE
// =====================

export const parentBooksService = {
  // Get all global books (for non-logged users)
  getAllBooks: async () => {
    try {
      return await booksService.getAllMasterBooks();
    } catch (error) {
      console.error('Get All Books Error:', error);
      throw error;
    }
  },

  getParentBooks: async parentId => {
    try {
      const q = query(
        collection(firestore, 'parentBooks'),
        where('parentId', '==', parentId),
      );
      const snapshot = await getDocs(q);

      const bookIds = snapshot.docs.map(
        docSnapshot => docSnapshot.data().masterBookId,
      );

      if (bookIds.length === 0) return [];

      const books = [];
      for (const bookId of bookIds) {
        const book = await booksService.getMasterBook(bookId);
        if (book) {
          const parentBookDoc = snapshot.docs.find(
            d => d.data().masterBookId === bookId,
          );
          books.push({
            ...book,
            parentBookId: parentBookDoc.id,
            addedAt: parentBookDoc.data().addedAt,
          });
        }
      }

      return books;
    } catch (error) {
      console.error('Get Parent Books Error:', error);
      throw error;
    }
  },

  addBookToParent: async (parentId, masterBookId) => {
    try {
      const q = query(
        collection(firestore, 'parentBooks'),
        where('parentId', '==', parentId),
        where('masterBookId', '==', masterBookId),
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        throw new Error('Buku sudah ada di koleksi');
      }

      const docRef = await addDoc(collection(firestore, 'parentBooks'), {
        parentId,
        masterBookId,
        addedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Add Book to Parent Error:', error);
      throw error;
    }
  },

  removeBookFromParent: async parentBookId => {
    try {
      const docRef = doc(firestore, 'parentBooks', parentBookId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Remove Book from Parent Error:', error);
      throw error;
    }
  },

  removeBookByMasterBookId: async (parentId, masterBookId) => {
    try {
      const q = query(
        collection(firestore, 'parentBooks'),
        where('parentId', '==', parentId),
        where('masterBookId', '==', masterBookId),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Buku tidak ditemukan di koleksi');
      }

      // Delete all matching documents (should be only one)
      const deletePromises = snapshot.docs.map(docSnapshot =>
        deleteDoc(doc(firestore, 'parentBooks', docSnapshot.id)),
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Remove Book by Master ID Error:', error);
      throw error;
    }
  },
};

// =====================
// STATS SERVICE
// =====================

export const statsService = {
  // Record book progress
  recordProgress: async (
    parentId,
    bookId,
    currentPage,
    totalPages,
    isCompleted = false,
  ) => {
    try {
      const progressRef = doc(
        firestore,
        'readingProgress',
        `${parentId}_${bookId}`,
      );
      const progressData = {
        parentId,
        bookId,
        currentPage,
        totalPages,
        isCompleted,
        lastReadAt: serverTimestamp(),
      };

      await setDoc(progressRef, progressData, { merge: true });

      // If completed, record in monthly stats
      if (isCompleted) {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const monthlyRef = doc(
          firestore,
          'monthlyStats',
          `${parentId}_${monthKey}`,
        );
        const monthlyDoc = await getDoc(monthlyRef);

        if (monthlyDoc.exists()) {
          await updateDoc(monthlyRef, {
            count: (monthlyDoc.data().count || 0) + 1,
            lastUpdated: serverTimestamp(),
          });
        } else {
          await setDoc(monthlyRef, {
            parentId,
            month: monthKey,
            count: 1,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });
        }

        // Record in reading sessions
        await addDoc(collection(firestore, 'readingSessions'), {
          parentId,
          bookId,
          duration: 15, // default duration
          completedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Record Progress Error:', error);
      throw error;
    }
  },

  // Get book progress
  getProgress: async (parentId, bookId) => {
    try {
      const progressRef = doc(
        firestore,
        'readingProgress',
        `${parentId}_${bookId}`,
      );
      const progressDoc = await getDoc(progressRef);
      return progressDoc.exists() ? progressDoc.data() : null;
    } catch (error) {
      console.error('Get Progress Error:', error);
      throw error;
    }
  },

  // Get monthly progress for charts
  getMonthlyProgress: async parentId => {
    try {
      const now = new Date();
      const monthlyData = [];

      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const monthlyRef = doc(
          firestore,
          'monthlyStats',
          `${parentId}_${monthKey}`,
        );
        const monthlyDoc = await getDoc(monthlyRef);

        monthlyData.push({
          month: monthKey,
          count: monthlyDoc.exists() ? monthlyDoc.data().count : 0,
        });
      }

      return monthlyData;
    } catch (error) {
      console.error('Get Monthly Progress Error:', error);
      return [];
    }
  },

  recordReading: async (parentId, bookId, duration) => {
    try {
      await addDoc(collection(firestore, 'readingSessions'), {
        parentId,
        bookId,
        duration,
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Record Reading Error:', error);
      throw error;
    }
  },

  getReadingStats: async parentId => {
    try {
      // Get reading sessions
      const sessionsQ = query(
        collection(firestore, 'readingSessions'),
        where('parentId', '==', parentId),
      );
      const sessionsSnapshot = await getDocs(sessionsQ);
      const sessions = sessionsSnapshot.docs.map(d => d.data());

      const totalBooks = new Set(sessions.map(s => s.bookId)).size;
      const totalMinutes = sessions.reduce(
        (sum, s) => sum + (s.duration || 0),
        0,
      );
      const totalSessions = sessions.length;

      // Get total registered books
      const parentBooksQ = query(
        collection(firestore, 'parentBooks'),
        where('parentId', '==', parentId),
      );
      const parentBooksSnapshot = await getDocs(parentBooksQ);
      const totalRegisteredBooks = parentBooksSnapshot.docs.length;

      return {
        totalBooks,
        totalMinutes,
        totalSessions,
        totalRegisteredBooks,
        averageSessionTime:
          totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      };
    } catch (error) {
      console.error('Get Reading Stats Error:', error);
      throw error;
    }
  },

  // Get trivia for dashboard
  getTrivia: async () => {
    try {
      const triviaQ = query(
        collection(firestore, 'trivia'),
        where('isActive', '==', true),
        orderBy('order', 'asc'),
      );
      const triviaSnapshot = await getDocs(triviaQ);
      return triviaSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Get Trivia Error:', error);
      // Return default trivia if Firestore fails
      return [
        {
          id: '1',
          content:
            'Anak usia dini (0-6 tahun) merupakan masa golden age dimana perkembangan otak mencapai 80% dari kapasitas orang dewasa.',
          order: 1,
          isActive: true,
        },
        {
          id: '2',
          content:
            'Membaca buku cerita selama 20 menit setiap hari dapat meningkatkan kemampuan literasi anak hingga 90%.',
          order: 2,
          isActive: true,
        },
        {
          id: '3',
          content:
            'Anak yang terbiasa dibacakan cerita memiliki kosakata 50% lebih banyak dibanding yang tidak.',
          order: 3,
          isActive: true,
        },
        {
          id: '4',
          content:
            'Interaksi saat membaca cerita dapat memperkuat ikatan emosional antara orang tua dan anak.',
          order: 4,
          isActive: true,
        },
        {
          id: '5',
          content:
            'Membaca cerita sebelum tidur membantu anak mengembangkan rutinitas yang sehat dan meningkatkan kualitas tidur.',
          order: 5,
          isActive: true,
        },
      ];
    }
  },
};

// =====================
// SETTINGS SERVICE
// =====================

export const settingsService = {
  updateSettings: async (parentId, settings) => {
    try {
      const docRef = doc(firestore, 'parents', parentId);
      await updateDoc(docRef, {
        settings: settings,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Update Settings Error:', error);
      throw error;
    }
  },

  getSettings: async parentId => {
    try {
      const docRef = doc(firestore, 'parents', parentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().settings : null;
    } catch (error) {
      console.error('Get Settings Error:', error);
      throw error;
    }
  },
};

export default {
  auth: authService,
  books: booksService,
  parentBooks: parentBooksService,
  stats: statsService,
  settings: settingsService,
};
