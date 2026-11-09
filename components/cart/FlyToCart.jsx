
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

const FlyToCartContext = createContext(null);

export function useFlyToCart() {
  return useContext(FlyToCartContext);
}

export function FlyToCartProvider({
  children,
  bottomInset = 0,
}) {
  const hostRef = useRef(null);
  const animationRef = useRef(null);
  const flightId = useRef(0);

  const [hostSize, setHostSize] = useState({
    width: 0,
    height: 0,
  });

  const [flight, setFlight] = useState(null);

  const progress = useRef(
    new Animated.Value(0)
  ).current;

  const flyToCart = useCallback(
    ({ imageUrl, startX, startY, size = 70 }) => {
      if (!imageUrl || !hostSize.width || !hostSize.height) {
        return;
      }

      hostRef.current?.measureInWindow(
        (hostX, hostY) => {
          if (!hostSize.width || !hostSize.height) {
            return;
          }

          animationRef.current?.stop();

          const id = ++flightId.current;

          const imageSize = Math.min(
            Math.max(size, 35),
            90
          );

          const fromX =
            startX - hostX - imageSize / 2;

          const fromY =
            startY - hostY - imageSize / 2;

          // Cart is the middle tab (third of five).
          const targetX =
            hostSize.width / 2 - imageSize / 2;

          const tabBarHeight =
            64 + bottomInset;

          const targetY =
            hostSize.height -
            tabBarHeight / 2 -
            imageSize / 2;

          progress.setValue(0);

          setFlight({
            id,
            imageUrl,
            size: imageSize,
            fromX,
            fromY,
            targetX,
            targetY,
          });

          const animation = Animated.timing(
            progress,
            {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }
          );

          animationRef.current = animation;

          animation.start(({ finished }) => {
            if (finished && flightId.current === id) {
              setFlight(null);
            }
          });
        }
      );
    },
    [hostSize, bottomInset, progress]
  );

  const translateX = flight
    ? progress.interpolate({
        inputRange: [0, 1],
        outputRange: [
          flight.fromX,
          flight.targetX,
        ],
      })
    : 0;

  const translateY = flight
    ? progress.interpolate({
        inputRange: [0, 0.45, 1],
        outputRange: [
          flight.fromY,
          Math.min(
            flight.fromY,
            flight.targetY
          ) - 45,
          flight.targetY,
        ],
      })
    : 0;

 const scale = progress.interpolate({
  inputRange: [0, 0.4, 0.75, 1],
  outputRange: [1, 0.95, 0.65, 0.12],
});

  const opacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <FlyToCartContext.Provider
      value={flyToCart}
    >
      <View
        ref={hostRef}
        collapsable={false}
        style={styles.container}
        onLayout={(event) => {
          const { width, height } =
            event.nativeEvent.layout;

          setHostSize((previous) => {
            if (
              previous.width === width &&
              previous.height === height
            ) {
              return previous;
            }

            return { width, height };
          });
        }}
      >
        {children}

        <View
          pointerEvents="none"
          style={styles.overlay}
        >
          {flight && (
            <Animated.View
              key={flight.id}
              style={[
                styles.flyingImage,
                {
                  width: flight.size,
                  height: flight.size,
                  opacity,
                  transform: [
                    { translateX },
                    { translateY },
                    { scale },
                  ],
                },
              ]}
            >
              <Image
                source={{
                  uri: flight.imageUrl,
                }}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
          )}
        </View>
      </View>
    </FlyToCartContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },

  flyingImage: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F2D8E3",
    elevation: 8,
  },

  image: {
    width: "100%",
    height: "100%",
  },
});
