import { backendService } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import Toast from "react-native-toast-message";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { emitter } from "@/services/eventEmitter";

type DepositFormData = {
  amount: string;
};

export default function DepositScreen() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["deposit"],
    mutationFn: (amount: number) => backendService.makeDeposit(amount),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["isa"] });
        emitter.emit("deposit-created");
      }, 1000);
      router.back();
    },
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormData>({
    defaultValues: {
      amount: "",
    },
  });

  const onSubmit = async (data: DepositFormData) => {
    mutate(Number(data.amount));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Controller
          control={control}
          rules={{
            required: "Amount is required",
            pattern: {
              value: /^\d+$/,
              message: "Please enter a whole number (no decimals)",
            },
            min: {
              value: 1,
              message: "Amount must be at least £1",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: errors.amount ? "red" : "gray",
                },
              ]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter deposit amount (whole pounds only)"
              keyboardType="number-pad"
              placeholderTextColor="#666"
              editable={!isPending}
            />
          )}
          name="amount"
        />
        {errors.amount && (
          <Text style={styles.errorText}>{errors.amount.message}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    margin: 20,
    justifyContent: "space-between",
  },
  input: {
    height: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "white",
  },
  errorText: { color: "red", marginBottom: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
