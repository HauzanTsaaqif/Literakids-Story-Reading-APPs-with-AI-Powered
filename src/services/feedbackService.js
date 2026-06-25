import { firestore } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export const feedbackService = {
  /**
   * CREATE: Menambahkan feedback baru
   */
  createFeedback: async (parentId, masterBookId, feedbackData) => {
    try {
      // (Opsional) Cek apakah user sudah pernah memberi feedback untuk buku ini
      const q = query(
        collection(firestore, 'feedbacks'),
        where('parentId', '==', parentId),
        where('masterBookId', '==', masterBookId),
      );
      const existingDocs = await getDocs(q);

      if (!existingDocs.empty) {
        throw new Error(
          'Feedback untuk buku ini sudah ada. Silakan gunakan update.',
        );
      }

      const docRef = await addDoc(collection(firestore, 'feedbacks'), {
        parentId,
        masterBookId,
        visualAppealScore: feedbackData.visualAppealScore, // 1-5
        cognitiveLoadScore: feedbackData.cognitiveLoadScore, // 1-5
        engagementScore: feedbackData.engagementScore, // 0-2 (No/Maybe/Yes)
        moralEvaluation:
          typeof feedbackData.moralEvaluation === 'boolean'
            ? feedbackData.moralEvaluation
            : null,
        moralValue: feedbackData.moralValue || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Create Feedback Error:', error);
      throw error;
    }
  },

  /**
   * GET ALL: Mengambil semua feedback (Bisa difilter berdasarkan masterBookId jika perlu)
   */
  getAllFeedbacks: async (masterBookId = null) => {
    try {
      let q;
      if (masterBookId) {
        // Ambil semua feedback untuk 1 buku tertentu
        q = query(
          collection(firestore, 'feedbacks'),
          where('masterBookId', '==', masterBookId),
          orderBy('createdAt', 'desc'),
        );
      } else {
        // Ambil SEMUA feedback di database
        q = query(
          collection(firestore, 'feedbacks'),
          orderBy('createdAt', 'desc'),
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
    } catch (error) {
      console.error('Get All Feedbacks Error:', error);
      throw error;
    }
  },

  /**
   * GET DETAIL: Mengambil 1 feedback spesifik berdasarkan ID Document
   */
  getFeedbackById: async feedbackId => {
    try {
      const docRef = doc(firestore, 'feedbacks', feedbackId);
      const docSnap = await getDoc(docRef);

      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Get Feedback By ID Error:', error);
      throw error;
    }
  },

  /**
   * UPDATE: Memperbarui feedback yang sudah ada
   */
  updateFeedback: async (feedbackId, updatedData) => {
    try {
      const docRef = doc(firestore, 'feedbacks', feedbackId);
      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Update Feedback Error:', error);
      throw error;
    }
  },

  /**
   * DELETE: Menghapus feedback
   */
  deleteFeedback: async feedbackId => {
    try {
      const docRef = doc(firestore, 'feedbacks', feedbackId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Delete Feedback Error:', error);
      throw error;
    }
  },
};

export default feedbackService;
