import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  Button,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Camera } from 'expo-camera';
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("gallery.db");

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    createTable(); // Create the table if it doesn't exist
    fetchGallery();
  }, []);

  const createTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, photoUri TEXT NOT NULL, latitude REAL, longitude REAL, address TEXT);",
        [],
        () => console.log('Table "photos" created successfully.'),
        (_, error) => {
          console.error("Error creating table:", error);
        }
      );
    });
  };

  const fetchGallery = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM photos;",
        [],
        (_, result) => {
          const storedGallery = result.rows._array;
          setGallery(storedGallery);
        },
        (_, error) => {
          console.error("Error fetching gallery:", error);
        }
      );
    });
  };

  const deleteImage = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM photos WHERE id = ?;",
        [id],
        () => fetchGallery(), // Fetch the updated gallery after successful deletion
        (_, error) => {
          console.error("Error deleting image:", error);
        }
      );
    });
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => deleteImage(id),
      },
    ]);
  };

  const openImage = (uri) => {
    setSelectedImage(uri);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const saveImageToGallery = (imageInfo) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            "INSERT INTO photos (photoUri, latitude, longitude, address) VALUES (?, ?, ?, ?);",
            [
              imageInfo.photoUri,
              imageInfo.latitude,
              imageInfo.longitude,
              imageInfo.address,
            ],
            (_, result) => resolve(result.insertId),
            (_, error) => reject(error)
          );
        },
        null,
        () => console.log("Image saved to gallery successfully.")
      );
    });
  };

  const savePic = () => {
    if (photo) {
      saveImageToGallery({
        photoUri: photo.uri,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        address: address,
      })
        .then((insertId) => {
          // Image saved successfully, update the photo state with the saved image data
          setGallery((prevGallery) => [
            ...prevGallery,
            {
              id: insertId,
              photoUri: photo.uri,
              latitude: location?.coords.latitude,
              longitude: location?.coords.longitude,
              address: address,
            },
          ]);
          setPhoto(null); // Reset the photo state
        })
        .catch((error) => {
          console.error("Error saving image to gallery:", error);
        });
    }
  };

  const renderImageItem = ({ item }) => {
    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => openImage(item.photoUri)}>
          <Image style={styles.image} source={{ uri: item.photoUri }} />
        </TouchableOpacity>
        <View style={styles.imageInfo}>
          <Text>Latitude: {item.latitude}</Text>
          <Text>Longitude: {item.longitude}</Text>
          <Text>Address: {item.address}</Text>
        </View>
        <Button title="Delete" onPress={() => confirmDelete(item.id)} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {gallery.length === 0 ? (
        <Text>No images in the gallery.</Text>
      ) : (
        <FlatList
          data={gallery}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      <Modal
        animationType="fade"
        visible={selectedImage !== null}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalImageContainer}
            onPress={closeModal}
          >
            <Image style={styles.modalImage} source={{ uri: selectedImage }} />
          </TouchableOpacity>
        </View>
      </Modal>
      {photo ? (
        <>
          <Image style={styles.preview} source={{ uri: photo.uri }} />
          <Text>Latitude: {location?.coords.latitude}</Text>
          <Text>Longitude: {location?.coords.longitude}</Text>
          <Text>Address: {address}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={savePic} />
            <Button title="Discard" onPress={() => setPhoto(null)} />
          </View>
        </>
      ) : (
        <Camera
          style={styles.camera}
          ref={cameraRef}
          onReady={handleCameraReady}
          type={cameraType}
          ratio="16:9"
        >
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
  // ... styles remain the same
});

export default Gallery;
