import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { typography } from "../src/theme/typography";
import { deleteShift, getUnpaidShifts, markAllAsPaid } from "../src/db/shifts";
import { getHourlyRate, setHourlyRate } from "../src/db/settings";
import { AddShiftModal } from "../src/components/AddShiftModal";
import { Shift } from "../src/types/shift";
import { Ionicons } from "@expo/vector-icons";
import { EditShiftModal } from "@/src/components/EditShiftModal";
import { formatDisplayDate } from "@/src/utils/formatDate";

export default function OpenToPayScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [tempRate, setTempRate] = useState("");
  const [hourlyRate, setHourlyRateState] = useState<number | null>(null);

  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleDelete = (id: number) => {
    Alert.alert("Delete shift", "Are you sure you want to delete this shift?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteShift(id);
          await loadShifts();
        },
      },
    ]);
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setEditModalVisible(true);
  };

  const loadShifts = async () => {
    const unpaid = await getUnpaidShifts();
    setShifts(unpaid);
  };

  const checkHourlyRate = async () => {
    const rate = await getHourlyRate();
    setHourlyRateState(rate);
    if (rate === null) {
      setRateModalVisible(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadShifts();
      checkHourlyRate();
    }, []),
  );

  const totalHours = shifts.reduce((sum, s) => sum + s.hours, 0);
  const totalMoney = shifts.reduce((sum, s) => sum + s.money, 0);

  const handleGotPaid = async () => {
    const groupId = await markAllAsPaid();
    Alert.alert("Paid", `Payment recorded (group #${groupId})`);
    loadShifts();
  };

  const handleSaveRate = async () => {
    const rate = parseFloat(tempRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert("Invalid", "Please enter a valid hourly rate");
      return;
    }
    await setHourlyRate(rate);
    setHourlyRateState(rate);
    setRateModalVisible(false);
    setTempRate("");
  };

  const renderShift = ({ item }: { item: Shift }) => (
    <View style={styles.shiftCard}>
      <View style={styles.shiftContent}>
        <View style={styles.shiftInfo}>
          <Text style={styles.shiftDate}>{formatDisplayDate(item.date)}</Text>
          <Text style={styles.shiftTime}>
            {item.startTime} → {item.endTime}
          </Text>
          <View style={styles.shiftFooter}>
            <Text style={styles.shiftHours}>{item.hours.toFixed(2)} hrs</Text>
            <Text style={styles.shiftMoney}>€{item.money.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.iconButton}
          >
            <Ionicons
              name="pencil-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id!)}
            style={styles.iconButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.totalsCard}>
        <Text style={styles.totalsLabel}>Unpaid total</Text>
        <Text style={styles.totalsHours}>{totalHours.toFixed(2)} hrs</Text>
        <Text style={styles.totalsMoney}>€{totalMoney.toFixed(2)}</Text>
      </View>

      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={renderShift}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No unpaid shifts</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => setModalVisible(true)}
          disabled={hourlyRate === null}
        >
          <Text style={styles.buttonText}>+ Add Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.paidButton,
            shifts.length === 0 && styles.disabledButton,
          ]}
          onPress={handleGotPaid}
          disabled={shifts.length === 0}
        >
          <Text style={styles.buttonText}>$ Got Paid</Text>
        </TouchableOpacity>{" "}
      </View>

      <AddShiftModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onShiftAdded={loadShifts}
      />

      {/* Force set hourly rate on first launch */}
      <Modal visible={rateModalVisible} transparent animationType="fade">
        <View style={styles.rateOverlay}>
          <View style={styles.rateModal}>
            <Text style={styles.rateTitle}>Welcome to OloiOlo</Text>
            <Text style={styles.rateSubtitle}>
              Please enter your hourly pay rate
            </Text>
            <TextInput
              style={styles.rateInput}
              placeholder="e.g. 8.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={tempRate}
              onChangeText={setTempRate}
              autoFocus
            />
            <TouchableOpacity
              style={styles.rateButton}
              onPress={handleSaveRate}
            >
              <Text style={styles.rateButtonText}>Start using app</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <EditShiftModal
        visible={editModalVisible}
        shift={editingShift}
        onClose={() => setEditModalVisible(false)}
        onShiftUpdated={loadShifts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  totalsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  totalsLabel: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  totalsHours: {
    fontSize: typography.title,
    color: colors.text,
    fontWeight: "700",
  },
  totalsMoney: {
    fontSize: typography.heading,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  listContent: {
    flexGrow: 1,
  },
  shiftCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  shiftDate: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  shiftTime: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginVertical: spacing.xs,
  },
  shiftFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shiftHours: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
  shiftMoney: {
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: colors.cardSecondary,
  },
  paidButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  rateOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  rateModal: {
    width: "80%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
  },
  rateTitle: {
    fontSize: typography.title,
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  rateSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  rateInput: {
    width: "100%",
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: typography.heading,
    padding: spacing.md,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  rateButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  rateButtonText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  shiftContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shiftInfo: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginLeft: spacing.md,
  },
  iconButton: {
    padding: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
