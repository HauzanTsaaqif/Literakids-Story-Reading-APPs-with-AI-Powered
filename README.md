# LITERAKIDS: Platform Literasi Digital Berbasis Generative Artificial Intelligence dengan Personalisasi Nilai Moral sebagai Katalisator Nilai Moral Anak

LiteraKids adalah ekosistem literasi digital adaptif berbasis React Native & Expo yang ditenagai oleh Generative Artificial Intelligence (LLM). Menggabungkan keandalan software engineering dan landasan pedagogis pendidikan anak usia dini, platform ini memampukan orang tua untuk mempersonalisasi narasi cerita berdasarkan nilai moral secara dinamis. Dengan mengusung arsitektur Human-in-the-Loop, LiteraKids hadir sebagai katalisator pendidikan karakter yang interaktif, aman, dan secara presisi disesuaikan dengan kapasitas kognitif anak.

## Fitur Utama

- Generate cerita dengan personalisasi nilai moral yang dapat ditanamkan secara fleksibel
- Membaca dan mendengarkan cerita


## AI & Model Integration

Aplikasi ini menggunakan model bahasa besar (LLM) yang telah di-fine-tune untuk menghasilkan cerita moral anak secara dinamis.

- **Running Server (Flask API)**: [https://colab.research.google.com/drive/1YSn9ArygzOmuubLFTxmPdD2bHYCLX8I5?usp=sharing](https://colab.research.google.com/drive/1YSn9ArygzOmuubLFTxmPdD2bHYCLX8I5?usp=sharing)
- **Dokumentasi Project AI (Colab)**: [https://colab.research.google.com/drive/1HZ6ikonQNIXFAiBujigfPz5m3JaYl3LE?usp=sharing](https://colab.research.google.com/drive/1HZ6ikonQNIXFAiBujigfPz5m3JaYl3LE?usp=sharing)
- **HuggingFace Model Repository**: [hauzantsaaqif/moral_story_generator_qwen_v5-LoRA](https://huggingface.co/hauzantsaaqif/moral_story_generator_qwen_v5-LoRA)

> **Catatan**: Pastikan Running Server di Google Colab sedang aktif agar fitur *AI Story Generator* di dalam aplikasi dapat berfungsi dengan baik.

---

## Teknologi yang Digunakan

- **Frontend**: React Native 0.76, Expo ~52.0.0, React Navigation v6
- **State & Storage**: AsyncStorage
- **Networking**: Axios
- **AI/Backend**: Custom API Python (Flask)
- **Model LLM**: FineTuned Qwen V5 ([hauzantsaaqif/moral_story_generator_qwen_v5-LoRA](https://huggingface.co/hauzantsaaqif/moral_story_generator_qwen_v5-LoRA))

---

### Menjalankan Project Locally

1. **Clone & Masuk ke direktori**
   ```bash
   cd literakids
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Jalankan server development**
   ```bash
   npm start
   ```

4. **Testing di Device**
   Buka aplikasi **Expo Go** di HP Anda, lalu scan QR Code yang muncul di terminal.

---
*Literakids: Personalizing today's stories for a future generation of character.*
