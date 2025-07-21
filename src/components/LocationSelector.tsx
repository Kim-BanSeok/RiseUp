import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';

interface LocationSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  currentLocation: string;
}

const POPULAR_LOCATIONS = [
  { name: '서울', nx: 60, ny: 127 },
  { name: '부산', nx: 98, ny: 76 },
  { name: '대구', nx: 89, ny: 90 },
  { name: '인천', nx: 55, ny: 124 },
  { name: '광주', nx: 58, ny: 74 },
  { name: '대전', nx: 67, ny: 100 },
  { name: '울산', nx: 102, ny: 84 },
  { name: '세종', nx: 66, ny: 103 },
  { name: '수원', nx: 60, ny: 121 },
  { name: '청주', nx: 69, ny: 106 },
  { name: '전주', nx: 63, ny: 89 },
  { name: '포항', nx: 102, ny: 94 },
];

const LocationSelector: React.FC<LocationSelectorProps> = ({
  visible,
  onClose,
  onLocationSelect,
  currentLocation,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(POPULAR_LOCATIONS);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredLocations(POPULAR_LOCATIONS);
    } else {
      const filtered = POPULAR_LOCATIONS.filter(location =>
        location.name.includes(text)
      );
      setFilteredLocations(filtered);
    }
  };

  const handleLocationSelect = (location: typeof POPULAR_LOCATIONS[0]) => {
    onLocationSelect(location.name);
    onClose();
  };

  const renderLocationItem = ({ item }: { item: typeof POPULAR_LOCATIONS[0] }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        item.name === currentLocation && styles.selectedLocation
      ]}
      onPress={() => handleLocationSelect(item)}
    >
      <Text style={[
        styles.locationName,
        item.name === currentLocation && styles.selectedLocationText
      ]}>
        {item.name}
      </Text>
      {item.name === currentLocation && (
        <Text style={styles.currentIndicator}>현재 선택</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>위치 선택</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>완료</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="지역 검색..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        <Text style={styles.sectionTitle}>인기 지역</Text>

        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item.name}
          renderItem={renderLocationItem}
          style={styles.locationList}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF7F50',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: '#2A2A2A',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  sectionTitle: {
    color: '#A67C61',
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  locationList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    marginBottom: 8,
    borderRadius: 10,
  },
  selectedLocation: {
    backgroundColor: '#FF7F5020',
    borderWidth: 1,
    borderColor: '#FF7F50',
  },
  locationName: {
    color: 'white',
    fontSize: 16,
  },
  selectedLocationText: {
    color: '#FF7F50',
    fontWeight: 'bold',
  },
  currentIndicator: {
    color: '#FF7F50',
    fontSize: 12,
  },
});

export default LocationSelector; 