import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import screen



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'OleoScript-Bold': require('./assets/fonts/Oleo_Script/OleoScript-Bold.ttf'),
      'OleoScript-Regular': require('./assets/fonts/Oleo_Script/OleoScript-Regular.ttf'),
      'Oxanium-Bold': require('./assets/fonts/Oxanium/static/Oxanium-Bold.ttf'),
      'Oxanium-SemiBold': require('./assets/fonts/Oxanium/static/Oxanium-SemiBold.ttf'),
      'Oxanium-Medium': require('./assets/fonts/Oxanium/static/Oxanium-Medium.ttf'),
      'Oxanium-Regular': require('./assets/fonts/Oxanium/static/Oxanium-Regular.ttf'),
      'Oxanium-Light': require('./assets/fonts/Oxanium/static/Oxanium-Light.ttf'),
      'Oxanium-ExtraLight': require('./assets/fonts/Oxanium/static/Oxanium-ExtraLight.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
