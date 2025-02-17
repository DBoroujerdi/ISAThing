import { backendService } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";

export default function SettingsScreen() {
  const queryClient = useQueryClient();

  const handleTruncateEvents = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete all investment events? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await backendService.truncateInvestmentEvents();
              queryClient.invalidateQueries({ queryKey: ["isa"] });
              Alert.alert("Success", "Your account has been reset to 0.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete investment events");
              console.error(error);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.warning}>Settings</Text>
      <TouchableOpacity onPress={handleTruncateEvents} style={styles.button}>
        <Text style={styles.buttonText}>Delete All Investment Events</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  content: {
    padding: 20,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "red",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  warning: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
