import LoadingView from "@/components/LoadingView";
import { backendService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  Pressable,
  ViewProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { emitter } from "@/services/eventEmitter";
import Flasher from "@/components/animations/Flasher";
import Spinner from "@/components/animations/Spinner";

const formatCurrency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type CardProps = {
  value: string;
  hint?: string;
  title: string;
} & ViewProps;

function Card({ value, hint, title, ...props }: CardProps) {
  return (
    <View {...props}>
      <Text style={styles.cardTitle}>{title}</Text>
      {hint && <Text style={styles.cardHint}>{hint}</Text>}
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { data: isa } = useQuery({
    queryKey: ["isa"],
    queryFn: () => backendService.getISA(),
  });

  if (!isa) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 0.85 }}>
        <Text style={styles.title}>ISA Summary</Text>

        <Flasher eventName="investment-allocated">
          <Card
            title="Total ISA Value"
            value={formatCurrency.format(Math.floor(isa.totalValue))}
          />
        </Flasher>

        <Flasher eventName="deposit-created">
          <Card
            title="Available Funds"
            hint="available to invest/allocate"
            value={formatCurrency.format(Math.floor(isa.availableFunds))}
          />
        </Flasher>

        <Text style={styles.title}>Your Investments</Text>
        <FlatList
          data={isa.investments}
          ListEmptyComponent={
            <Text style={styles.cardValue}>
              {!isa.totalValue && !isa.availableFunds
                ? "Make a deposit to start investing"
                : "Start investing"}
            </Text>
          }
          renderItem={({ item, index }) => (
            <Card
              style={styles.card}
              title={item.fundName}
              value={formatCurrency.format(Math.floor(item.value))}
            />
          )}
          keyExtractor={(_item, index) => index.toString()}
        />
      </View>

      <View style={styles.buttonGroup}>
        <Link
          href="/invest"
          style={[styles.button, { backgroundColor: "blue" }]}
          asChild
        >
          <Pressable>
            <Text style={styles.buttonText}>Invest</Text>
          </Pressable>
        </Link>
        <Link
          href="/deposit"
          style={[styles.button, { backgroundColor: "green" }]}
          asChild
        >
          <Pressable>
            <Text style={styles.buttonText}>Make Deposit</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    margin: 20,
    marginBottom: 90,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 14,
    color: "#666",
  },
  buttonGroup: { flex: 0.15, gap: "10", justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
