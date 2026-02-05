import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { authService, statsService } from '../../services/firebaseService';
import ParentHeader from '../../components/ParentHeader';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parentProfile, setParentProfile] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [triviaList, setTriviaList] = useState([]);
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);

  // Reload dashboard every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, []),
  );

  const loadDashboard = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        navigation.replace('Login');
        return;
      }

      const profile = await authService.getParentProfile(user.uid);
      const readingStats = await statsService.getReadingStats(user.uid);
      const monthly = await statsService.getMonthlyProgress(user.uid);
      const trivia = await statsService.getTrivia();

      setParentProfile(profile);
      setStats(readingStats);
      setMonthlyData(monthly || []);
      setTriviaList(trivia || []);
    } catch (error) {
      console.error('Load Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-slide trivia every 5 seconds
  useEffect(() => {
    if (triviaList.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTriviaIndex(prev => (prev + 1) % triviaList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [triviaList]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.replace('Main');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </View>
    );
  }

  // Prepare chart data
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  // Get last 6 months labels correctly
  const currentMonth = new Date().getMonth();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    last6Months.push(monthNames[monthIndex]);
  }

  const chartData = monthlyData.slice(-6).map(item => item.count || 0);
  const maxValue = Math.max(...chartData, 10);

  return (
    <View style={styles.container}>
      <ParentHeader
        title="Dashboard"
        subtitle="Statistik Pembelajaran"
        onBackPress={() => navigation.navigate('Main')}
        onAccountPress={() => navigation.navigate('SettingsScreen')}
        navigation={navigation}
      />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Trivia Slider */}
        <View style={styles.triviaCard}>
          {triviaList.length > 0 ? (
            <View style={styles.triviaContent}>
              <View style={styles.triviaTextContainer}>
                <Text style={styles.triviaTitle}>Tahukah Anda?</Text>
                <Text style={styles.triviaText}>
                  {triviaList[currentTriviaIndex]?.content}
                </Text>
              </View>
              <View style={styles.triviaIndicators}>
                {triviaList.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentTriviaIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.triviaContent}>
              <Text style={styles.triviaTitle}>
                Halo, {parentProfile?.username}!
              </Text>
              <Text style={styles.triviaText}>
                Lihat perkembangan belajar anak Anda
              </Text>
            </View>
          )}
        </View>

        {/* Stats Cards Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCard1]}>
              <View style={styles.statContent}>
                <View style={styles.statTextBox}>
                  <Text style={styles.statNumber}>
                    {stats?.totalBooks || 0}
                  </Text>
                  <Text style={styles.statLabel}>Buku Selesai</Text>
                </View>
                <View style={styles.statIconBox}>
                  <Image
                    source={require('../../assets/images/icon/book.png')}
                    style={styles.statIcon}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.statCard, styles.statCard2]}>
              <View style={styles.statContent}>
                <View style={styles.statTextBox}>
                  <Text style={styles.statNumber}>
                    {stats?.totalMinutes || 0}
                  </Text>
                  <Text style={styles.statLabel}>Total Menit</Text>
                </View>
                <View style={styles.statIconBox}>
                  <Image
                    source={require('../../assets/images/icon/clock.png')}
                    style={styles.statIcon}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCard3]}>
              <View style={styles.statContent}>
                <View style={styles.statTextBox}>
                  <Text style={styles.statNumber}>
                    {stats?.totalRegisteredBooks || 0}
                  </Text>
                  <Text style={styles.statLabel}>Buku Koleksi</Text>
                </View>
                <View style={styles.statIconBox}>
                  <Image
                    source={require('../../assets/images/icon/genre.png')}
                    style={styles.statIcon}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.statCard, styles.statCard4]}>
              <View style={styles.statContent}>
                <View style={styles.statTextBox}>
                  <Text style={styles.statNumber}>
                    {Math.round(stats?.averageSessionTime || 0)}
                  </Text>
                  <Text style={styles.statLabel}>Buku/Menit</Text>
                </View>
                <View style={styles.statIconBox}>
                  <Image
                    source={require('../../assets/images/icon/chart.png')}
                    style={styles.statIcon}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Monthly Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Progres Bulanan</Text>
              <Text style={styles.chartSubtitle}>Buku yang diselesaikan</Text>
            </View>
          </View>

          {/* Custom Bar Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              {[
                maxValue,
                Math.floor(maxValue * 0.66),
                Math.floor(maxValue * 0.33),
                0,
              ].map((val, idx) => (
                <Text key={idx} style={styles.yAxisLabel}>
                  {val}
                </Text>
              ))}
            </View>

            <View style={styles.chartBars}>
              {chartData.map((value, index) => {
                const height = maxValue > 0 ? (value / maxValue) * 120 : 0;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      {value > 0 && (
                        <Text style={styles.barValue}>{value}</Text>
                      )}
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(height, 4),
                            backgroundColor:
                              index === chartData.length - 1
                                ? '#E91E63'
                                : '#FFB3C6',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{last6Months[index]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
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
    color: '#C62828',
    fontWeight: FONTS.weights.semibold,
  },

  scrollContent: {
    flex: 1,
  },

  // Trivia Slider
  triviaCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    minHeight: 140,
  },
  triviaContent: {
    flexDirection: 'column',
  },
  triviaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  triviaEmoji: {
    fontSize: 28,
  },
  triviaTextContainer: {
    flex: 1,
  },
  triviaTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: '#E91E63',
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  triviaText: {
    fontSize: FONTS.sizes.small + 2,
    color: '#616161',
    fontWeight: FONTS.weights.medium,
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  triviaIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  activeIndicator: {
    width: 20,
    backgroundColor: '#E91E63',
  },

  // Stats Container
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statCard1: {
    backgroundColor: '#FFF3E0',
  },
  statCard2: {
    backgroundColor: '#E3F2FD',
  },
  statCard3: {
    backgroundColor: '#F3E5F5',
  },
  statCard4: {
    backgroundColor: '#E8F5E9',
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTextBox: {
    flex: 1,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: SPACING.xs / 2,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FONTS.sizes.small,
    color: '#616161',
    fontWeight: FONTS.weights.semibold,
  },

  // Chart Card
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  chartTitle: {
    fontSize: FONTS.sizes.xlarge,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    letterSpacing: 0.2,
  },
  chartSubtitle: {
    fontSize: FONTS.sizes.small,
    color: '#757575',
    fontWeight: FONTS.weights.medium,
    marginTop: 2,
  },
  chartFilterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  chartFilterText: {
    fontSize: FONTS.sizes.small,
    color: '#616161',
    fontWeight: FONTS.weights.semibold,
  },

  // Custom Bar Chart
  chartContainer: {
    flexDirection: 'row',
    height: 160,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingRight: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  yAxisLabel: {
    fontSize: FONTS.sizes.tiny,
    color: '#9E9E9E',
    fontWeight: FONTS.weights.medium,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: 32,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 4,
  },
  barValue: {
    fontSize: FONTS.sizes.tiny,
    color: '#212121',
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: FONTS.sizes.tiny,
    color: '#ff6464',
    fontWeight: FONTS.weights.medium,
    marginTop: 8,
  },

  // Actions Card
  actionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: FONTS.sizes.large,
    fontWeight: FONTS.weights.heavy,
    color: '#212121',
    marginBottom: SPACING.lg,
    letterSpacing: 0.2,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionIcon: {
    width: 28,
    height: 28,
    tintColor: '#616161',
  },
  actionLabel: {
    fontSize: FONTS.sizes.small,
    color: '#616161',
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: SPACING.xxl * 2,
  },
});

export default DashboardScreen;
