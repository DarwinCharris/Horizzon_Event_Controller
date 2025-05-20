import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Importa tus componentes correctamente
import HomeScreen from './src/screens/HomeScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import EventTrackScreen from './src/screens/EventTrackScreen';
import MyEventsScreen from './src/screens/MyEventsScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import { TopNavBar } from './src/components/TopNavBar';
import EventTrackDetailScreen from './src/screens/EventTrackDetailScreen';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <>
      <TopNavBar title="Horizzon" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              return <Ionicons name="home" size={size} color={color} />;
            } else if (route.name === 'AddEvent') {
              return <MaterialIcons name="add-circle" size={size} color={color} />;
            } else if (route.name === 'MyEvents') {
              return <MaterialIcons name="event" size={size} color={color} />;
            } else if (route.name === 'EventTrack') {
              return <MaterialIcons name="timeline" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#dddddd',
          tabBarStyle: {
            backgroundColor: '#8bd5fc',
            height: 60,
            paddingBottom: 10,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Tab.Screen 
          name="AddEvent" 
          component={AddEventScreen} 
        />
        <Tab.Screen 
          name="MyEvents" 
          component={MyEventsScreen} 
        />
        <Tab.Screen 
          name="EventTrack" 
          component={EventTrackScreen} 
        />
      </Tab.Navigator>
    </>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainNavigator} 
        />
        <Stack.Screen 
          name="EventDetail" 
          component={EventDetailScreen} 
        />
        <Stack.Screen 
          name="EventTrackDetail" 
          component={EventTrackDetailScreen} 
          options={({ route }) => ({ 
            title: route.params.trackName || 'Detalle de Línea',
            headerBackTitle: 'Atrás'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}