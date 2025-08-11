import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import ApiImage from '../components/ApiImage';
import { fetchMyAuctionList } from '../services/api.auction';
import { getOtherProfile } from '../services/api.user';
import { UserProfile } from '../types/types';
import { useFocusEffect } from '@react-navigation/native';

type AuctionItem = {
    _id: string;
    title: string;
    descripition: string;
    start_time: string;
    end_time: string;
    seller_id: string;
    status: number;
    productImageUrl?: string; // nếu API có
};

export default function MyAuctions({ navigation }: any) {
    const [auctions, setAuctions] = useState<(AuctionItem & { seller: UserProfile | null })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const auctionRes = await fetchMyAuctionList();
            if (auctionRes.success && Array.isArray(auctionRes.data)) {
                const flatAuctions: AuctionItem[] = auctionRes.data.flat();

                const auctionsWithSellers = await Promise.all(
                    flatAuctions.map(async (auction) => {
                        try {
                            const profileRes = await getOtherProfile(auction.seller_id);
                            return { ...auction, seller: profileRes.status ? profileRes.data : null };
                        } catch {
                            return { ...auction, seller: null };
                        }
                    })
                );

                setAuctions(auctionsWithSellers);
            } else {
                throw new Error('Invalid auction data format');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch auctions');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#333" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </SafeAreaView>
        );
    }

    if (auctions.length === 0) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>You don't have any auctions yet.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={auctions}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    let timeDisplay = "";
                    if (item.status === 0) {
                        // Đang chờ duyệt
                        const start = new Date(item.start_time);
                        timeDisplay = `Scheduled at: ${start.toLocaleString("vi-VN")}`;
                    } else if (item.status === 1) {
                        const now = new Date();
                        const endTime = new Date(item.end_time);

                        if (endTime.getTime() < now.getTime()) {
                            // Đã kết thúc
                            timeDisplay = `Ended on: ${endTime.toLocaleString("vi-VN")}`;
                        } else {
                            // Đã duyệt, hiển thị countdown
                            const timeLeft = Math.max(0, new Date(item.end_time).getTime() - new Date().getTime());
                            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                            timeDisplay = `Time left: ${hours}h ${minutes}m`;
                        }
                    } else if (item.status === -1) {
                        // Từ chối
                        timeDisplay = "Denied";
                    }

                    return (
                        <TouchableOpacity
                            style={styles.itemContainer}
                        // onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
                        >
                            <ApiImage
                                urlPath={item.productImageUrl || item.seller?.profileImage}
                                style={styles.itemImage}
                            />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                <Text style={styles.itemDescription} numberOfLines={2}>
                                    {item.descripition}
                                </Text>
                                {item.seller && (
                                    <Text style={styles.sellerName}>by {item.seller.username}</Text>
                                )}
                                <Text style={[
                                    styles.timeLeft,
                                    item.status === -1 && { color: '#888' }
                                ]}>
                                    {timeDisplay}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    listContent: { padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1, justifyContent: 'space-between' },
    itemName: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
    sellerName: { fontFamily: 'Oxanium-Regular', fontSize: 12, color: '#666' },
    timeLeft: { fontFamily: 'Oxanium-SemiBold', color: '#d9534f', fontSize: 14 },
    itemDescription: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 13,
        color: '#444',
        marginTop: 2
    },
});
