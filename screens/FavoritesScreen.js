import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabase('favorites.db');
const API_URL = 'https://api.open-meteo.com/v1/forecast';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(() => {
    setLoading(true);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM favorites',
        [],
        async (_, { rows: { _array } }) => {
          const favoritesWithWeather = await Promise.all(_array.map(async (fav) => {
            try {
              const response = await fetch(`${API_URL}?latitude=${fav.latitude}&longitude=${fav.longitude}&current_weather=true`);
              const data = await response.json();
              return { ...fav, temperature: data.current_weather.temperature };
            } catch (error) {
              console.error('Error fetching weather data:', error);
              return { ...fav, temperature: 'N/A' }; // Set temperature to 'N/A' if fetching fails
            }
          }));
          setFavorites(favoritesWithWeather);
          setLoading(false);
        },
        (_, error) => {
          console.error('Failed to load favorites from the database', error);
          setLoading(false);
        },
      );
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const removeFavorite = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM favorites WHERE id = ?',
        [id],
        (_, result) => {
          loadFavorites(); // Refresh the list after deletion
        },
        (_, error) => {
          Alert.alert('Error', 'Could not delete the location: ' + error.message);
        },
      );
    });
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.city}>{item.name}</Text>
      <Text style={styles.temperature}>{item.temperature}°C</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeFavorite(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavoriteItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  city: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  temperature: {
    fontSize: 18,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
