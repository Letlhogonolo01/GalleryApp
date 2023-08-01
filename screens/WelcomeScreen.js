import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

const WelcomeScreen = ({ navigation }) => {
  const goToCameraScreen = () => {
    navigation.navigate("Camera");
  };

  const goToGalleryScreen = () => {
    navigation.navigate("Gallery");
  };

  return (
    <ImageBackground
      source={require("../assets/mountain-range.avif")}
      style={styles.container}
    >
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={goToCameraScreen}>
          <Text style={styles.buttonText}>Take Pic</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goToGalleryScreen}>
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "80%",
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default WelcomeScreen;
