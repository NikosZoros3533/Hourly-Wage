// src/components/SimpleWheelPicker.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

type SimpleWheelPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialValue: string;
};

export const WheelPicker: React.FC<SimpleWheelPickerProps> = ({
  visible,
  onClose,
  onSelect,
  initialValue,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = ["00", "30"];

  const [tempHour, setTempHour] = useState(initialValue.split(":")[0]);
  const [tempMinute, setTempMinute] = useState(initialValue.split(":")[1]);

  const hourFlatList = useRef<FlatList<string>>(null);
  const minuteFlatList = useRef<FlatList<string>>(null);

  const scrollToCenter = (
    ref: React.MutableRefObject<FlatList<string> | null>,
    index: number,
  ) => {
    ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  };

  useEffect(() => {
    if (visible) {
      const hourIndex = hours.indexOf(tempHour);
      const minuteIndex = minutes.indexOf(tempMinute);
      setTimeout(() => {
        scrollToCenter(hourFlatList, hourIndex);
        scrollToCenter(minuteFlatList, minuteIndex);
      }, 100);
    }
  }, [visible]);

  const handleHourPress = (hour: string) => {
    setTempHour(hour);
    scrollToCenter(hourFlatList, hours.indexOf(hour));
  };

  const handleMinutePress = (minute: string) => {
    setTempMinute(minute);
    scrollToCenter(minuteFlatList, minutes.indexOf(minute));
  };

  const handleConfirm = () => {
    onSelect(`${tempHour}:${tempMinute}`);
    onClose();
  };

  const renderHourItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.wheelItem, item === tempHour && styles.wheelItemSelected]}
      onPress={() => handleHourPress(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.wheelItemText,
          item === tempHour && styles.wheelItemTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderMinuteItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.wheelItem,
        item === tempMinute && styles.wheelItemSelected,
      ]}
      onPress={() => handleMinutePress(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.wheelItemText,
          item === tempMinute && styles.wheelItemTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.wheelOverlay}>
        <View style={styles.wheelContainer}>
          <Text style={styles.wheelTitle}>Select time</Text>
          <View style={styles.wheelPickerRow}>
            <View style={styles.wheelColumn}>
              <FlatList
                ref={hourFlatList}
                data={hours}
                renderItem={renderHourItem}
                keyExtractor={(item) => `hour-${item}`}
                showsVerticalScrollIndicator={false}
                getItemLayout={getItemLayout}
                style={{ height: PICKER_HEIGHT }}
              />
            </View>
            <Text style={styles.wheelColon}>:</Text>
            <View style={styles.wheelColumn}>
              <FlatList
                ref={minuteFlatList}
                data={minutes}
                renderItem={renderMinuteItem}
                keyExtractor={(item) => `min-${item}`}
                showsVerticalScrollIndicator={false}
                getItemLayout={getItemLayout}
                style={{ height: PICKER_HEIGHT }}
              />
            </View>
          </View>
          <View style={styles.wheelButtons}>
            <TouchableOpacity onPress={onClose} style={styles.wheelButton}>
              <Text style={styles.wheelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.wheelButton, styles.wheelButtonConfirm]}
            >
              <Text
                style={[styles.wheelButtonText, styles.wheelButtonTextConfirm]}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
