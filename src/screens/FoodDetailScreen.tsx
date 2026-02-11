import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DatabaseService from '../services/database.service';

export default function FoodDetailScreen({ navigation, route }: any) {
  const { food, mealType } = route.params;
  const [servings, setServings] = useState('1');

  const servingsNum = parseFloat(servings) || 1;
  const totalCalories = Math.round(food.calories * servingsNum);
  const totalProtein = Math.round(food.protein * servingsNum);
  const totalCarbs = Math.round(food.carbs * servingsNum);
  const totalFats = Math.round(food.fats * servingsNum);

  const handleAddFood = async () => {
    if (servingsNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid serving amount');
      return;
    }
  
    try {
      await DatabaseService.addFoodLog(
        'demo-user',
        food.id,
        food.name_en,
        mealType,
        servingsNum,
        food.calories,
        food.protein,
        food.carbs,
        food.fats
      );
  
      Alert.alert('Success', `Added ${food.name_en} to ${mealType}!`, [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to Main tabs, then to Nutrition tab
            navigation.navigate('Main', { screen: 'NutritionTab' });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add food. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#27ae60', '#2ecc71']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>{food.name_en}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Serving Size Selector */}
        <View style={styles.servingCard}>
          <Text style={styles.sectionTitle}>Serving Size</Text>
          
          <View style={styles.servingControls}>
            <TouchableOpacity
              style={styles.servingButton}
              onPress={() => setServings(String(Math.max(0.5, servingsNum - 0.5)))}
            >
              <Text style={styles.servingButtonText}>−</Text>
            </TouchableOpacity>

            <View style={styles.servingInputContainer}>
              <TextInput
                style={styles.servingInput}
                value={servings}
                onChangeText={setServings}
                keyboardType="decimal-pad"
              />
              <Text style={styles.servingUnit}>
                × {food.serving_size}{food.serving_unit}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.servingButton}
              onPress={() => setServings(String(servingsNum + 0.5))}
            >
              <Text style={styles.servingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nutrition Facts */}
        <View style={styles.nutritionCard}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <Text style={styles.nutritionValue}>{totalCalories} kcal</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>💪 Protein</Text>
            <Text style={styles.nutritionValue}>{totalProtein}g</Text>
          </View>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>🌾 Carbohydrates</Text>
            <Text style={styles.nutritionValue}>{totalCarbs}g</Text>
          </View>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>🥑 Fats</Text>
            <Text style={styles.nutritionValue}>{totalFats}g</Text>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
          <LinearGradient
            colors={['#27ae60', '#2ecc71']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.addButtonText}>
              Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#e0ffe0',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  servingCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  servingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  servingInputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  servingInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    minWidth: 80,
  },
  servingUnit: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  nutritionCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#fff',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a3e',
    marginVertical: 8,
  },
  addButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});