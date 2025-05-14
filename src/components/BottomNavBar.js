import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export const BottomNavBar = ({ navigation, currentRoute }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={currentRoute === 'Home' ? 'white' : '#dddddd'} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('AddEvent')}
      >
        <MaterialIcons 
          name="add-circle" 
          size={24} 
          color={currentRoute === 'AddEvent' ? 'white' : '#dddddd'} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigation.navigate('MyEvents')}
      >
        <MaterialIcons 
          name="event" 
          size={24} 
          color={currentRoute === 'MyEvents' ? 'white' : '#dddddd'} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#8bd5fc',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});