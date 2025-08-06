import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import icons
import ShopIcon from './assets/icons/shop.svg';
import ShopIconOutline from './assets/icons/shop-outline.svg';
import AuctionIcon from './assets/icons/auction.svg';
import AuctionIconOutline from './assets/icons/auction_outline.svg';
import CartIcon from './assets/icons/cart.svg';
import CartIconOutline from './assets/icons/cart_outline.svg';
import ChatIcon from './assets/icons/chat.svg';
import ChatIconOutline from './assets/icons/chat-outline.svg';
import NotificationIcon from './assets/icons/notification.svg';
import NotificationIconOutline from './assets/icons/notification_outline.svg';
import SettingIcon from './assets/icons/setting.svg';
import SettingIconOutline from './assets/icons/setting_outline.svg';

// import screen
import Shop from './src/screens/Shop';
import Auction from './src/screens/Auction';
import Profile from './src/screens/Profile';
import BoxShop from './src/screens/BoxShop';
import ProductShop from './src/screens/ProductShop';
import BoxDetail from './src/screens/BoxDetail';
import ProductDetail from './src/screens/ProductDetail';
import Favorite from './src/screens/Favorite';
import Chat from './src/screens/Chat';
import Settings from './src/screens/Settings';

//import header
import CustomHeader from './src/components/Header';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator for Shop (holds top Tabs) > BoxShop/ProductShop > Detail page 
// function BoxShopStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="Mystery Box" component={BoxShop}
//         options={{ headerShown: false }} />
//       <Stack.Screen name="Box Detail" component={BoxDetail}
//         options={{ headerShown: true }} />
//     </Stack.Navigator>
//   );
// }

function ShopStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shop"
        component={Shop}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mystery Box"
        component={BoxShop}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Box Detail"
        component={BoxDetail}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Collection Store"
        component={ProductShop}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Collection Detail"
        component={ProductDetail}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}

// function ProductShopStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="Collection Store" component={ProductShop}
//         options={{ headerShown: false }} />
//       <Stack.Screen name="Collection Detail" component={ProductDetail}
//         options={{ headerShown: true }} />
//     </Stack.Navigator>
//   );
// }

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Cart"
        component={BoxShop}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Favorite"
        component={Favorite}
        options={{ headerShown: true, title: 'Favorites' }}
      />
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

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 60,
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#ccc',
          },
          tabBarIcon: ({ focused }) => {
            switch (route.name) {
              case 'Shop':
                return focused ? <ShopIcon width={24} height={24} /> : <ShopIconOutline width={24} height={24} />;
              case 'Auction':
                return focused ? <AuctionIcon width={24} height={24} /> : <AuctionIconOutline width={24} height={24} />;
              case 'Cart':
                return focused ? <CartIcon width={24} height={24} /> : <CartIconOutline width={24} height={24} />;
              case 'Notification':
                return focused ? <NotificationIcon width={24} height={24} /> : <NotificationIconOutline width={24} height={24} />;
              case 'Settings':
                return focused ? <SettingIcon width={24} height={24} /> : <SettingIconOutline width={24} height={24} />;
              case 'Chat':
                return focused ? <ChatIcon width={24} height={24} /> : <ChatIconOutline width={24} height={24} />;
              default:
                return null;
            }
          },
        })}
      >
        <Tab.Screen name="Shop" component={ShopStack} />
        <Tab.Screen name="Auction" component={Auction} />
        <Tab.Screen name="Cart" component={CartStack} />
        <Tab.Screen name="Chat" component={Chat} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>


    </NavigationContainer >
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
