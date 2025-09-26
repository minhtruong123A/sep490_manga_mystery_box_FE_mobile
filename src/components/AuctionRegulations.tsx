import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const regulations = [
    {
        title: 'Article 1. Auction Session Creation',
        points: [
            'The organizer (Host) must create an auction session at least 4 hours prior to the scheduled start time.',
            'During the waiting period before the session begins, no participants are allowed to place bids.',
            'Each auction session is associated with one unique product.',
        ],
    },
    {
        title: 'Article 2. Starting Price and Session Duration',
        points: [
            'The Host determines the starting price of the product.',
            'The duration of each auction session is predetermined by the system and cannot be altered by users.',
        ],
    },
    {
        title: 'Article 3. Bidding Rules',
        points: [
            'The first valid bid placed by a participant must be equal to or higher than the starting price.',
            'Each subsequent bid must be at least 5% higher than the current highest bid.',
            'Example: If the current highest bid is 1,000,000 VND → the next bid must be ≥ 1,050,000 VND.',
            'A participant cannot place consecutive bids against themselves (self-overbidding is prohibited).',
            'If a bid is placed within the final 1 minute of the auction session, the system will automatically extend the auction time by an additional 2 minutes.',
        ],
    },
    {
        title: 'Article 4. Auction Conclusion',
        points: [
            'At the end of the auction, the system will automatically determine the winner as the participant with the highest valid bid.',
            'After the auction session concludes, there will be a processing period of up to 24 hours for verification and the official announcement of the result.',
        ],
    },
    {
        title: 'Article 5. Responsibilities and Compliance',
        points: [
            'All participants must comply with these regulations; any fraudulent or violating behavior will result in bid cancellation and potential penalties under system policies.',
            'The system reserves the right to monitor, suspend, or cancel an auction session if irregularities are detected.',
        ],
    },
];

export default function AuctionRegulations() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.mainTitle}>Auction System Regulations</Text>
            {regulations.map((article, index) => (
                <View key={index} style={styles.articleContainer}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    {article.points.map((point, pointIndex) => (
                        <View key={pointIndex} style={styles.pointContainer}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.pointText}>{point}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    mainTitle: {
        fontSize: 24,
        fontFamily: 'Oxanium-Bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    articleContainer: {
        marginBottom: 24,
    },
    articleTitle: {
        fontSize: 18,
        fontFamily: 'Oxanium-SemiBold',
        color: '#d9534f',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    pointContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingLeft: 8,
    },
    bulletPoint: {
        fontSize: 16,
        marginRight: 8,
        color: '#555',
        lineHeight: 24,
    },
    pointText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
        color: '#555',
        lineHeight: 24,
    },
});
