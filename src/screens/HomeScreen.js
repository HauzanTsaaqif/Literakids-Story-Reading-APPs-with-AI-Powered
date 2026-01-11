import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card } from '../components/Card';

const HomeScreen = ({ navigation }) => {
  const categories = [
    { id: 1, title: 'Huruf', color: '#FF6B6B', icon: '🔤' },
    { id: 2, title: 'Kata', color: '#4ECDC4', icon: '📝' },
    { id: 3, title: 'Cerita', color: '#FFD93D', icon: '📚' },
    { id: 4, title: 'Permainan', color: '#95E1D3', icon: '🎮' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, Anak Pintar! 👋</Text>
        <Text style={styles.subtitle}>Mau belajar apa hari ini?</Text>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Learning', { category: category.title })}>
            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
              <Text style={styles.icon}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Progres Belajar</Text>
        <Card>
          <Text style={styles.progressText}>🌟 5 Pelajaran Selesai</Text>
          <Text style={styles.progressText}>⭐ 120 Bintang Terkumpul</Text>
          <Text style={styles.progressText}>🏆 3 Badge Didapat</Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 40,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
});

export default HomeScreen;
