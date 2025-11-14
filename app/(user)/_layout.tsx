import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(manager)" />
      <Stack.Screen name="(employee)" />
    </Stack>
  );
}