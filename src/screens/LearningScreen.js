import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const LearningScreen = ({ route }) => {
  const category = route?.params?.category || 'Belajar';

  const lessons = [
    { id: 1, title: 'Mengenal Huruf A-Z', progress: 80, completed: false },
    { id: 2, title: 'Membaca Kata Sederhana', progress: 50, completed: false },
    { id: 3, title: 'Huruf Vokal', progress: 100, completed: true },
    { id: 4, title: 'Huruf Konsonan', progress: 60, completed: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pelajaran {category}</Text>
        <Text style={styles.subtitle}>Pilih pelajaran yang ingin dipelajari</Text>
      </View>

      <View style={styles.lessonsContainer}>
        {lessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonCard,
              lesson.completed && styles.completedCard,
            ]}>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${lesson.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{lesson.progress}% Selesai</Text>
            </View>
            {lesson.completed && (
              <Text style={styles.completedBadge}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  lessonsContainer: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  completedBadge: {
    fontSize: 30,
    color: '#4CAF50',
  },
});

export default LearningScreen;
