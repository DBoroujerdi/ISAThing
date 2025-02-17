import { emitter } from "@/services/eventEmitter";
import { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  cancelAnimation,
} from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  eventName: string;
};

export default function SpinningWrapper({ children, eventName }: Props) {
  const rotation = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const stopSpin = useCallback(() => {
    cancelAnimation(rotation);
    rotation.value = 0;
    isAnimating.value = false;
  }, []);

  const triggerSpin = useCallback(() => {
    if (!isAnimating.value) {
      isAnimating.value = true;
      rotation.value = withTiming(360, { duration: 1000 }, (finished) => {
        if (finished) {
          rotation.value = 0;
          isAnimating.value = false;
        }
      });
    }
  }, []);

  useEffect(() => {
    emitter.on(eventName, triggerSpin);
    emitter.on(`${eventName}-stop`, stopSpin);

    return () => {
      emitter.off(eventName, triggerSpin);
      emitter.off(`${eventName}-stop`, stopSpin);
      stopSpin();
    };
  }, [eventName, triggerSpin, stopSpin]);

  return (
    <Animated.View style={[styles.card, animatedStyles]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
