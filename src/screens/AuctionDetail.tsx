import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

// --- Types, APIs, Components ---
import { RootStackScreenProps, AuctionProduct, CollectionDetailItem, AuctionDetailData } from '../types/types';
import { fetchAuctionProduct } from '../services/api.auction';
import { getCollectionDetail } from '../services/api.product';
import ApiImage from '../components/ApiImage';

// Helper function để style cho rarity
const getRarityColor = (rarity?: string) => {
    if (!rarity) return '#000';
    const lowerRarity = rarity.toLowerCase();
    switch (lowerRarity) {
        case 'legendary': return '#FFD700'; case 'epic': return '#A020F0';
        case 'rare': return '#1E90FF'; case 'uncommon': return '#32CD32';
        case 'common': return '#A9A9A9'; default: return '#000';
    }
};

export default function AuctionDetail({ route }: RootStackScreenProps<'AuctionDetail'>) {
    const { auctionId } = route.params;

    // --- State Management ---
    const [auctionData, setAuctionData] = useState<AuctionDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bidAmount, setBidAmount] = useState('');

    // --- Data Fetching ---
    useEffect(() => {
        const loadAuctionDetails = async () => {
            try {
                setLoading(true);
                // 1. Lấy thông tin sản phẩm trong phiên đấu giá
                const auctionProductRes = await fetchAuctionProduct(auctionId);
                if (!auctionProductRes.success || !auctionProductRes.data || auctionProductRes.data.length === 0) {
                    throw new Error("Auction product not found.");
                }
                const auctionProduct: AuctionProduct = auctionProductRes.data[0];

                // 2. Dùng user_product_id để lấy thông tin chi tiết của sản phẩm
                const productDetailRes = await getCollectionDetail(auctionProduct.user_product_id);
                if (!productDetailRes.status || !productDetailRes.data) {
                    throw new Error("Product details not found.");
                }
                const productDetail: CollectionDetailItem = productDetailRes.data;

                // 3. Tổng hợp dữ liệu từ 2 API để hiển thị
                const combinedData: AuctionDetailData = {
                    auctionProductId: auctionProduct._id,
                    startingPrice: auctionProduct.starting_price,
                    currentPrice: auctionProduct.current_price,
                    quantity: auctionProduct.quantity,
                    sellerId: auctionProduct.seller_id,
                    productName: productDetail.name,
                    productImageUrl: productDetail.urlImage,
                    productRarity: productDetail.rarityName,
                    description: productDetail.description,
                };

                setAuctionData(combinedData);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load auction details.");
            } finally {
                setLoading(false);
            }
        };

        loadAuctionDetails();
    }, [auctionId]);


    const handlePlaceBid = () => {
        if (!auctionData) return;
        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount <= auctionData.currentPrice) {
            Alert.alert("Invalid Bid", `Your bid must be higher than ${auctionData.currentPrice.toLocaleString('vi-VN')} đ.`);
            return;
        }
        // LƯU Ý: API để đặt giá chưa được cung cấp
        Alert.alert("Feature in Development", `Successfully placed a bid of ${amount.toLocaleString('vi-VN')} đ.`);
        setBidAmount('');
    };

    if (loading) {
        return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} size="large" color="#d9534f" /></SafeAreaView>;
    }

    if (error || !auctionData) {
        return <SafeAreaView style={styles.container}><Text style={styles.errorText}>{error || 'Auction not found.'}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <ApiImage urlPath={auctionData.productImageUrl} style={styles.productImage} />
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.productName}>{auctionData.productName}</Text>
                        <View style={[styles.rarityBadge, { borderColor: getRarityColor(auctionData.productRarity) }]}>
                            <Text style={[styles.rarityText, { color: getRarityColor(auctionData.productRarity) }]}>
                                {auctionData.productRarity.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Starting Price:</Text>
                        <Text style={styles.priceValue}>{auctionData.startingPrice.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Highest Bid:</Text>
                        <Text style={[styles.priceValue, { color: '#28a745' }]}>{auctionData.currentPrice.toLocaleString('vi-VN')} đ</Text>
                    </View>

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{auctionData.description}</Text>

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Bid History</Text>
                    {/* LƯU Ý: API để lấy lịch sử đấu giá chưa được cung cấp */}
                    <Text style={styles.placeholderText}>Bid history is currently unavailable.</Text>

                </View>
            </ScrollView>
            <View style={styles.bidInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={`Bid > ${auctionData.currentPrice.toLocaleString('vi-VN')} đ`}
                    keyboardType="numeric"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                />
                <TouchableOpacity style={styles.bidButton} onPress={handlePlaceBid}>
                    <Text style={styles.bidButtonText}>Place Bid</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    errorText: { flex: 1, textAlign: 'center', textAlignVertical: 'center', color: 'red' },
    productImage: { width: '100%', height: 350, resizeMode: 'contain', backgroundColor: '#f0f2f5' },
    infoContainer: { padding: 16 },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    productName: {
        fontSize: 24,
        fontFamily: 'Oxanium-Bold',
        flex: 1, // Để tên sản phẩm có thể co giãn
        marginRight: 8,
    },
    rarityBadge: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    rarityText: {
        fontFamily: 'Oxanium-Bold',
        fontSize: 12,
    },
    priceInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priceLabel: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#666' },
    priceValue: { fontSize: 16, fontFamily: 'Oxanium-Bold' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontFamily: 'Oxanium-Bold', marginBottom: 12 },
    descriptionText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 16,
        lineHeight: 24,
        color: '#333'
    },
    placeholderText: {
        fontFamily: 'Oxanium-Regular',
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
        paddingVertical: 20,
    },
    bidInputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff', marginBottom: 30 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginRight: 8, fontFamily: 'Oxanium-Regular', fontSize: 16 },
    bidButton: { backgroundColor: '#d9534f', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, justifyContent: 'center' },
    bidButtonText: { color: '#fff', fontFamily: 'Oxanium-Bold', fontSize: 16 },
});