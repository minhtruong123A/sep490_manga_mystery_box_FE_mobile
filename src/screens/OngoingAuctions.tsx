// src/screens/OngoingAuctions.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Button } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fakeAuctionData, Auction } from '../data/auctionData';
import { RootStackNavigationProp, UserProfile, CollectionDetailItem } from '../types/types'; // Sẽ cập nhật type này sau
import { fetchAuctionList, fetchAuctionExtendList, fetchAuctionProduct, getBidAuction } from '../services/api.auction';
import ApiImage from '../components/ApiImage';
import { getOtherProfile } from '../services/api.user'; // Đường dẫn đúng tới api getOtherProfile
import FilterBar from '../components/FilterBar'; // import FilterBar bạn tạo
import { getCollectionDetail } from '../services/api.product';

type AuctionItem = {
    _id: string;
    auction_id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    seller_id: string;
    status: number;
    productImageUrl?: string;
    quantity: number;
    auction_current_amount: number;
    transaction_fee_percent: number;
    host_obtain_amount: number;
};

type AuctionWithSeller = AuctionItem & {
    seller: UserProfile | null;
};

// const ensureUtc = (timeStr: string) => {
//     if (!timeStr) return new Date(0); // Trả về ngày không hợp lệ nếu thiếu
//     // Thêm 'Z' nếu chuỗi thời gian chưa có thông tin timezone
//     return new Date(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z');
// };

type TopBidder = {
    bidder_id: string;
    username: string;
    profileImage: string | null;
    bid_amount: number;
};

type Bid = {
    _id: string;
    auction_id: string;
    bidder_id: string;
    bid_amount: number;
    bid_time: string;
};

type ProductDetails = {
    name: string;
    urlImage: string;
    rarityName: string;
    starting_price: number;
};

