import { emitter } from "@/services/eventEmitter";
import { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  useSharedValue,
} from "react-native-reanimated";

type FlasherProps = {
  children: React.ReactNode;
  eventName: string;
};

export default function Flasher({ children, eventName }: FlasherProps) {
  const backgroundColor = useSharedValue("white");

  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value,
  }));

  const triggerFlash = useCallback(() => {
    backgroundColor.value = withSequence(
      withTiming("rgba(0, 255, 0, 0.3)", { duration: 300 }),
      withTiming("white", { duration: 300 }),
    );
  }, []);

  useEffect(() => {
    emitter.on(eventName, triggerFlash);
    return () => {
      emitter.off(eventName, triggerFlash);
    };
  }, [eventName, triggerFlash]);

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
