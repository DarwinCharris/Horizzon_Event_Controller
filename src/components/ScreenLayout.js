import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TopNavBar } from './TopNavBar';
import { BottomNavBar } from './BottomNavBar';

export const ScreenLayout = ({ children, title, navigation, currentRoute }) => {
  return (
    <View style={styles.container}>
      <TopNavBar title={title} />
      
      <View style={styles.content}>
        {children}
      </View>
      
      <BottomNavBar navigation={navigation} currentRoute={currentRoute} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});