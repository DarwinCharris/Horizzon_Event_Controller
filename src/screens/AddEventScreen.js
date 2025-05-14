import React from 'react';
import { View, Text } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';

export const AddEventScreen = ({ navigation }) => {
  return (
    <ScreenLayout title="Agregar Evento" navigation={navigation} currentRoute="AddEvent">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Formulario para agregar eventos</Text>
      </View>
    </ScreenLayout>
  );
};