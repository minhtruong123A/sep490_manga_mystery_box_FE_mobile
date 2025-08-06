import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import AvatarIcon from '../../assets/icons/chat.svg';
import ChatIcon from '../../assets/icons/chat.svg';
import { RootTabParamList } from '../types/types';

export default function Header() {
  type ChatScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Chat'>;
  const navigation = useNavigation<ChatScreenNavigationProp>();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>

      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => navigation.navigate('Chat')}
      >
        <ChatIcon width={28} height={28} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.avatarWrapper}>
        <AvatarIcon width={34} height={34} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 30,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    zIndex: 10,
  },
  left: {},
  logo: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 12,
  },
  avatarWrapper: {
    borderRadius: 100,
    overflow: 'hidden',
  },
});
