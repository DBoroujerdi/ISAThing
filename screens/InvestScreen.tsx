import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import Toast from "react-native-toast-message";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { emitter } from "@/services/eventEmitter";

import LoadingView from "@/components/LoadingView";
import { backendService } from "@/services";

type InvestFormData = {
  amount: string;
  fundId: string;
};

export default function InvestScreen() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["invest"],
    mutationFn: ({ amount, fundId }: { amount: number; fundId: number }) =>
      backendService.makeAllocation(amount, fundId),
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["isa"] });
        emitter.emit("investment-allocated");
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

  const { data: funds, isPending } = useQuery({
    queryKey: ["funds"],
    queryFn: () => backendService.getFunds(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InvestFormData>({
    defaultValues: {
      amount: "",
      fundId: "",
    },
  });

  const onSubmit = async (data: InvestFormData) => {
    // const amountInPence = Math.round(parseFloat(data.amount) * 100);
    const amount = parseInt(data.amount);

    mutate({
      amount,
      fundId: Number(data.fundId),
    });
  };

  if (isPending) {
    return <LoadingView />;
  }

  const radioButtons: RadioButtonProps[] =
    funds?.map((fund) => ({
      id: fund.id.toString(),
      label: fund.name,
      value: fund.id.toString(),
    })) ?? [];

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
              placeholder="Enter investment amount (whole pounds only)"
              keyboardType="numeric"
              placeholderTextColor="#666"
              editable={!isPending}
            />
          )}
          name="amount"
        />
        {errors.amount && (
          <Text style={{ color: "red", marginBottom: 10 }}>
            {errors.amount.message}
          </Text>
        )}

        <Controller
          control={control}
          rules={{ required: "Please select a fund" }}
          name="fundId"
          render={({ field: { onChange, value } }) => (
            <RadioGroup
              radioButtons={radioButtons}
              onPress={onChange}
              selectedId={value}
              containerStyle={styles.radioGroup}
            />
          )}
        />
        {errors.fundId && (
          <Text style={styles.errorText}>{errors.fundId.message}</Text>
        )}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#4CAF50",
          padding: 10,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Send
        </Text>
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
  radioGroup: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "white",
  },
});
