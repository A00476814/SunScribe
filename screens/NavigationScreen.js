import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const NavigationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button title="Current Weather" onPress={() => navigation.navigate('CurrentWeather')} />
      <Button title="Search Weather" onPress={() => navigation.navigate('Search')} />
      <Button title="Favorites" onPress={() => navigation.navigate('Favorites')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default NavigationScreen;
