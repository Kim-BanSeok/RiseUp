import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = ({navigation}: any) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>RiseUp 알람 홈</Text>
      <Button title="알람 추가" onPress={() => navigation.navigate('AddAlarm')} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  text: {fontSize: 20, fontWeight: '600'},
});