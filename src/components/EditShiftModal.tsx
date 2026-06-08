// src/components/EditShiftModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { calculateHours } from "../utils/calculateHours";
import { getHourlyRate } from "../db/settings";
import { updateShift } from "../db/shifts";
import { Shift } from "../types/shift";
import { WheelPicker } from "./WheelPicker";

type EditShiftModalProps = {
  visible: boolean;
  shift: Shift | null;
  onClose: () => void;
  onShiftUpdated: () => void;
};

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  visible,
  shift,
  onClose,
  onShiftUpdated,
}) => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);

  // Load shift data when modal opens
  useEffect(() => {
    if (visible && shift) {
      setDate(new Date(shift.date));
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
      loadHourlyRate();
    }
  }, [visible, shift]);

  const loadHourlyRate = async () => {
    const rate = await getHourlyRate();
    setHourlyRate(rate);
  };

  const hours = calculateHours(startTime, endTime);
  const money = hourlyRate ? hours * hourlyRate : 0;

  const handleSave = async () => {
    if (!hourlyRate || !shift) return;
    const dateStr = date.toISOString().split("T")[0];
    await updateShift(shift.id!, {
      date: dateStr,
      startTime,
      endTime,
      hours,
      money,
    });
    onShiftUpdated();
    onClose();
  };

  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (!shift) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Edit Shift</Text>

          <TouchableOpacity
            style={styles.field}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity
            style={styles.field}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.label}>Start time</Text>
            <Text style={styles.value}>{startTime}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.field}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.label}>End time</Text>
            <Text style={styles.value}>{endTime}</Text>
          </TouchableOpacity>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>Hours: {hours.toFixed(2)}</Text>
            <Text style={styles.summaryText}>Money: €{money.toFixed(2)}</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
            >
              <Text style={[styles.buttonText, styles.saveText]}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <WheelPicker
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        onSelect={setStartTime}
        initialValue={startTime}
      />
      <WheelPicker
        visible={showEndPicker}
        onClose={() => setShowEndPicker(false)}
        onSelect={setEndTime}
        initialValue={endTime}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.heading,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  field: {
    backgroundColor: colors.cardSecondary,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.body,
    color: colors.text,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  summaryText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.cardSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  saveText: {
    color: colors.text,
  },
});
