import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import {
  authService,
  parentBooksService,
} from '../../services/firebaseService';
import ParentHeader from '../../components/ParentHeader';

const BookListScreen = ({ navigation }) => {
  const [parentBooks, setParentBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  const GENRES = [
    { id: 'all', label: 'Semua' },
    { id: 'keluarga', label: 'Keluarga' },
    { id: 'sains', label: 'Sains' },
    { id: 'hewan', label: 'Hewan' },
    { id: 'seni', label: 'Seni' },
    { id: 'pahlawan', label: 'Pahlawan' },
    { id: 'petualangan', label: 'Petualangan' },
  ];

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, selectedGenre, parentBooks]);

  const loadBooks = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      setCurrentUser(user);
      const books = await parentBooksService.getParentBooks(user.uid);

      setParentBooks(books);
      setFilteredBooks(books);
    } catch (error) {
      console.error('Load Books Error:', error);
      Alert.alert('Error', 'Gagal memuat daftar buku');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...parentBooks];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    setFilteredBooks(filtered);
  };

  const handleRemoveBook = book => {
    Alert.alert(
      'Hapus Buku',
      `Yakin ingin menghapus "${book.title}" dari koleksi?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await parentBooksService.removeBookFromParent(book.parentBookId);
              Alert.alert('Berhasil', 'Buku berhasil dihapus');
              loadBooks();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
  };

  const getCoverImage = genre => {
    const covers = {
      keluarga: require('../../assets/images/cover/keluarga_persahabatan.png'),
      sains: require('../../assets/images/cover/sains_teknologi.png'),
      hewan: require('../../assets/images/cover/dunia_hewan.png'),
      seni: require('../../assets/images/cover/seni_musik.png'),
      pahlawan: require('../../assets/images/cover/pahlawan_super.png'),
      petualangan: require('../../assets/images/cover/petualangan.png'),
    };
    return covers[genre] || covers.petualangan;
  };

  const getGenreIcon = genre => {
    const icons = {
      keluarga: require('../../assets/images/icon/keluarga.png'),
      sains: require('../../assets/images/icon/sains.png'),
      hewan: require('../../assets/images/icon/hewan.png'),
      seni: require('../../assets/images/icon/seni.png'),
      pahlawan: require('../../assets/images/icon/pahlawan.png'),
      petualangan: require('../../assets/images/icon/petualangan.png'),
    };
    return icons[genre] || icons.petualangan;
  };

  const getMoralIcon = moralValue => {
    const moralLower = moralValue?.toLowerCase() || '';
    if (moralLower.includes('kejujuran'))
      return require('../../assets/images/icon/kejujuran.png');
    if (moralLower.includes('empati'))
      return require('../../assets/images/icon/empati.png');
    if (moralLower.includes('keberanian'))
      return require('../../assets/images/icon/keberanian.png');
    if (moralLower.includes('tanggung jawab'))
      return require('../../assets/images/icon/tanggung_jawab.png');
    if (moralLower.includes('rasa hormat'))
      return require('../../assets/images/icon/rasa_hormat.png');
    return require('../../assets/images/icon/target.png');
  };

  const handleBookPress = book => {
    const isOwner = book.parentId === currentUser?.uid;

    // Convert images to array format
    const imagesArray = Array.isArray(book.images)
      ? book.images
      : book.images && typeof book.images === 'object'
        ? Object.values(book.images)
        : [];

    // Convert content to array format if needed
    const contentArray = Array.isArray(book.content)
      ? book.content
      : book.content && typeof book.content === 'object'
        ? Object.values(book.content)
        : [book.content];

    if (isOwner) {
      // Navigate to edit mode
      navigation.navigate('StoryEditorScreen', {
        storyData: {
          judul: book.title,
          cerita: book.content,
          images: book.images || {},
          full_story: contentArray.join(' '),
        },
        storageKey: book.id,
        themeData: { name: book.genre, label: book.genre },
        moralData: { name: book.moralValue },
        editMode: true,
        bookId: book.id,
        audioUrl: book.audioUrl,
        audioDuration: book.audioDuration,
      });
    } else {
      // Navigate to preview mode (read-only)
      navigation.navigate('StoryReader', {
        story: {
          title: book.title,
          content: contentArray,
          genre: book.genre,
          moralValue: book.moralValue,
          audioUrl: book.audioUrl,
          images: imagesArray,
          themeData: { label: book.genre, name: book.genre },
        },
      });
    }
  };

  const renderBookItem = ({ item }) => {
    const isOwner = item.parentId === currentUser?.uid;

    return (
      <View style={styles.bookItem}>
        <TouchableOpacity
          style={styles.bookContent}
          onPress={() => handleBookPress(item)}
          activeOpacity={0.7}>
          {/* Top Row: Cover + Title */}
          <View style={styles.topRow}>
            <Image
              source={getCoverImage(item.genre)}
              style={styles.bookCover}
              resizeMode="cover"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.bookTitle} numberOfLines={3}>
                {item.title}
              </Text>
            </View>
          </View>

          {/* Bottom Row: 4 Badges */}
          <View style={styles.badgesContainer}>
            {/* Moral Value Badge */}
            <View style={[styles.badgeItem, styles.badgeItemWide]}>
              <Image
                source={getMoralIcon(item.moralValue)}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText} numberOfLines={1}>
                {item.moralValue}
              </Text>
            </View>

            {/* Duration Badge */}
            <View style={[styles.badgeItem, styles.badgeItemWide]}>
              <Image
                source={require('../../assets/images/icon/clock.png')}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText}>{item.estimatedDuration}m</Text>
            </View>

            {/* Genre Badge */}
            <View style={[styles.badgeItem, styles.badgeItemWide]}>
              <Image
                source={getGenreIcon(item.genre)}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText} numberOfLines={1}>
                {item.genre}
              </Text>
            </View>

            {/* Age Range Badge */}
            <View style={[styles.badgeItem, styles.badgeItemWide]}>
              <Image
                source={require('../../assets/images/icon/kids.png')}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText} numberOfLines={1}>
                {item.ageRange} tahun
              </Text>
            </View>

            {/* Owner Badge (conditional) */}
            {isOwner && (
              <View style={[styles.badgeItem, styles.ownerBadge]}>
                <Image
                  source={require('../../assets/images/icon/orangtua.png')}
                  style={styles.badgeIcon}
                />
                <Text style={styles.ownerBadgeText}>Owner</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveBook(item)}>
          <Image
            source={require('../../assets/images/icon/reject.png')}
            style={styles.deleteIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Memuat koleksi buku...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ParentHeader
        title="Koleksi Buku"
        subtitle="Buku yang Ditampilkan ke Anak"
        onBackPress={() => navigation.goBack()}
        onAccountPress={() => navigation.navigate('SettingsScreen')}
        navigation={navigation}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={require('../../assets/images/icon/search.png')}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari judul buku..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Genre Filter */}
      <View style={styles.controlsContainer}>
        {/* Genre Filter */}
        <View style={styles.genreFilter}>
          <FlatList
            horizontal
            data={GENRES}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.genreChip,
                  selectedGenre === item.id && styles.genreChipActive,
                ]}
                onPress={() => setSelectedGenre(item.id)}>
                <Text
                  style={[
                    styles.genreChipText,
                    selectedGenre === item.id && styles.genreChipTextActive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Book List */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/images/icon/books.png')}
              style={styles.largeIcon}
            />
            <Text style={styles.emptyText}>Belum ada buku</Text>
            <Text style={styles.emptySubtext}>
              Tambahkan buku untuk anak Anda
            </Text>
          </View>
        }
      />

      {/* Add More Books Button */}
      <TouchableOpacity
        style={styles.addMoreButton}
        onPress={() => setShowAddModal(true)}>
        <Text style={styles.addMoreButtonText}>+ Tambah Buku Lainnya</Text>
      </TouchableOpacity>

      {/* Add Modal - Choose Method */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Buku</Text>
            <Text style={styles.modalSubtitle}>Pilih metode penambahan</Text>

            <TouchableOpacity
              style={styles.methodCard}
              onPress={() => {
                setShowAddModal(false);
                navigation.navigate('GlobalBookList');
              }}>
              <View style={styles.methodIconBox}>
                <Image
                  source={require('../../assets/images/icon/book.png')}
                  style={styles.methodIcon}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Buku Global</Text>
                <Text style={styles.methodDesc}>
                  Pilih dari koleksi buku yang sudah ada
                </Text>
              </View>
              <Image
                source={require('../../assets/images/icon/right_arrow.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodCard}
              onPress={() => {
                setShowAddModal(false);
                navigation.navigate('GenerateStory');
              }}>
              <View style={styles.methodIconBox}>
                <Image
                  source={require('../../assets/images/icon/lamp.png')}
                  style={styles.methodIcon}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Generate Cerita</Text>
                <Text style={styles.methodDesc}>
                  Buat cerita baru sesuai keinginan
                </Text>
              </View>
              <Image
                source={require('../../assets/images/icon/right_arrow.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCloseText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.medium,
    color: '#E91E63',
    fontWeight: FONTS.weights.semibold,
  },
  largeIcon: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    width: 30,
    height: 30,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.medium,
    color: '#212121',
  },
  controlsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  genreFilter: {
    marginBottom: SPACING.md,
  },
  genreChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genreChipActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  genreChipText: {
    fontSize: FONTS.sizes.small,
    color: '#616161',
    fontWeight: FONTS.weights.semibold,
  },
  genreChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  bookItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  bookContent: {
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  bookCover: {
    width: 80,
    height: 100,
    borderRadius: 12,
    marginRight: SPACING.md,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    lineHeight: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  badgeItemWide: {
    flex: 1,
    minWidth: 100,
  },
  badgeIcon: {
    width: 18,
    height: 18,
  },
  badgeText: {
    fontSize: FONTS.sizes.tiny,
    color: '#616161',
    fontWeight: FONTS.weights.semibold,
    flex: 1,
  },
  ownerBadge: {
    backgroundColor: '#E91E63',
  },
  ownerBadgeText: {
    fontSize: FONTS.sizes.tiny,
    color: '#FFFFFF',
    fontWeight: FONTS.weights.bold,
  },

  deleteButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: '#E91E63',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.bold,
    color: '#212121',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.medium,
    color: '#757575',
  },
  addMoreButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E91E63',
    borderStyle: 'dashed',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  addMoreButtonText: {
    color: '#ff4784',
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.heavy,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.xl,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONTS.sizes.small,
    color: '#757575',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  methodIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  methodIcon: {
    width: 36,
    height: 36,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.bold,
    color: '#212121',
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: FONTS.sizes.small,
    color: '#757575',
  },
  arrowIcon: {
    width: 32,
    height: 32,
  },
  modalCloseButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.sm,
  },
  modalCloseText: {
    color: '#616161',
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
  },
});

export default BookListScreen;
