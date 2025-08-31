import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// --- Types, APIs, Components ---
import { UserProfile, AppNavigationProp, CollectionDetailItem } from '../types/types'; // Import các type cần thiết
import { fetchMyAuctionList, GetJoinedHistoryAuction, fetchAuctionWinner } from '../services/api.auction'; // Import cả 2 API
import { getOtherProfile } from '../services/api.user';
import { getCollectionDetail } from '../services/api.product';
import ApiImage from '../components/ApiImage';
import FilterBar from '../components/FilterBar';

// --- Type Definitions ---
// Giữ nguyên các type này để component hiểu cấu trúc dữ liệu
type AuctionItem = {
    _id: string;
    id: string;
    title: string;
    descripition: string;
    start_time: string;
    end_time: string;
    seller_id: string;
    status: number; // 0: Pending, 1: Approved/Ongoing, -1: Denied
    productImageUrl?: string;
    host_value: number;
    fee_charge: string;
    incoming_value: number;
};

type AuctionWithSeller = AuctionItem & {
    seller: UserProfile | null;
};

// Type mới cho dữ liệu người thắng
type EnrichedWinner = {
    auction_info: any;
    auction_result: any;
    productDetail: CollectionDetailItem | null;
    bidderProfile: UserProfile | null;
    hosterProfile: UserProfile | null;
};

// --- Helper Functions ---
const formatTimeLeft = (endTime?: string | null) => {
    if (!endTime) return 'Unknown end time';
    const ms = new Date(endTime).getTime() - Date.now();
    if (isNaN(ms)) return 'Invalid time';
    if (ms <= 0) return "Ended";

    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    const MS_IN_HOUR = 60 * 60 * 1000;
    const MS_IN_MIN = 60 * 1000;

    const days = Math.floor(ms / MS_IN_DAY);
    const hours = Math.floor((ms % MS_IN_DAY) / MS_IN_HOUR);
    const minutes = Math.floor((ms % MS_IN_HOUR) / MS_IN_MIN);

    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return `Ends in: ${parts.join(' ')}`;
};

const MS_IN_24H = 24 * 60 * 60 * 1000;

