import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Thêm ActivityIndicator
} from 'react-native';
import { ShopStackScreenProps } from '../types/types';
// THÊM MỚI: Import API function và định nghĩa kiểu dữ liệu
import { getMysteryBoxDetail } from '../services/api.mysterybox';
import { MysteryBoxDetailItem } from '../types/types';
import { buildImageUrl } from '../services/api.imageproxy';

export default function BoxDetail({ route }: ShopStackScreenProps<'Box Detail'>) {
  const { boxId } = route.params;

  // THÊM MỚI: State để lưu chi tiết box, loading và error
  const [box, setBox] = useState<MysteryBoxDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [useBackup, setUseBackup] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const avatarUri = box ? buildImageUrl(box.urlImage, useBackup) : null;

  // THÊM MỚI: useEffect để gọi API chi tiết sản phẩm
  useEffect(() => {
    if (!boxId) {
      setError('Box ID is missing.');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await getMysteryBoxDetail(boxId);
        // API trả về { status, data, ...}, data là một object
        if (response.status && response.data) {
          setBox(response.data);
        } else {
          throw new Error('Invalid data format for box detail');
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch box details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [boxId]); // Phụ thuộc vào boxId, sẽ chạy lại nếu boxId thay đổi

  // THÊM MỚI: Xử lý giao diện khi đang tải hoặc có lỗi
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d9534f" />
      </SafeAreaView>
    );
  }

  // THAY ĐỔI: Xử lý trường hợp có lỗi hoặc không tìm thấy box
  if (error || !box) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>{error || 'Cannot find any product!'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // THAY ĐỔI: Giao diện hiển thị dữ liệu từ API
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sử dụng urlImage */}
        <Image
          source={
            imageLoadFailed || !avatarUri
              ? require('../../assets/logo.png')
              : { uri: avatarUri }
          }
          style={styles.mainImage} // hoặc styles.avatar nếu bạn dùng kiểu avatar
          onError={() => {
            if (!useBackup) {
              console.log("Ảnh trên server chính lỗi, chuyển sang backup server");
              setUseBackup(true);
            } else {
              console.log("Ảnh trên server backup cũng lỗi, dùng ảnh local");
              setImageLoadFailed(true);
            }
          }}
        />
        <View style={styles.infoContainer}>
          {/* Sử dụng collectionTopic */}
          <Text style={styles.collectionText}>Collection: {box.collectionTopic}</Text>

          {/* Sử dụng mysteryBoxName */}
          <Text style={styles.nameText}>{box.mysteryBoxName}</Text>

          {/* Sử dụng mysteryBoxPrice */}
          <Text style={styles.priceText}>
            {box.mysteryBoxPrice.toLocaleString('vi-VN')} đ
          </Text>

          <View style={styles.divider} />

          {/* Sử dụng mysteryBoxDescription */}
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{box.mysteryBoxDescription}</Text>

          {/* Sử dụng mảng products từ API */}
          {box.products && box.products.length > 0 && (
            <>
              <Text style={styles.descriptionTitle}>Product you can have</Text>
              {box.products.map((item, index) => (
                <Text key={index} style={styles.itemInsideText}>
                  • {item.productName} {/* Giả sử item có productName */}
                </Text>
              ))}
            </>
          )}

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => Alert.alert('Notice', 'Chức năng đang được phát triển!')}
        >
          <Text style={styles.buyButtonText}>Buy now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Thêm style cho centerContainer
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 20,
    fontFamily: 'Oxanium-Bold',
    color: '#888',
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#f0f2f5',
  },
  infoContainer: {
    padding: 20,
  },
  collectionText: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#666',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 24,
    fontFamily: 'Oxanium-Bold',
    color: '#222',
    lineHeight: 32,
  },
  priceText: {
    fontSize: 28,
    fontFamily: 'Oxanium-Bold',
    color: '#d9534f',
    marginVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: 'Oxanium-SemiBold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  itemInsideText: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#555',
    lineHeight: 24,
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buyButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    fontSize: 18,
    fontFamily: 'Oxanium-Bold',
    color: '#fff',
  },
});