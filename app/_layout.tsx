import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../src/theme/colors";
import { useEffect } from "react";
import { initDatabase } from "@/src/db/database";

export default function Layout() {
  useEffect(() => {
    initDatabase();
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },

        headerTintColor: colors.text,

        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },

        tabBarActiveTintColor: colors.primary,

        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Open To Pay",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cash-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="time-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}