// convertToBase64.js
import * as FileSystem from "expo-file-system";

export const convertToBase64 = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const extension = uri.split(".").pop();
    return `data:image/${extension};base64,${base64}`;
  } catch (error) {
    console.error("Error al convertir a base64:", error);
    return null;
  }
};
