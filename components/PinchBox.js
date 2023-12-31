


import React, { useRef, useState } from 'react';
import { View, PanResponder, Animated, Image, StyleSheet } from 'react-native';

const PinchBox = ({ imageSource }) => {
  const [lastRotation, setLastRotation] = useState(0);
  const [pinchDistance, setPinchDistance] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState({ x: 0, y: 0 });

  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const translateValue = useRef(new Animated.ValueXY()).current;

  const [accumulatedDx, setAccumulatedDx] = useState(0);
  const [accumulatedDy, setAccumulatedDy] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => {
        // Only set the PanResponder when one finger is used (drag and drop)
        return gestureState.numberActiveTouches === 1;
      },
      onMoveShouldSetPanResponder: (event, gestureState) => {
        // Only set the PanResponder when one finger is used (drag and drop)
        return gestureState.numberActiveTouches === 1;
      },
      onPanResponderMove: (event, gestureState) => {
        const { dx, dy, pinch, numberActiveTouches } = gestureState;
  
        // Drag and drop effect for single finger touch
        if (numberActiveTouches === 1) {
          // Calculate the new translation based on the initial touch position and delta values
          const x = prevTranslate.x + dx;
          const y = prevTranslate.y + dy;
          translateValue.setValue({ x, y });
        }
  
        // Pinch-to-zoom and rotation effect for two fingers touch
        if (numberActiveTouches === 2) {
          const dxPinch = event.nativeEvent.touches[1].pageX - event.nativeEvent.touches[0].pageX;
          const dyPinch = event.nativeEvent.touches[1].pageY - event.nativeEvent.touches[0].pageY;
          const distance = Math.sqrt(dxPinch * dxPinch + dyPinch * dyPinch);
  
          const pinchScale = distance / 400; // Adjust the scale factor as needed
          setPinchDistance(pinchScale);
          scaleValue.setValue(pinchScale);
  
          const rotation = Math.atan2(dyPinch, dxPinch) * (180 / Math.PI);
          rotateValue.setValue(rotation);
  
          // Reset the translate value when we start pinch to avoid abrupt jumps
          translateValue.setOffset({ x: prevTranslate.x, y: prevTranslate.y });
          translateValue.setValue({ x: 0, y: 0 });
        }
        

        return true;
      },
      onPanResponderRelease: (event, gestureState) => {
        // Save the current translation as previous translation when touch is released
        
        const { dx, dy } = gestureState;
        setPrevTranslate(prevTranslate => ({
          x: prevTranslate.x + dx / scaleValue._value,
          y: prevTranslate.y + dy / scaleValue._value,
        }));
  
        // Update lastRotation when the touch is released
        rotateValue.extractOffset();
        const currentRotation = rotateValue._value;
        rotateValue.setValue(0);
        rotateValue.flattenOffset();
        setLastRotation(lastRotation + currentRotation);
        
      },
  
      // Additional panResponder methods can be added if needed
      onPanResponderTerminate: () => {},
      onShouldBlockNativeResponder: () => true,
    })
  ).current;
  

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    box: {
      width: 100,
      height: 120,
    },
  });

  // const imageSource = require('../assets/tree-01.png'); // Replace with the actual image path
  console.log(translateValue.x);
  console.log(translateValue.y);
  return (
    <View style={styles.container}>
      <Animated.Image
        {...panResponder.panHandlers}
        source={imageSource}
        style={[
          styles.box,
          {
            transform: [
              { scale: scaleValue },
              { rotate: rotateValue.interpolate({ inputRange: [-180, 180], outputRange: ['-180deg', '180deg'] }) },
              { translateX: translateValue.x },
              { translateY: translateValue.y },
            ],
          },
        ]}
      />
    </View>
  );
};

export default PinchBox;
