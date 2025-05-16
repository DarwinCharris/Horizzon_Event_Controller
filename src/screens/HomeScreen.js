// HomeScreen.js
import { View } from "react-native";
import { ScreenLayout } from "../components/ScreenLayout";
import ImageUploader from "../components/componente_de_prueba/tomar_img";

export const HomeScreen = ({ navigation }) => {
  return (
    <ScreenLayout title="Inicio" navigation={navigation} currentRoute="Home">
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ImageUploader />
      </View>
    </ScreenLayout>
  );
};
