import { SafeAreaView, Text } from "react-native";

export default function LoadingView() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Loading..</Text>
    </SafeAreaView>
  );
}
