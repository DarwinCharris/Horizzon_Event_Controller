import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MyEventsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Eventos</Text>
      <View style={styles.content}>
        <Text>Lista de mis eventos</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default MyEventsScreen; 