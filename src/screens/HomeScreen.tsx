import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import DatabaseService from '../services/database.service';
import PixelAvatar from '../components/PixelAvatar';
import GlassCard from '../components/GlassCard';
import { 
  LightningIcon, 
  AppleIcon, 
  FireIcon, 
  TargetIcon,
  HistoryIcon,
} from '../components/Icons';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getLevel = () => {
    if (totalWorkouts < 5) return 0;
    if (totalWorkouts < 15) return 1;
    if (totalWorkouts < 30) return 2;
    if (totalWorkouts < 50) return 3;
    if (totalWorkouts < 75) return 4;
    return 5;
  };

  const level = getLevel();

  const avatarScale = useRef(new Animated.Value(1)).current;
  const prevLevel = useRef(level); 

  const getLevelName = () => {
    const levelNames = ['Rookie', 'Novice', 'Intermediate', 'Advanced', 'Expert', 'Master'];
    return levelNames[getLevel()];
  };

  const getNextLevelWorkouts = () => {
    const thresholds = [5, 15, 30, 50, 75, 100];
    const level = getLevel();
    if (level >= 5) return 100;
    return thresholds[level];
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const userId = 'demo-user';
      
      const total = await DatabaseService.getWorkoutCount(userId);
      const weekly = await DatabaseService.getWeeklyWorkoutCount(userId);
      
      setTotalWorkouts(total);
      setWeeklyWorkouts(weekly);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (prevLevel.current !== level && level > prevLevel.current) {
      // Animate avatar transformation
      Animated.sequence([
        Animated.timing(avatarScale, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      
      prevLevel.current = level;
    }
  }, [level]);
  
  const nextLevelWorkouts = getNextLevelWorkouts();
  const workoutsToLevel = nextLevelWorkouts - totalWorkouts;
  const xp = totalWorkouts * 50;
  const levelProgress = level >= 5 ? 1 : totalWorkouts / nextLevelWorkouts;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>Warrior</Text>
            </View>
          </View>

          
          <GlassCard gradient glow style={styles.avatarCard}>
            <View style={styles.avatarContainer}>
              <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                  <PixelAvatar level={level} size={100} glowing={level >= 3} />
              </Animated.View>
  
            <View style={styles.levelInfo}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{level}</Text>
              </View>
              <Text style={styles.levelName}>{getLevelName()}</Text>
              <Text style={styles.xpText}>{xp} XP</Text>
            </View>
          </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {level >= 5 ? 'Max Level!' : `${workoutsToLevel} workouts to level up`}
              </Text>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[colors.accent.primary, colors.accent.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${levelProgress * 100}%` }]}
                />
              </View>
            </View>
          </GlassCard>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <GlassCard gradient style={styles.statCard}>
              <Text style={styles.statNumber}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </GlassCard>

            <GlassCard gradient style={styles.statCard}>
              <Text style={styles.statNumber}>{weeklyWorkouts}</Text>
              <Text style={styles.statLabel}>Weekly</Text>
            </GlassCard>

            <GlassCard gradient style={styles.statCard}>
              <View style={styles.streakIcon}>
                <FireIcon size={22} color={colors.accent.warning} />
              </View>
              <Text style={styles.statLabel}>Streak</Text>
            </GlassCard>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => navigation.getParent()?.navigate('WorkoutLog')}
          >
            <LinearGradient
              colors={[colors.accent.primary, colors.accent.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <LightningIcon size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>START WORKOUT</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('WorkoutsTab')}
            >
              <GlassCard gradient style={styles.secondaryButtonCard}>
                <HistoryIcon size={24} color={colors.accent.tertiary} />
                <Text style={styles.secondaryButtonText}>History</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('NutritionTab')}
            >
              <GlassCard gradient style={styles.secondaryButtonCard}>
                <AppleIcon size={24} color={colors.accent.success} />
                <Text style={styles.secondaryButtonText}>Nutrition</Text>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Mission Card */}
          <GlassCard gradient style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <View style={styles.missionTitleRow}>
                <TargetIcon size={18} color={colors.accent.tertiary} />
                <Text style={styles.missionTitle}>Daily Mission</Text>
              </View>
              <View style={styles.missionReward}>
                <Text style={styles.missionRewardText}>+50 XP</Text>
              </View>
            </View>
            <Text style={styles.missionDescription}>
              {totalWorkouts === 0 
                ? 'Complete your first workout' 
                : 'Log a workout today to maintain your streak'}
            </Text>
          </GlassCard>

          <View style={{ height: 80 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  avatarCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  levelBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  levelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  xpText: {
    fontSize: 13,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glass.dark,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  streakIcon: {
    marginBottom: 4,
  },
  mainButton: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  secondaryButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  secondaryButton: {
    flex: 1,
  },
  secondaryButtonCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  missionCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  missionReward: {
    backgroundColor: colors.accent.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  missionRewardText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  missionDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});