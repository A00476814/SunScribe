import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import * as Location from 'expo-location';

const API_URL = 'https://api.open-meteo.com/v1/forecast';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export default class CurrentLocationWeatherScreen extends Component {
  state = {
    locationName: '',
    weatherData: null,
    errorMsg: null,
  };

  componentDidMount() {
    this.getLocationAndWeatherData();
  }

  getLocationAndWeatherData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        this.setState({ errorMsg: 'Permission to access location was denied' });
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const weatherData = await this.fetchWeatherData(location.coords.latitude, location.coords.longitude);
      const locationName = await this.fetchLocationName(location.coords.latitude, location.coords.longitude);
      this.setState({ weatherData, locationName });
    } catch (error) {
      this.setState({ errorMsg: 'Error fetching data' });
    }
  };

  fetchWeatherData = async (latitude, longitude) => {
    const response = await fetch(`${API_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,wind_speed_10m`);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return response.json();
  };

  fetchLocationName = async (latitude, longitude) => {
    const response = await fetch(`${NOMINATIM_URL}?format=json&lat=${latitude}&lon=${longitude}`);
    if (!response.ok) {
      throw new Error('Failed to fetch location name');
    }
    const data = await response.json();
    return data.display_name; // Adjust based on the API response structure
  };

  render() {
    const { locationName, weatherData, errorMsg } = this.state;

    if (errorMsg) {
      return <View style={styles.centered}><Text style={styles.errorText}>{errorMsg}</Text></View>;
    }

    if (!weatherData) {
      return <View style={styles.centered}><ActivityIndicator size="large" color="#6200ee" /></View>;
    }

    return (
      <ScrollView style={styles.container}>
        <Card style={styles.weatherCard}>
          <Card.Title title="Current Weather" subtitle={locationName} titleNumberOfLines={2} subtitleNumberOfLines={2} />
          <Card.Content>
            <Text style={styles.weatherText}>Temperature: {weatherData.hourly.temperature_2m[0]}°C</Text>
            <Text style={styles.weatherText}>Wind Speed: {weatherData.hourly.wind_speed_10m[0]} km/h</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  weatherCard: {
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#ffffff',
    marginVertical: 8,
  },
  weatherText: {
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
