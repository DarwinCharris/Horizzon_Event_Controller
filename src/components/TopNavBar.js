import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

export const TopNavBar = ({ title }) => {
  return (
    <>
      <StatusBar backgroundColor="#6200ee" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    backgroundColor: '#8bd5fc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});