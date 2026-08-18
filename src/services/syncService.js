// src/services/syncService.js
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const syncProgress = async (userId) => {
  const isConnected = await NetInfo.fetch().then(state => state.isConnected);
  if (isConnected) {
    const localData = await AsyncStorage.getItem('progress');
    await fetch('https://api.littlelogicheroes.com/sync', {
      method: 'POST',
      body: localData
    });
  }
};