import { Stack } from "expo-router";
import { PointsProvider } from "../providers/pointsProvider";

export default function RootLayout() {
  return (
    <PointsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PointsProvider>
  );
}
