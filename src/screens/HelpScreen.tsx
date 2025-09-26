import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import TermsOfService from '../components/TermsOfService';
import CopyrightPolicy from '../components/CopyrightPolicy';
import PrivacyPolicy from '../components/PrivacyPolicy';
import AuctionRegulations from '../components/AuctionRegulations';

const TopTab = createMaterialTopTabNavigator();

export default function HelpScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <TopTab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#d9534f',
                    tabBarInactiveTintColor: 'gray',
                    tabBarIndicatorStyle: { backgroundColor: '#d9534f' },
                    tabBarLabelStyle: {
                        fontFamily: 'Oxanium-Bold',
                        textTransform: 'none',
                        fontSize: 12
                    },
                    tabBarScrollEnabled: true,
                    tabBarItemStyle: { width: 'auto', paddingHorizontal: 15 },
                }}
            >
                <TopTab.Screen name="Auction Rules" component={AuctionRegulations} />
                <TopTab.Screen name="Terms of Service" component={TermsOfService} />
                <TopTab.Screen name="Copyright" component={CopyrightPolicy} />
                <TopTab.Screen name="Privacy" component={PrivacyPolicy} />
            </TopTab.Navigator>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

