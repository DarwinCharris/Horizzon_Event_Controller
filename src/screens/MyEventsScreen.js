import React from 'react';
import { View, Text } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';

export const MyEventsScreen = ({ navigation }) => {
  return (
    <ScreenLayout title="Mis Eventos" navigation={navigation} currentRoute="MyEvents">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Lista de mis eventos</Text>
      </View>
    </ScreenLayout>
  );
};