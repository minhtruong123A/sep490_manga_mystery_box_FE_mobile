import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// --- Types, APIs, Components ---
import { UserProfile, AppNavigationProp, CollectionDetailItem } from '../types/types'; // Import các type cần thiết
import { fetchMyAuctionList, GetJoinedHistoryAuction, fetchAuctionWinner, getBidAuction, fetchAuctionProduct } from '../services/api.auction'; // Import cả 2 API
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

// const ensureUtc = (timeStr?: string | null) => {
//     if (!timeStr) return new Date(0);
//     return new Date(timeStr.endsWith('Z') ? timeStr : timeStr.replace(' ', 'T') + 'Z');
// };

type ProductDetails = {
    name: string;
    urlImage: string;
    rarityName: string;
    starting_price: number;
    current_price: number;
    quantity: number;
};

type Bid = {
    bidder_id: string;
    bid_amount: number;
};

type TopBidder = Bid & {
    username: string;
};

const AuctionListItem = ({ item, activeFilter }: { item: AuctionWithSeller; activeFilter: 'Hosted' | 'My Bids' }) => {
    const navigation = useNavigation<AppNavigationProp>();

    // State riêng cho từng item
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [topBidders, setTopBidders] = useState<TopBidder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [firstFeeCharge, setFirstFeeCharge] = useState<string | null>(null);

    // useEffect để gọi API khi component được render
    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                // Sử dụng Promise.all để gọi các API song song
                const [productDetailRes, bidRes, Fee] = await Promise.all([
                    fetchAuctionProduct(item.id || item._id || ''), // Giả sử productImageUrl là ID, cần điều chỉnh nếu khác
                    getBidAuction(item.id || item._id),
                    fetchMyAuctionList()
                ]);
                if (Fee.data && Fee.data.length > 0) {
                    console.log("Fee charge:", Fee.data[0].fee_charge);
                    setFirstFeeCharge(Fee.data[0].fee_charge ?? null);
                }

                // Xử lý chi tiết sản phẩm
                if (productDetailRes.success && productDetailRes.data.length > 0) {
                    const auctionProductData = productDetailRes.data[0];
                    const userProductId = productDetailRes.data[0].user_product_id;
                    const collectionDetailRes = await getCollectionDetail(userProductId);
                    if (collectionDetailRes.status) {
                        setProduct({
                            ...collectionDetailRes.data,
                            starting_price: auctionProductData.starting_price,
                            current_price: auctionProductData.current_price,
                            quantity: auctionProductData.quantity,
                        });
                    }
                }

                // Xử lý top 5 bidders
                if (bidRes.success && Array.isArray(bidRes.data)) {
                    const highestBids = new Map<string, Bid>();
                    bidRes.data.forEach((bid: Bid) => {
                        if (!highestBids.has(bid.bidder_id) || bid.bid_amount > highestBids.get(bid.bidder_id)!.bid_amount) {
                            highestBids.set(bid.bidder_id, bid);
                        }
                    });

                    const top5 = Array.from(highestBids.values())
                        .sort((a, b) => b.bid_amount - a.bid_amount)
                        .slice(0, 5);

                    const biddersWithProfiles = await Promise.all(
                        top5.map(async (bid) => {
                            const profile = await getOtherProfile(bid.bidder_id);
                            return { ...bid, username: profile.status ? profile.data.username : 'Unknown' };
                        })
                    );
                    setTopBidders(biddersWithProfiles);
                }
            } catch (err) {
                console.error(`Failed to fetch details for auction ${item._id}:`, err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [item._id, item.id, item.productImageUrl]);

    if (isLoading) {
        return (
            <View style={[styles.cardContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color="#555" />
            </View>
        );
    }
    const formatCurrency = (value: any) => {
        if (value == null || isNaN(Number(value))) {
            return '0';
        }
        if (value >= 1e12) {
            return (value / 1e12).toFixed(2) + ' T'; // Trillion
        } else if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + ' B'; // Billion
        } else {
            return value.toLocaleString('vi-VN');
        }
    };
    const statusInfo = getStatusInfo(item);
    const feePercent = firstFeeCharge ? parseFloat(firstFeeCharge.replace('%', '')) / 100 : 0;
    const incomingValue = product?.current_price ? product.current_price * (1 - feePercent) : 0;
    const hostPercent = 1 - feePercent;
    const hostPercentDisplay = Math.round(hostPercent * 100) + '%';

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate('AuctionDetail', {
                auctionId: item.id || item._id,
                startTime: item.start_time,
                endTime: item.end_time,
            })}
        >
            <View style={styles.mainInfoSection}>
                <Text style={styles.auctionTitle} numberOfLines={2}>{item?.title || 'N/A'}</Text>
                <Text style={styles.auctionDescription} numberOfLines={2}>{item?.descripition || 'N/A'}</Text>
                {item.seller && (
                    <View style={styles.sellerInfoContainer}>
                        <Text style={styles.sellerName}>by host: </Text>
                        <ApiImage
                            urlPath={item.seller.profileImage} // Lấy ảnh profile của seller
                            style={styles.sellerAvatar}
                        />
                        <Text style={styles.sellerName}> {item.seller.username}</Text>
                    </View>
                )}
            </View>
            {/* Phần thông tin sản phẩm */}
            <View style={styles.productSection}>
                <ApiImage
                    urlPath={product?.urlImage}
                    style={styles.productImageCard}
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product?.name || 'Loading...'}</Text>
                    <Text style={styles.productRarity}>Rarity: {product?.rarityName || '...'}</Text>
                    <Text style={styles.productRarity}>Quantity: {product?.quantity || '...'}</Text>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                </View>
            </View>

            {/* Phần thông tin cho tab "Hosted" */}
            {/* {activeFilter === 'Hosted' && ( */}
            <View style={styles.hostedSection}>
                <View style={styles.hostedRow}>
                    <Text style={styles.hostedLabel}>Initial Value:</Text>
                    <Text style={styles.hostedValue}>{formatCurrency(item?.host_value || product?.current_price)} VND</Text>
                </View>
                <View style={styles.hostedRow}>
                    <Text style={styles.hostedLabel}>Est. Income:</Text>
                    <Text style={[styles.hostedValue, { color: '#28a745' }]}>{formatCurrency(item?.incoming_value || incomingValue)} VND</Text>
                </View>
                <View style={styles.hostedRow}>
                    <Text style={styles.hostedLabel}>Platform Fee:</Text>
                    <Text style={[styles.hostedValue, { color: '#e74c3c' }]}>{item?.fee_charge || firstFeeCharge}</Text>
                </View>
                <View style={styles.hostedRow}>
                    <Text style={styles.hostedLabel}>Host Receives:</Text>
                    <Text style={[styles.hostedValue, { color: '#e74c3c' }]}>{hostPercentDisplay}</Text>
                </View>
            </View>
            {/* )} */}

            {/* Phần Top Bidders */}
            {topBidders.length > 0 && (
                <View style={styles.biddersSection}>
                    <Text style={styles.biddersTitle}>Top 5 Bidders</Text>
                    {topBidders.map((bidder, index) => (
                        <View key={index} style={styles.bidderRow}>
                            <Text style={styles.bidderText}>{index + 1}. {bidder.username}</Text>
                            <Text style={styles.bidderAmount}>{bidder.bid_amount.toLocaleString('vi-VN')} VND</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
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
    // const d = ensureUtc(iso); // Dùng ensureUtc thay vì new Date()
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
    // const now = new Date();
    // const start = ensureUtc(item.start_time);
    // const end = ensureUtc(item.end_time);
    const now = Date.now();
    const start = new Date(item.start_time).getTime();
    const end = new Date(item.end_time).getTime();

    // if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    //     return { text: 'Invalid time', color: '#6c757d' };
    // }

    if (isNaN(start) || isNaN(end)) {
        console.warn('[getStatusInfo] Invalid date parse for auction', item._id, item.start_time, item.end_time);
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
                // const msUntilStart = start.getTime() - now.getTime();
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
    const [firstFeeCharge, setFirstFeeCharge] = useState<string | null>(null);

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
                    renderItem={({ item }) => (
                        <AuctionListItem item={item} activeFilter={activeFilter as 'Hosted' | 'My Bids'} />
                    )}
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
        fontSize: 14,
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
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16, // Thêm padding xung quanh
    },
    productImageCard: {
        width: 105,
        height: 150,
        borderRadius: 8,
        marginRight: 16,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1c1c1e',
    },
    productRarity: {
        fontSize: 13,
        color: '#8e8e93',
        marginTop: 2,
    },
    // statusText: {
    //     fontSize: 14,
    //     fontWeight: '500',
    //     marginTop: 6,
    // },
    hostedSection: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5ea',
    },
    hostedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 3,
    },
    hostedLabel: {
        fontSize: 14,
        color: '#636366',
    },
    hostedValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1c1e',
    },
    biddersSection: {
        paddingTop: 12,
    },
    biddersTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1c1c1e',
        marginBottom: 8,
    },
    bidderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    bidderText: {
        fontSize: 14,
        color: '#3c3c43',
    },
    bidderAmount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#007aff',
    },
    mainInfoSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5ea',
    },
    auctionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1c1c1e',
        marginBottom: 4,
    },
    auctionDescription: {
        fontSize: 14,
        color: '#636366',
    },
    sellerInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    sellerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
});
