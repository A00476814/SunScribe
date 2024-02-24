import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Initialize the database
const db = SQLite.openDatabase('favorites.db');

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'https://api.open-meteo.com/v1/forecast';
  const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, latitude REAL, longitude REAL);',
      );
    });
  }, []);

  const searchLocation = async (query) => {
    try {
      const response = await fetch(`${GEO_API_URL}?name=${query}`);
      const data = await response.json();
      return data.results && data.results.length > 0 ? data.results[0] : null;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const response = await fetch(`${API_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const data = await response.json();
      return data.current_weather;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    const locationData = await searchLocation(query);
    if (locationData) {
      setLocation(locationData);
      const weatherData = await fetchWeatherData(locationData.latitude, locationData.longitude);
      setWeather(weatherData);
    } else {
      setError('Location not found');
      setWeather(null);
      setLocation(null);
    }
    setLoading(false);
  };

  const handleSaveToFavorites = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM favorites', [], (tx, results) => {
        const rows = results.rows._array;
        if (rows.length >= 4) {
          Alert.alert('Limit Reached', 'You can only save up to 4 locations. Please delete some to save new ones.');
        } else if (location) {
          tx.executeSql(
            'INSERT INTO favorites (name, latitude, longitude) VALUES (?, ?, ?)',
            [location.name, location.latitude, location.longitude],
            () => Alert.alert('Success', `${location.name} has been added to your favorites.`),
            (transaction, error) => Alert.alert('Error', error.message)
          );
        }
      });
    });
  };
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={handleSearch} disabled={loading} />
      {loading && <ActivityIndicator size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {weather && (
        <View style={styles.results}>
          <Text style={styles.resultItem}>{location?.name}</Text>
          <Text style={styles.resultItem}>Temperature: {weather.temperature}°C</Text>
          <Text style={styles.resultItem}>Wind Speed: {weather.windspeed} km/h</Text>
          <TouchableOpacity style={styles.button} onPress={handleSaveToFavorites}>
            <Text style={styles.buttonText}>Save to Favorites</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    marginBottom: 20,
  },
  results: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#eee',
    marginTop: 20,
  },
  resultItem: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});

export default SearchScreen;
