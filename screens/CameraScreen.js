import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Button,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("gallery.db");

const CameraScreen = ({ navigation }) => {
  const cameraRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(null);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");

      // Request location permission
      const locationPermission =
        await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status === "granted") {
        // Get the user's location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Get the address using reverse geocoding
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        if (addressResponse.length > 0) {
          const firstAddress = addressResponse[0];
          setAddress(
            `${firstAddress.name}, ${firstAddress.street}, ${firstAddress.region}, ${firstAddress.country}`
          );
        }
      }
    })();
  }, []);

  if (hasCameraPermission === null || hasMediaLibraryPermission === null) {
    return <Text>Requesting permissions...</Text>;
  } else if (hasCameraPermission === false) {
    return (
      <Text>
        Permission for the camera not granted. Please change this in settings.
      </Text>
    );
  }

  let takePic = async () => {
    if (cameraRef.current) {
      let photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo);
    }
  };

  const saveImageToGallery = () => {
    if (photo) {
      db.transaction((tx) => {
        tx.executeSql(
          "INSERT INTO photos (photoUri, latitude, longitude, address) VALUES (?, ?, ?, ?);",
          [
            photo.uri,
            location?.coords.latitude,
            location?.coords.longitude,
            address,
          ],
          (_, resultSet) => {
            const newId = resultSet.insertId;
            setPhoto(null);
            navigation.navigate("Gallery", { newId });
          },
          (_, error) => {
            console.error("Error saving image to gallery:", error);
          }
        );
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {photo ? (
        <>
          <Image style={styles.preview} source={{ uri: photo.uri }} />
          <Text>Latitude: {location?.coords.latitude}</Text>
          <Text>Longitude: {location?.coords.longitude}</Text>
          <Text>Address: {address}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={saveImageToGallery} />
            <Button title="Discard" onPress={() => setPhoto(null)} />
          </View>
        </>
      ) : (
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.bottomButtonContainer}>
            <View style={styles.bottomButton}>
              <Button title="Take Pic" onPress={takePic} />
            </View>
            <View style={styles.bottomButton}>
              <Button
                title="Gallery"
                onPress={() => navigation.navigate("Gallery")}
              />
            </View>
          </View>
        </Camera>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  preview: {
    alignSelf: "stretch",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  bottomButton: {
    flex: 1,
    alignItems: "center",
    marginBottom: 10,
  },
});

export default CameraScreen;
