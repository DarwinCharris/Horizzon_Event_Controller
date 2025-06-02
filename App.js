import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Importa tus componentes correctamente
import HomeScreen from "./src/screens/HomeScreen";
import EventTrackScreen from "./src/screens/EventTrackScreen";
import StatsScreen from "./src/screens/StatsScreen"; // Asegúrate de crear este componente
import EventDetailScreen from "./src/screens/EventDetailScreen";
import { TopNavBar } from "./src/components/TopNavBar";
import EventTrackDetailScreen from "./src/screens/EventTrackDetailScreen";
import AddEventTrackScreen from "./src/screens/AddEventTrackScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <>
      <TopNavBar title="Horizzon" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Home") {
              return <Ionicons name="home" size={size} color={color} />;
            } else if (route.name === "AllEvents") {
              return (
                <MaterialIcons name="timeline" size={size} color={color} />
              );
            } else if (route.name === "Stats") {
              return (
                <MaterialIcons name="analytics" size={size} color={color} />
              );
            }
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "#dddddd",
          tabBarStyle: {
            backgroundColor: "#8bd5fc",
            height: 60,
            paddingBottom: 10,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="AllEvents"
          component={EventTrackScreen}
          options={{ title: "All Events" }}
        />
        <Tab.Screen name="Stats" component={StatsScreen} />
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
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen
          name="EventTrackDetail"
          component={EventTrackDetailScreen}
          options={({ route }) => ({
            title: route.params.trackName || "Detalle de Línea",
            headerBackTitle: "Atrás",
          })}
        />
        <Stack.Screen
          name="AddEventTrack"
          component={AddEventTrackScreen}
          options={{ title: "Nueva Línea" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
