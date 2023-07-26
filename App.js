import React, {useState} from 'react';
import { View, FlatList, Image, Dimensions, StyleSheet, Pressable, Text } from 'react-native';
import PinchBox from './components/PinchBox';

const App = () => {
  const initialImages = [
    require('./assets/tree-01.png'),
    require('./assets/tree-02.png'),
    require('./assets/tree-03.png'),
    require('./assets/stone-02.png'),
    // Add more image sources here
  ];

  const windowWidth = Dimensions.get('window').width;
  
  const [images, setImages] = useState([]);

  const handleImagePress = (imageUrl) => {
    setImages([...images, imageUrl]);
  };


  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <FlatList
          data={initialImages}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleImagePress(item)}>
            <View style={styles.imageFrame}>
              <Image source={item} style={styles.image} />
            </View>
          </Pressable>

          )}
        />
      </View>

      <View style={styles.pinchBoxContainer}>
      {images.map((imageSource, index) => (
        <PinchBox key={index} imageSource={imageSource} />
      ))}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={[styles.button, styles.lightBlue]}>
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.lightRed]}>
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, // Add padding to create space between the border and content
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    height: 150, // Height of the container to hold the images
    overflow: 'hidden', // Hide overflowing images
  },
  imageFrame: {
    width: 100,
    height: 120,
    marginHorizontal: 5, // Add horizontal margin between images
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  pinchBoxContainer: {

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal:15,
    marginTop: 10, // Add margin between the FlatList and PinchBox container
    borderStyle: "solid",
    borderWidth: 1,
    height: 500,
    borderColor: "#000",
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },

  lightBlue: {
    backgroundColor: '#ADD8E6',
  },

  lightRed: {
    backgroundColor: '#FFA07A',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default App;
