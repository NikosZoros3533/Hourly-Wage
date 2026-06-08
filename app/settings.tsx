import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { typography } from "../src/theme/typography";
import { getHourlyRate, setHourlyRate } from "../src/db/settings";

export default function SettingsScreen() {
  const [rate, setRate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRate();
  }, []);

  const loadRate = async () => {
    const savedRate = await getHourlyRate();
    if (savedRate !== null) {
      setRate(savedRate.toString());
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate <= 0) {
      Alert.alert(
        "Invalid rate",
        "Please enter a valid hourly rate (e.g. 8.5)",
      );
      return;
    }
    await setHourlyRate(numericRate);
    Alert.alert("Saved", `Hourly rate set to €${numericRate.toFixed(2)}`);
    await loadRate(); // refresh displayed value
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hourly rate</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={rate}
          onChangeText={setRate}
          keyboardType="decimal-pad"
          placeholder="e.g. 8.5"
          placeholderTextColor={colors.textSecondary}
        />
        <Text style={styles.currency}>€/hour</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: typography.heading,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  currency: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  label: {
    fontSize: typography.body,
    color: colors.text,
  },
});
