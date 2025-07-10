import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import icons

// import screen
import Shop from './src/screens/Shop';
import Auction from './src/screens/Auction';
import Profile from './src/screens/Profile';
import BoxShop from './src/screens/BoxShop';
import ProductShop from './src/screens/ProductShop';
import BoxDetail from './src/screens/BoxDetail';
import ProductDetail from './src/screens/ProductDetail';
import Favorite from './src/screens/Favorite';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator for Shop (holds top Tabs) > BoxShop/ProductShop > Detail page 
function BoxShopStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Mystery Box" component={BoxShop}
        options={{ headerShown: false }} />
      <Stack.Screen name="Box Detail" component={BoxDetail}
        options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}

function ProductShopStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Collection Store" component={ProductShop}
        options={{ headerShown: false }} />
      <Stack.Screen name="Collection Detail" component={ProductDetail}
        options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}

//

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
      <StatusBar style="auto" />
      {/* <Tab.Navigator
          initialRouteName='Home Page'
          screenOptions={{
            tabBarActiveTintColor: '#F4B400',  // Custom active color
            tabBarInactiveTintColor: 'gray', // Custom inactive color
          }}
        >
          <Tab.Screen
            name="Home Page"
            component={HomeStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <Entypo name="home" size={24} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Saved Toys"
            component={SaveStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <FontAwesome name="bookmark" size={24} color={color} />
              ),
            }} />
        </Tab.Navigator> */}
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
