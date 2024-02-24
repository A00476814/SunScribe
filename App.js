import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import CurrentWeatherScreen from './screens/CurrentWeatherScreen';
import SearchScreen from './screens/SearchScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import NavigationScreen from './screens/NavigationScreen';
import 'react-native-gesture-handler';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  return (
    <DrawerContentScrollView>
      <View style={styles.drawerItemContainer}>
        <Text style={styles.drawerItemText}>SunScribe</Text>
      </View>
      <DrawerItem
        label="Current Weather"
        onPress={() => navigation.navigate('CurrentWeather')}
      />
      <DrawerItem
        label="Search"
        onPress={() => navigation.navigate('Search')}
      />
      <DrawerItem
        label="Favorites"
        onPress={() => navigation.navigate('Favorites')}
      />
    </DrawerContentScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="SunScribe"
        drawerContent={props => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Navigation" component={NavigationScreen} />
        <Drawer.Screen name="CurrentWeather" component={CurrentWeatherScreen} />
        <Drawer.Screen name="Search" component={SearchScreen} />
        <Drawer.Screen name="Favorites" component={FavoritesScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerItemContainer: {
    backgroundColor: '#FFFFE0', // Light yellow background
    borderRadius: 10, // Rounded corners
    padding: 10,
    marginVertical: 10,
  },
  drawerItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Text color
  },
});

export default App;
