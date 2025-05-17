// src/screens/AddEventScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddEventScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Formulario para agregar eventos</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  }
});

export default AddEventScreen; // Exportación por defecto