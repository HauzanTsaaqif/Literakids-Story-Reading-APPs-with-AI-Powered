import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import {
  authService,
  booksService,
  parentBooksService,
} from '../../services/firebaseService';
import ParentHeader from '../../components/ParentHeader';
import { CommonActions } from '@react-navigation/native';

const GlobalBookListScreen = ({ navigation }) => {
  const [masterBooks, setMasterBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [initialParentBooks, setInitialParentBooks] = useState(new Set());
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
    loadMasterBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, selectedGenre, masterBooks]);

  const loadMasterBooks = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      setCurrentUser(user);

      // Load master books
      const books = await booksService.getAllMasterBooks();
      setMasterBooks(books);
      setFilteredBooks(books);

      // Load existing parent books
      const parentBooks = await parentBooksService.getParentBooks(user.uid);
      // Map to get the actual masterBook IDs
      const parentBookIds = new Set(parentBooks.map(book => book.id));
      setInitialParentBooks(parentBookIds);
      setSelectedBooks(new Set(parentBookIds)); // Auto-select existing books
    } catch (error) {
      console.error('Load Master Books Error:', error);
      Alert.alert('Error', 'Gagal memuat daftar buku global');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...masterBooks];

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

  const toggleBookSelection = bookId => {
    const newSelection = new Set(selectedBooks);
    if (newSelection.has(bookId)) {
      newSelection.delete(bookId);
    } else {
      newSelection.add(bookId);
    }
    setSelectedBooks(newSelection);
  };

  const handleAddSelectedBooks = async () => {
    try {
      const rootNavigation = navigation.getParent() || navigation;

      // Books to add (selected but not in initial)
      const booksToAdd = Array.from(selectedBooks).filter(
        bookId => !initialParentBooks.has(bookId),
      );

      // Books to remove (in initial but not selected)
      const booksToRemove = Array.from(initialParentBooks).filter(
        bookId => !selectedBooks.has(bookId),
      );

      const promises = [];

      // Add new books
      booksToAdd.forEach(bookId => {
        promises.push(
          parentBooksService.addBookToParent(currentUser.uid, bookId),
        );
      });

      // Remove unchecked books - need to find parentBookId first
      for (const bookId of booksToRemove) {
        promises.push(
          parentBooksService.removeBookByMasterBookId(currentUser.uid, bookId),
        );
      }

      if (promises.length === 0) {
        Alert.alert('Info', 'Tidak ada perubahan');
        return;
      }

      await Promise.all(promises);

      const message = [];
      if (booksToAdd.length > 0)
        message.push(`${booksToAdd.length} buku ditambahkan`);
      if (booksToRemove.length > 0)
        message.push(`${booksToRemove.length} buku dihapus`);

      Alert.alert('Berhasil', message.join(', '));
      // Reset the navigation state and open ParentAdmin -> BookList tab
      rootNavigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'ParentAdmin',
              // Provide nested state so the ParentAdmin tab navigator opens on BookList
              state: {
                index: 0,
                routes: [{ name: 'BookList' }],
              },
            },
          ],
        }),
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
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

  const renderBookItem = ({ item }) => {
    const isSelected = selectedBooks.has(item.id);

    return (
      <View style={styles.bookItem}>
        <TouchableOpacity
          style={styles.bookContent}
          onPress={() => toggleBookSelection(item.id)}
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

          {/* Bottom Row: 3 Badges */}
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
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkbox, isSelected && styles.checkboxActive]}
          onPress={() => toggleBookSelection(item.id)}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Memuat buku global...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ParentHeader
        title="Buku Global"
        subtitle="Pilih Buku untuk Ditambahkan"
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
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/images/icon/search.png')}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>Buku tidak ditemukan</Text>
            <Text style={styles.emptySubtext}>Coba kata kunci lain</Text>
          </View>
        }
      />

      {/* Bottom Bar - Always show when there are changes */}
      {(selectedBooks.size > 0 || initialParentBooks.size > 0) && (
        <View style={styles.bottomBar}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedCount}>
              {selectedBooks.size} buku dipilih
            </Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddSelectedBooks}>
            <Image
              source={require('../../assets/images/icon/accept.png')}
              style={styles.buttonIcon}
            />
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      )}
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
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
    flexGrow: 1,
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
  checkbox: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: FONTS.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.medium,
    color: '#757575',
    fontWeight: FONTS.weights.medium,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedCount: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    letterSpacing: 0.2,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    gap: SPACING.xs,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.sizes.medium,
    fontWeight: FONTS.weights.heavy,
  },
});

export default GlobalBookListScreen;