const AuctionCard = ({ item }: { item: AuctionWithSeller }) => {
    const navigation = useNavigation<RootStackNavigationProp>();
    const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
    const [topBidders, setTopBidders] = useState<TopBidder[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    useEffect(() => {
        const loadItemDetails = async () => {
            setIsLoadingDetails(true);
            try {
                // 1. Lấy thông tin sản phẩm
                const productRes = await fetchAuctionProduct(item.auction_id);
                if (productRes.success && productRes.data.length > 0) {
                    const auctionProductData = productRes.data[0];
                    const userProductId = productRes.data[0].user_product_id;
                    const collectionDetailRes = await getCollectionDetail(userProductId);
                    if (collectionDetailRes.status) {
                        setProductDetails({
                            ...collectionDetailRes.data,
                            starting_price: auctionProductData.starting_price,
                        });
                    }
                }

                // 2. Lấy danh sách bid và xử lý top 5
                const bidRes = await getBidAuction(item.auction_id);
                if (bidRes.success && Array.isArray(bidRes.data)) {
                    const highestBids = new Map<string, Bid>();
                    bidRes.data.forEach((bid: Bid) => {
                        if (!highestBids.has(bid.bidder_id) || bid.bid_amount > highestBids.get(bid.bidder_id)!.bid_amount) {
                            highestBids.set(bid.bidder_id, bid);
                        }
                    });

                    const uniqueHighestBids = Array.from(highestBids.values());
                    uniqueHighestBids.sort((a, b) => b.bid_amount - a.bid_amount);
                    const top5 = uniqueHighestBids.slice(0, 5);

                    // Lấy thông tin profile cho top 5 bidders
                    const topBiddersWithInfo = await Promise.all(
                        top5.map(async (bid) => {
                            try {
                                const profileRes = await getOtherProfile(bid.bidder_id);
                                return {
                                    ...bid,
                                    username: profileRes.status ? profileRes.data.username : 'Unknown User',
                                    profileImage: profileRes.status ? profileRes.data.profileImage : null
                                };
                            } catch {
                                return { ...bid, username: 'Unknown User', profileImage: null };
                            }
                        })
                    );
                    setTopBidders(topBiddersWithInfo);
                }
            } catch (error) {
                console.error(`Failed to load details for auction ${item.auction_id}:`, error);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadItemDetails();
    }, [item.auction_id]);

    const now = new Date();
    const startTime = new Date(item.start_time);
    const endTime = new Date(item.end_time);
    let timeDisplay = '';
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const formatCurrency = (value: any) => {
        if (value >= 1e12) {
            return (value / 1e12).toFixed(2) + ' T'; // Trillion
        } else if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + ' B'; // Billion
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + ' M'; // Million
        } else {
            return value.toLocaleString('vi-VN');
        }

    };
    if (now < startTime) {
        const timeLeftMs = startTime.getTime() - now.getTime();
        if (timeLeftMs < twentyFourHoursInMs) {
            const hours = Math.floor(timeLeftMs / 3600000);
            const minutes = Math.floor((timeLeftMs % 3600000) / 60000);
            timeDisplay = `Starts in: ${hours}h ${minutes}m`;
        } else {
            timeDisplay = `Starts on: ${startTime.toLocaleDateString('vi-VN')}`;
        }
    } else if (now >= startTime && now <= endTime) {
        const timeLeftMs = endTime.getTime() - now.getTime();
        const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0 || (days === 0 && hours === 0)) parts.push(`${minutes}m`);
        timeDisplay = `Ends in: ${parts.join(' ')}`;
    } else {
        timeDisplay = `Ended on: ${endTime.toLocaleDateString('vi-VN')}`;
    }

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate('AuctionDetail', {
                auctionId: item.auction_id,
                startTime: item.start_time,
                endTime: item.end_time,
            })}
        >
            {isLoadingDetails ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" />
                </View>
            ) : (
                <>
                    <View style={styles.headerSection}>
                        <Text style={styles.auctionTitle} numberOfLines={2}>{item?.title || 'N/A'}</Text>
                        <Text style={styles.auctionDescription} numberOfLines={2}>{item?.description || 'N/A'}</Text>
                    </View>
                    <View style={styles.productSection}>
                        <ApiImage
                            urlPath={productDetails?.urlImage}
                            style={styles.productImage}
                        />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>{productDetails?.name}</Text>
                            <Text style={styles.productRarity}>Rarity: {productDetails?.rarityName || '...'}</Text>
                            {item.seller && (
                                <View style={styles.sellerInfo}>
                                    <ApiImage urlPath={item.seller.profileImage} style={styles.sellerAvatar} />
                                    <Text style={styles.sellerName}>{item.seller.username}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.detailsSection}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Start Price</Text>
                                <Text style={styles.detailValue}>{formatCurrency(productDetails?.starting_price)} VND</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Quantity</Text>
                                <Text style={styles.detailValue}>{item.quantity}</Text>
                            </View>
                        </View>
                        <View style={styles.currentPriceContainer}>
                            <Text style={styles.currentPriceLabel}>Current Price</Text>
                            <Text style={styles.currentPriceValue}>{formatCurrency(item.auction_current_amount)} VND</Text>
                        </View>
                        <Text style={styles.timeLeft}>{timeDisplay}</Text>
                        <Text style={styles.feeText}>Fee: {item.transaction_fee_percent}% (deducted from host)</Text>
                    </View>
                    {topBidders.length > 0 && (
                        <View style={styles.biddersSection}>
                            <Text style={styles.biddersTitle}>Top Bidders</Text>
                            {topBidders.map((bidder, index) => (
                                <View key={bidder.bidder_id} style={styles.bidderRow}>
                                    <Text style={styles.bidderText}>{index + 1}. {bidder.username}</Text>
                                    <Text style={styles.bidderAmount}>{formatCurrency(bidder.bid_amount)} VND</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    {/* <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={2}>{productDetails?.name}</Text>
                        {productDetails?.rarityName && <Text style={styles.rarityText}>Rarity: {productDetails.rarityName}</Text>}
                        {productDetails?.starting_price && (
                            <Text style={styles.priceText}>
                                Start Price: {formatCurrency(productDetails.starting_price)} VND
                            </Text>
                        )}
                        <Text style={styles.currentPrice}>
                            Current Price: {formatCurrency(item.auction_current_amount)} VND
                        </Text>
                        <Text style={styles.feeText}>
                            Fee: {item.transaction_fee_percent}% (deducted from host)
                        </Text>
                        <Text style={styles.itemDescription}>Quantity: {item.quantity}</Text>
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
                        <Text style={styles.timeLeft}>{timeDisplay}</Text>
                        {topBidders.length > 0 && (
                            <View style={styles.biddersContainer}>
                                <Text style={styles.biddersTitle}>Top Bidders:</Text>
                                {topBidders.map((bidder, index) => (
                                    <Text key={bidder.bidder_id} style={styles.bidderText}>
                                        {index + 1}. {bidder.username} - {formatCurrency(bidder.bid_amount)} VND
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View> */}
                </>
            )}
        </TouchableOpacity>
    );
};

export default function OngoingAuctions() {
    const navigation = useNavigation<RootStackNavigationProp>();
    const [filter, setFilter] = useState<'started' | 'waiting' | 'default'>('started');
    const [auctions, setAuctions] = useState<AuctionWithSeller[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);


    // const loadAuctions = async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const data = await fetchAuctionList(filter);
    //         setAuctionList(data);
    //     } catch (err) {
    //         setError('Failed to load auctions');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     loadAuctions();
    // }, [filter]);

    // Hàm format thời gian còn lại
    const formatTimeLeft = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const auctionRes = await fetchAuctionExtendList(filter);
            console.log("Dữ liệu gốc từ API:", auctionRes.data); // Log này rất quan trọng
            if (auctionRes.success && Array.isArray(auctionRes.data)) {
                // Gọi thêm profile người bán cho từng auction

                let flatAuctions: AuctionItem[] = auctionRes.data.flat();

                if (filter === "default") {
                    const now = new Date();
                    flatAuctions = flatAuctions.filter(a => {
                        const end = new Date(a.end_time);
                        return end.getTime() < now.getTime();
                    });
                }
                const auctionsWithSeller = await Promise.all(
                    flatAuctions.map(async (auction: AuctionItem) => {
                        try {
                            const profileRes = await getOtherProfile(auction.seller_id);
                            return {
                                ...auction,
                                seller: profileRes.status ? profileRes.data : null,
                            };
                        } catch {
                            return {
                                ...auction,
                                seller: null,
                            };
                        }
                    })
                );
                auctionsWithSeller.sort((b, a) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
                setAuctions(auctionsWithSeller);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch auctions');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [fetchData]) // hoặc [filter] nếu bạn gọi fetchData inline
    );

    const filters = ['started', 'waiting', 'default'] as const;
    type FilterKey = typeof filters[number];

    const labelMap = {
        started: 'Live',
        waiting: 'Starting Soon',
        default: 'Ended'
    };

    // đảo ngược map để dễ lookup khi người dùng chọn label
    const keyMap = Object.fromEntries(
        Object.entries(labelMap).map(([k, v]) => [v, k])
    ) as Record<string, FilterKey>; // chuyển ngược label -> key
    const displayFilters = filters.map(k => labelMap[k] ?? k); // ['On Going','Starting Soon']
    const activeFilterLabel = labelMap[filter];

    return (
        <SafeAreaView style={styles.container}>
            <FilterBar
                filters={displayFilters}
                activeFilter={activeFilterLabel}
                onSelectFilter={(selected) => {
                    const key = keyMap[selected] ?? (selected as FilterKey);
                    setFilter(key);
                }}
            />

            {loading && <ActivityIndicator size="large" color="#333" />}
            {error && (
                <Text style={{ color: 'red', textAlign: 'center', marginVertical: 8 }}>
                    {error}
                </Text>
            )}

            <FlatList
                data={auctions}
                renderItem={({ item }) => <AuctionCard item={item} />}
                keyExtractor={(item) => item.auction_id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => {
                    if (loading) return null;
                    return (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>
                            No auctions found.
                        </Text>
                    );
                }}
            />
        </SafeAreaView>
    );
};

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//     },
//     listContent: {
//         paddingHorizontal: 16,
//         paddingBottom: 16,
//     },
//     itemContainer: {
//         backgroundColor: '#fff',
//         borderRadius: 8,
//         flexDirection: 'row',
//         padding: 12,
//         marginBottom: 12,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.2,
//         shadowRadius: 1.41,
//         minHeight: 120, // Đảm bảo chiều cao tối thiểu cho loading
//     },
//     loadingContainer: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     itemImage: {
//         width: 105,
//         height: 150,
//         borderRadius: 8,
//         marginRight: 12,
//         marginTop: 9,
//     },
//     itemInfo: {
//         flex: 1,
//         justifyContent: 'flex-start',
//     },
//     itemName: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     rarityText: {
//         fontSize: 12,
//         color: '#666',
//         fontStyle: 'italic',
//         marginBottom: 4,
//     },
//     itemDescription: {
//         fontSize: 14,
//         color: '#555',
//         marginTop: 4,
//     },
//     currentPrice: {
//         fontSize: 13,
//         color: '#27ae60',
//         fontWeight: 'bold',
//         // marginTop: 4,
//     },
//     sellerName: {
//         fontSize: 12,
//         color: '#777',
//         marginLeft: 2,
//     },
//     timeLeft: {
//         fontSize: 12,
//         color: '#e74c3c',
//         fontWeight: '500',
//         marginTop: 8,
//     },
//     biddersContainer: {
//         marginTop: 10,
//         borderTopWidth: 1,
//         borderTopColor: '#eee',
//         paddingTop: 5,
//     },
//     biddersTitle: {
//         fontWeight: 'bold',
//         fontSize: 13,
//         color: '#444'
//     },
//     bidderText: {
//         fontSize: 12,
//         color: '#555'
//     },
//     sellerInfoContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 4,
//     },
//     sellerAvatar: {
//         width: 24,
//         height: 24,
//         borderRadius: 12,
//     },
//     priceText: {
//         fontSize: 12,
//         color: '#888',
//         marginTop: 4,
//     },
//     // Style mới cho phí giao dịch
//     feeText: {
//         fontSize: 12,
//         fontStyle: 'italic',
//         color: '#e74c3c',
//         marginBottom: 4,
//     },
//     cardContainer: {
//         backgroundColor: '#ffffff',
//         borderRadius: 16,
//         marginBottom: 16,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 5,
//     },
// });
const styles = StyleSheet.create({
    //     itemContainer: {
    //         backgroundColor: '#fff',
    //         borderRadius: 8,
    //         flexDirection: 'row',
    //         padding: 12,
    //         marginBottom: 12,
    //         elevation: 2,
    //         shadowColor: '#000',
    //         shadowOffset: { width: 0, height: 1 },
    //         shadowOpacity: 0.2,
    //         shadowRadius: 1.41,
    //         minHeight: 120, // Đảm bảo chiều cao tối thiểu cho loading
    //     },
    // --- Bố cục chung ---
    container: { flex: 1, backgroundColor: '#f2f2f7' },
    listContent: { paddingHorizontal: 16, paddingVertical: 12 },
    loadingContainer: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },

    // --- Card chính ---
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },

    // --- Khu vực 1: Header ---
    headerSection: {
        padding: 16,
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
        color: '#8e8e93',
    },

    // --- Khu vực 2: Sản phẩm & Host ---
    productSection: {
        flexDirection: 'row',
        padding: 16,
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#f2f2f7',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3c3c43',
    },
    productRarity: {
        fontSize: 13,
        color: '#636366',
        marginTop: 4,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    sellerAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    sellerName: {
        fontSize: 14,
        color: '#007aff',
        fontWeight: '500',
    },

    // --- Khu vực 3: Giá & Thời gian ---
    detailsSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e5ea',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#8e8e93',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1c1c1e',
    },
    currentPriceContainer: {
        backgroundColor: '#eef5ff',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        alignItems: 'center',
    },
    currentPriceLabel: {
        fontSize: 14,
        color: '#007aff',
        fontWeight: '500',
        marginBottom: 4,
    },
    currentPriceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007aff',
    },
    timeLeft: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#34c759',
        textAlign: 'center',
        marginTop: 12,
    },
    feeText: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#8e8e93',
        textAlign: 'center',
        marginTop: 4,
    },

    // --- Khu vực 4: Bidders ---
    biddersSection: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e5ea',
        backgroundColor: '#f9f9f9',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    biddersTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1c1c1e',
        marginBottom: 8,
    },
    bidderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    bidderText: {
        fontSize: 14,
        color: '#3c3c43',
    },
    bidderAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3c3c43',
    },
});
// export default OngoingAuctions;
