import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddEventScreen } from './src/screens/AddEventScreen';
import { MyEventsScreen } from './src/screens/MyEventsScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerShown: false,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 0 } },
    close: { animation: 'timing', config: { duration: 0 } },
  },
  cardStyleInterpolator: () => ({}),
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={screenOptions}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddEvent" component={AddEventScreen} />
        <Stack.Screen name="MyEvents" component={MyEventsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}