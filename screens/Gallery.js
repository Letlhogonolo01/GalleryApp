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
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("gallery.db");

const Gallery = ({ route }) => {
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (route.params && route.params.newId) {
      setSelectedImage(null);
      fetchGallery();
    }
  }, [route.params]);

  const fetchGallery = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, photoUri TEXT, latitude REAL, longitude REAL, address TEXT);"
      );
      tx.executeSql(
        "SELECT * FROM photos;",
        [],
        (_, { rows }) => {
          setGallery(rows._array);
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
        () => {
          fetchGallery();
        },
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  imageContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "lightgrey",
    padding: 10,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imageInfo: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalImageContainer: {
    width: "90%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default Gallery;
