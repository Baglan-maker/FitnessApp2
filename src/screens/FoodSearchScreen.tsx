import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DatabaseService from '../services/database.service';
import { SearchIcon, CloseIcon, AppleIcon } from '../components/Icons';
import { colors, borderRadius, spacing } from '../styles/theme'; 

interface FoodSearchScreenProps {
  navigation: any;
  route: any;
}

export default function FoodSearchScreen({ navigation, route }: FoodSearchScreenProps) {
  const { mealType } = route.params; // breakfast, lunch, dinner, or snack
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentFoods, setRecentFoods] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadRecentFoods();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchFoods();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadRecentFoods = async () => {
    const recent = await DatabaseService.getRecentFoods('demo-user', 5);
    setRecentFoods(recent);
  };

  const searchFoods = async () => {
    setIsSearching(true);
    const results = await DatabaseService.searchFoods(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleFoodSelect = (food: any) => {
    // Navigate to food detail screen with serving size selection
    navigation.navigate('FoodDetail', {
      food,
      mealType,
    });
  };

  const renderFoodItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleFoodSelect(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name_en}</Text>
        <Text style={styles.foodStats}>
          {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g • F: {item.fats}g
        </Text>
        <Text style={styles.servingSize}>
          per {item.serving_size}{item.serving_unit}
        </Text>
      </View>
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </View>
    </TouchableOpacity>
  );

  const getMealIcon = () => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍪';
      default: return '🍽️';
    }
  };

  const getMealTitle = () => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#27ae60', '#2ecc71']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>
          {getMealIcon()} Add to {getMealTitle()}
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <CloseIcon size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search Results */}
        {searchQuery.length >= 2 ? (
          <View style={styles.resultsContainer}>
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>
                  {isSearching ? 'Searching...' : 'No foods found'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Try a different search term
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Recent Foods */
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Foods</Text>
            {recentFoods.length > 0 ? (
              <FlatList
                data={recentFoods}
                renderItem={renderFoodItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyText}>No recent foods</Text>
                <Text style={styles.emptySubtext}>
                  Start by searching for foods above
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  // Update these styles
header: {
  paddingTop: 60,
  paddingBottom: spacing.lg,
  paddingHorizontal: spacing.xl,
},
headerTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#FFFFFF',
  marginBottom: spacing.md,
  letterSpacing: 0.5,
},
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.background.tertiary,
  borderRadius: borderRadius.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderWidth: 1,
  borderColor: colors.glass.border,
},
searchInput: {
  flex: 1,
  fontSize: 15,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  color: colors.text.primary,
},
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  foodItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  foodNameSecondary: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  foodStats: {
    fontSize: 13,
    color: '#3498db',
    marginBottom: 4,
  },
  servingSize: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});