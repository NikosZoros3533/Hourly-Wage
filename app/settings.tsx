import { View, Text, StyleSheet } from "react-native";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,

    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: colors.text,

    fontSize: typography.title,

    fontWeight: "700",
  },
});