const formatDuration = (ms: number) => {
    if (ms <= 0) return '0m';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

// helpers (thay thế hiện tại)
const formatDateTime = (iso?: string | null) => {
    if (!iso) return 'Unknown time';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Invalid time';
    try {
        // ưu tiên format theo vi-VN + timezone VN nếu khả dụng
        // Intl may not be available on some RN engines — try/catch để fallback
        return new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(d);
    } catch {
        // fallback đơn giản
        return d.toString();
    }
};


const getStatusInfo = (item: AuctionItem): { text: string; color: string } => {
    // bảo vệ nếu start_time hoặc end_time thiếu hoặc không parse được
    if (!item.start_time || !item.end_time) {
        console.warn('[getStatusInfo] Missing start_time/end_time for auction', item._id, item.start_time, item.end_time);
        return { text: 'Invalid time', color: '#6c757d' };
    }

    // chuyển sang số (ms) để so sánh / trừ an toàn
    const now = Date.now();
    const start = new Date(item.start_time).getTime();
    const end = new Date(item.end_time).getTime();

    if (isNaN(start) || isNaN(end)) {
        console.warn('[getStatusInfo] Invalid date parse for auction', item._id, item.start_time, item.end_time);
        return { text: 'Invalid time', color: '#6c757d' };
    }

    switch (item.status) {
        case 0: {
            // Pending: show start date (date string)
            const startDateStr = new Date(item.start_time).toLocaleDateString();
            return { text: `Pending (Starts ${startDateStr})`, color: '#ffc107' };
        }
        case 1: {
            // Approved/Ongoing
            if (now > end) return { text: 'Ended', color: '#6c757d' };

            if (now < start) {
                const msUntilStart = start - now; // safe: number - number
                if (msUntilStart >= MS_IN_24H) {
                    // còn >= 24h: show exact date + time
                    return { text: `Starts: ${formatDateTime(item.start_time)}`, color: '#17a2b8' };
                } else {
                    // < 24h: show countdown
                    return { text: `Starts in: ${formatDuration(msUntilStart)}`, color: '#17a2b8' };
                }
            }

            return { text: formatTimeLeft(item.end_time), color: '#28a745' };
        }
        case -1:
            return { text: 'Denied', color: '#dc3545' };
        default:
            return { text: 'Unknown', color: '#6c757d' };
    }
};

export default function MyAuctions() {
    const navigation = useNavigation<AppNavigationProp>();

    const [hostedAuctions, setHostedAuctions] = useState<AuctionWithSeller[]>([]);
    const [myBids, setMyBids] = useState<AuctionWithSeller[]>([]);
    const [winners, setWinners] = useState<EnrichedWinner[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'Hosted' | 'My Bids' | 'Winners'>('Hosted');

    const fetchData = useCallback(async () => {
        if (hostedAuctions.length === 0 && myBids.length === 0 && winners.length === 0) {
            setLoading(true);
        }
        setError(null);

        try {
            const results = await Promise.allSettled([
                fetchMyAuctionList(),
                GetJoinedHistoryAuction(),
                fetchAuctionWinner()
            ]);

            const [hostedRes, bidsRes, winnerRes] = results;

            if (hostedRes.status === 'fulfilled' && hostedRes.value.success && Array.isArray(hostedRes.value.data)) {
                const flatAuctions: AuctionItem[] = hostedRes.value.data.flat();
                const auctionsWithSellers = await Promise.all(
                    flatAuctions.map(async (auction) => {
                        try {
                            const profileRes = await getOtherProfile(auction.seller_id);
                            return { ...auction, seller: profileRes.status ? profileRes.data : null };
                        } catch { return { ...auction, seller: null }; }
                    })
                );
                auctionsWithSellers.reverse();
                setHostedAuctions(auctionsWithSellers);
            } else {
                console.error("Failed to fetch 'Hosted' auctions:", hostedRes.status === 'rejected' ? hostedRes.reason : hostedRes.value.error);
                setHostedAuctions([]);
            }

            if (bidsRes.status === 'fulfilled' && bidsRes.value.success && Array.isArray(bidsRes.value.data)) {
                const flatAuctions: AuctionItem[] = bidsRes.value.data.flat();
                const auctionsWithSellers = await Promise.all(
                    flatAuctions.map(async (auction) => {
                        try {
                            const profileRes = await getOtherProfile(auction.seller_id);
                            return { ...auction, seller: profileRes.status ? profileRes.data : null };
                        } catch { return { ...auction, seller: null }; }
                    })
                );
                auctionsWithSellers.reverse();
                setMyBids(auctionsWithSellers);
            } else {
                console.error("Failed to fetch 'My Bids' auctions:", bidsRes.status === 'rejected' ? bidsRes.reason : bidsRes.value.error);
                setMyBids([]);
            }

            if (winnerRes.status === 'fulfilled' && winnerRes.value.success && Array.isArray(winnerRes.value.data)) {
                const winnerData = winnerRes.value.data || [];
                const enrichedWinners = await Promise.all(
                    winnerData.map(async (item: any) => {
                        const [productDetailRes, bidderProfileRes, hosterProfileRes] = await Promise.all([
                            getCollectionDetail(item.auction_result.product_id).catch(() => null),
                            getOtherProfile(item.auction_result.bidder_id).catch(() => null),
                            getOtherProfile(item.auction_result.hoster_id).catch(() => null),
                        ]);
                        return {
                            ...item,
                            productDetail: productDetailRes?.data || null,
                            bidderProfile: bidderProfileRes?.data || null,
                            hosterProfile: hosterProfileRes?.data || null,
                        };
                    })
                );
                enrichedWinners.reverse();
                setWinners(enrichedWinners);
            } else {
                console.error("Failed to fetch 'Winners' auctions:", winnerRes.status === 'rejected' ? winnerRes.reason : winnerRes.value.error);
                setWinners([]);
            }

        } catch (err: any) {
            setError('An unexpected error occurred while fetching data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const renderAuctionItem = ({ item }: { item: AuctionWithSeller }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('AuctionDetail', {
                auctionId: item.id || item._id,
                startTime: item.start_time,
                endTime: item.end_time,
            })}
        >
            <ApiImage
                urlPath={item.productImageUrl || item.seller?.profileImage}
                style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemDescription} numberOfLines={1}>{item.descripition}</Text>
                {item.seller && (
                    <Text style={styles.sellerName}>by {item.seller.username}</Text>
                )}
                {activeFilter === 'Hosted' && (
                    <View style={styles.hostedInfoContainer}>
                        <Text style={styles.hostedInfoText}>
                            Initial:
                            <Text style={styles.valueText}>
                                {typeof item.host_value === 'number'
                                    ? `${item.host_value.toLocaleString('vi-VN')} VND`
                                    : 'N/A'}
                            </Text>
                        </Text>
                        <Text style={styles.hostedInfoText}>
                            Est. Income:
                            <Text style={[styles.valueText, { color: '#28a745' }]}>
                                {typeof item.incoming_value === 'number'
                                    ? `${item.incoming_value.toLocaleString('vi-VN')} VND`
                                    : 'N/A'}
                            </Text>
                        </Text>
                    </View>
                )}
                <Text style={[styles.statusText, { color: getStatusInfo(item).color }]}>
                    {getStatusInfo(item).text}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderWinnerItem = ({ item }: { item: EnrichedWinner }) => (
        <View style={styles.winnerItemContainer}>
            <Text style={styles.winnerTitle}>{item.auction_info.title}</Text>
            <Text style={styles.winnerDescription}>{item.auction_info.descripition}</Text>

            <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Product Info:</Text>
                <View style={styles.profileRow}>
                    <ApiImage urlPath={item.productDetail?.urlImage} style={styles.productImage} />
                    <View>
                        <Text style={styles.profileName}>{item.productDetail?.name || 'Loading...'}</Text>
                        <Text style={styles.profileSubText}>Rarity: {item.productDetail?.rarityName || '...'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Winner:</Text>
                <View style={styles.profileRow}>
                    <ApiImage urlPath={item.bidderProfile?.profileImage} style={styles.profileAvatar} />
                    <View>
                        <Text style={styles.profileName}>{item.bidderProfile?.username || 'Loading...'}</Text>
                        <Text style={styles.profileSubText}>{item.bidderProfile?.email || '...'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Host:</Text>
                <View style={styles.profileRow}>
                    <ApiImage urlPath={item.hosterProfile?.profileImage} style={styles.profileAvatar} />
                    <View>
                        <Text style={styles.profileName}>{item.hosterProfile?.username || 'Loading...'}</Text>
                        <Text style={styles.profileSubText}>{item.hosterProfile?.email || '...'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.financialsContainer}>
                <Text style={styles.financialText}>Winning Bid: {item.auction_result.bidder_amount?.toLocaleString('vi-VN')} VND</Text>
                <Text style={styles.financialText}>Host Claim: {item.auction_result.host_claim_amount?.toLocaleString('vi-VN')} VND</Text>
                <Text style={styles.dateText}>Ended at: {new Date(item.auction_info.end_time).toLocaleString('vi-VN')}</Text>
            </View>
        </View>
    );

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#333" /></SafeAreaView>;
    }

    if (error) {
        return <SafeAreaView style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FilterBar
                filters={['Hosted', 'My Bids', 'Winners']}
                activeFilter={activeFilter}
                onSelectFilter={(filter) => setActiveFilter(filter as 'Hosted' | 'My Bids' | 'Winners')}
            />

            {activeFilter === 'Winners' ? (
                <FlatList
                    data={winners}
                    keyExtractor={(item, index) => item.auction_info?._id || index.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderWinnerItem}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text>No data found in this category.</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={activeFilter === 'Hosted' ? hostedAuctions : myBids}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderAuctionItem}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text>No data found in this category.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    listContent: { padding: 16, flexGrow: 1 },
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
    itemImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
    itemInfo: { flex: 1, justifyContent: 'space-around' },
    itemName: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
    itemDescription: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 13,
        color: '#666',
        marginVertical: 4,
    },
    sellerName: { fontFamily: 'Oxanium-Regular', fontSize: 12, color: '#888' },
    statusText: { fontFamily: 'Oxanium-Bold', fontSize: 14, marginTop: 4 },
    hostedInfoContainer: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    hostedInfoText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#666',
    },
    valueText: {
        fontFamily: 'Oxanium-SemiBold',
        color: '#333',
    },
    winnerItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    winnerTitle: {
        fontFamily: 'Oxanium-Bold',
        fontSize: 18,
        marginBottom: 4,
    },
    winnerDescription: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    detailSection: {
        marginTop: 8,
    },
    detailTitle: {
        fontFamily: 'Oxanium-SemiBold',
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    profileAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    profileName: {
        fontFamily: 'Oxanium-SemiBold',
        fontSize: 15,
    },
    profileSubText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#888',
    },
    financialsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 12,
        paddingTop: 12,
    },
    financialText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 14,
        marginBottom: 4,
    },
    dateText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#aaa',
        marginTop: 8,
    },
});
