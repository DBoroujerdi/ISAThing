import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, SafeAreaView } from "react-native";
import "react-native-reanimated";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import migrations from "@/drizzle/migrations";
import { useColorScheme } from "@/hooks/useColorScheme";
import { seedDatabase } from "@/db/seed";
import { db } from "@/db";
import { Feather } from "@expo/vector-icons";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { error, success } = useMigrations(db, migrations);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (success) {
      seedDatabase(db);
    }
  }, [success]);

  if (!loaded) {
    return null;
  }

  if (error) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          margin: 10,
        }}
      >
        <Text>Migration error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  if (!success) {
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        margin: 10,
      }}
    >
      <Text>Migration in progress..</Text>
    </SafeAreaView>;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{
              headerLeft: () => (
                <Feather
                  name="chevron-left"
                  size={35}
                  onPress={() => router.back()}
                  color="black"
                />
              ),
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen
              name="invest"
              options={{
                title: "Invest",
                headerTitleStyle: {
                  fontFamily: "SpaceMono",
                  fontSize: 20,
                  fontWeight: "bold",
                },
              }}
            />
            <Stack.Screen
              name="deposit"
              options={{
                title: "Deposit",
                headerTitleStyle: {
                  fontFamily: "SpaceMono",
                  fontSize: 20,
                  fontWeight: "bold",
                },
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>

      <Toast />
    </>
  );
}
