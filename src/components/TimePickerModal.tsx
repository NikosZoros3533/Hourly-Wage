import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type TimePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialValue?: string;
};

const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      times.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      );
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  initialValue,
}) => {
  const [selected, setSelected] = useState(initialValue || TIME_OPTIONS[0]);

  const handleConfirm = () => {
    onSelect(selected);
    onClose();
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.item, item === selected && styles.selectedItem]}
      onPress={() => setSelected(item)}
    >
      <Text style={[styles.itemText, item === selected && styles.selectedText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select time</Text>
          <FlatList
            data={TIME_OPTIONS}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.button, styles.confirmButton]}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    width: "80%",
    maxHeight: "70%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
  },
  title: {
    fontSize: typography.heading,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  list: {
    flexGrow: 0,
  },
  item: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: colors.primary,
  },
  itemText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  selectedText: {
    color: colors.text,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  confirmText: {
    color: colors.text,
    fontWeight: "600",
  },
});
