// src/components/AddShiftModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { calculateHours } from "../utils/calculateHours";
import { getHourlyRate } from "../db/settings";
import { addShift } from "../db/shifts";
import { WheelPicker } from "./WheelPicker";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// ---------- Main AddShiftModal ----------
type AddShiftModalProps = {
  visible: boolean;
  onClose: () => void;
  onShiftAdded: () => void;
};

export const AddShiftModal: React.FC<AddShiftModalProps> = ({
  visible,
  onClose,
  onShiftAdded,
}) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("00:00");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      loadHourlyRate();
    }
  }, [visible]);

  const loadHourlyRate = async () => {
    const rate = await getHourlyRate();
    setHourlyRate(rate);
  };

  const hours = calculateHours(startTime, endTime);
  const money = hourlyRate ? hours * hourlyRate : 0;

  const handleSave = async () => {
    if (!hourlyRate) {
      alert("Please set hourly rate in Settings first");
      return;
    }
    const dateStr = date.toISOString().split("T")[0];
    await addShift({
      date: dateStr,
      startTime,
      endTime,
      hours,
      money,
    });
    onShiftAdded();
    onClose();
    // Reset to defaults
    setDate(new Date());
    setStartTime("09:00");
    setEndTime("17:00");
  };

  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Add Shift</Text>

          {/* Date picker */}
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

          {/* Start time field */}
          <TouchableOpacity
            style={styles.field}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.label}>Start time</Text>
            <Text style={styles.value}>{startTime}</Text>
          </TouchableOpacity>

          {/* End time field */}
          <TouchableOpacity
            style={styles.field}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.label}>End time</Text>
            <Text style={styles.value}>{endTime}</Text>
          </TouchableOpacity>

          {/* Summary */}
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
              <Text style={[styles.buttonText, styles.saveText]}>Save</Text>
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
  // Simple wheel picker styles
  wheelOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  wheelContainer: {
    width: "80%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    position: "relative",
  },
  wheelTitle: {
    fontSize: typography.heading,
    color: colors.text,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  wheelPickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: PICKER_HEIGHT,
    marginVertical: spacing.md,
  },
  wheelColumn: {
    width: 80,
    height: PICKER_HEIGHT,
    overflow: "hidden",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelItemSelected: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  wheelItemText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  wheelItemTextSelected: {
    color: colors.text,
    fontWeight: "600",
  },
  wheelColon: {
    fontSize: typography.heading,
    color: colors.text,
    marginHorizontal: spacing.sm,
  },
  wheelButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  wheelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.cardSecondary,
  },
  wheelButtonConfirm: {
    backgroundColor: colors.primary,
  },
  wheelButtonText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  wheelButtonTextConfirm: {
    color: colors.text,
    fontWeight: "600",
  },
});
