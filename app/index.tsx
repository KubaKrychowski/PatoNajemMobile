import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { initAuth } from '../store/authSlice';
import { RootState, AppDispatch } from '../store';
import { Colors } from '../constants/theme';

export default function Index() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isInitialized } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    dispatch(initAuth());
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.green} size="large" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)/oferty' : '/(auth)/login'} />;
}
