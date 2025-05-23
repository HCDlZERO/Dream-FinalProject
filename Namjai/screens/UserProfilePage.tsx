import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchUserDetail, updateUserInfo } from '../services/apiService';

const UserProfilePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { numberId } = route.params as { numberId: string };

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadUser();
  }, [numberId]);

  const loadUser = async () => {
    try {
      const result = await fetchUserDetail(numberId);
      console.log('✅ ได้ข้อมูล:', result); // ✅ log ดูผล
      setUserData(result); // ✅ แก้ตรงนี้ ไม่ต้อง .data แล้ว!!
    } catch (error) {
      console.error('Failed to load user data', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditData({
      house_number: userData?.house_number || '',
      street: userData?.street || '',
      district: userData?.district || '',
      city: userData?.city || '',
      postal_code: userData?.postal_code || '',
      email: userData?.email || '',
      phone_number: userData?.phone_number || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        numberId: numberId,
        houseNumber: editData.house_number,
        street: editData.street,
        district: editData.district,
        city: editData.city,
        postalCode: editData.postal_code,
        email: editData.email,
        phoneNumber: editData.phone_number,
      };
      await updateUserInfo(payload);
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
      setEditModalVisible(false);
      loadUser();
    } catch (error) {
      console.error('Update User Info Error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>ไม่พบข้อมูลผู้ใช้</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>NAM<Text style={styles.logoHighlight}>JAI</Text></Text>
        <Text style={styles.menuIcon}>☰</Text>
      </View>

      {/* User Info */}
      <View style={styles.formContainer}>
        <InfoRow label="ชื่อจริง" value={userData.first_name} />
        <InfoRow label="นามสกุล" value={userData.last_name} />
        <InfoRow label="บ้านเลขที่" value={userData.house_number} />
        <InfoRow label="ถนน" value={userData.street} />
        <InfoRow label="เขต/อำเภอ" value={userData.district} />
        <InfoRow label="จังหวัด" value={userData.city} />
        <InfoRow label="รหัสไปรษณีย์" value={userData.postal_code} />
        <InfoRow label="อีเมล" value={userData.email} />
        <InfoRow label="เบอร์โทรศัพท์" value={userData.phone_number} />

        {/* ปุ่มแก้ไข */}
        <TouchableOpacity style={styles.submitButton} onPress={handleOpenEdit}>
          <Text style={styles.submitText}>แก้ไขข้อมูล</Text>
        </TouchableOpacity>
      </View>

      {/* Modal สำหรับแก้ไข */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>แก้ไขข้อมูลผู้ใช้งาน</Text>

          {['house_number', 'street', 'district', 'city', 'postal_code', 'email', 'phone_number'].map((field) => (
            <View key={field}>
              <Text style={styles.label}>{field.replace('_', ' ').toUpperCase()}</Text>
              <TextInput
                style={styles.input}
                value={editData[field] ?? ''}
                onChangeText={(text) => setEditData({ ...editData, [field]: text })}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSaveEdit}>
            <Text style={styles.submitText}>บันทึก</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
            <Text style={styles.cancelText}>ยกเลิก</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={{ marginTop: 15 }}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.readonlyField}>{value || '-'}</Text>
  </View>
);

export default UserProfilePage;

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#E1F5FE', paddingBottom: 30 },
  header: {
    backgroundColor: '#0288D1',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  logoHighlight: { color: '#FF4081' },
  menuIcon: { fontSize: 24, color: 'white' },
  formContainer: { marginTop: 20, width: '85%' },
  label: { marginTop: 10, color: '#0288D1', fontWeight: 'bold' },
  readonlyField: {
    backgroundColor: '#0288D1',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#0288D1',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0288D1',
    marginTop: 20,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
    marginTop: 10,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flexGrow: 1,
    backgroundColor: '#E1F5FE',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0288D1',
    marginBottom: 20,
    textAlign: 'center',
  },
});

