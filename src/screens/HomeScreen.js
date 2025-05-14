import React from 'react';
import { View, Text } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';

export const HomeScreen = ({ navigation }) => {
  return (
    <ScreenLayout title="Inicio" navigation={navigation} currentRoute="Home">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Contenido de Inicio</Text>
      </View>
    </ScreenLayout>
  );
};