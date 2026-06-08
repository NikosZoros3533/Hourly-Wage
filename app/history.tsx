import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { colors } from "../src/theme/colors";
import { spacing } from "../src/theme/spacing";
import { typography } from "../src/theme/typography";
import { getHistory, clearHistory } from "../src/db/shifts";
import { Shift } from "../src/types/shift";
import { formatDisplayDate } from "@/src/utils/formatDate";

type PaymentGroup = {
  groupId: number;
  paymentDate: string;
  shifts: Shift[];
  totalHours: number;
  totalMoney: number;
};

export default function HistoryScreen() {
  const [groups, setGroups] = useState<PaymentGroup[]>([]);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  const loadHistory = async () => {
    const history = await getHistory();
    setGroups(history);
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  const handleClearAll = () => {
    Alert.alert(
      "Clear all history",
      "This will permanently delete all paid shifts. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            await loadHistory();
          },
        },
      ],
    );
  };

  const toggleExpand = (groupId: number) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const renderShift = ({ item }: { item: Shift }) => (
    <View style={styles.shiftItem}>
      <Text style={styles.shiftDate}>{formatDisplayDate(item.date)}</Text>
      <Text style={styles.shiftTime}>
        {item.startTime} → {item.endTime}
      </Text>
      <View style={styles.shiftFooter}>
        <Text style={styles.shiftHours}>{item.hours.toFixed(2)} hrs</Text>
        <Text style={styles.shiftMoney}>€{item.money.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderGroup = ({ item }: { item: PaymentGroup }) => {
    const isExpanded = expandedGroupId === item.groupId;
    return (
      <View style={styles.groupCard}>
        <TouchableOpacity
          style={styles.groupHeader}
          onPress={() => toggleExpand(item.groupId)}
          activeOpacity={0.7}
        >
          <View style={styles.groupInfo}>
            <Text style={styles.paymentDate}>{item.paymentDate}</Text>
            <Text style={styles.groupTotals}>
              {item.totalHours.toFixed(2)} hrs • €{item.totalMoney.toFixed(2)}
            </Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.shiftsList}>
            <FlatList
              data={item.shifts}
              keyExtractor={(shift) => shift.id!.toString()}
              renderItem={renderShift}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.groupId.toString()}
        renderItem={renderGroup}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payment history yet</Text>
            <Text style={styles.emptySubtext}>
              Shifts you mark as Got Paid will appear here
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {groups.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Text style={styles.clearButtonText}>Clear all history</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  groupTotals: {
    fontSize: typography.small,
    color: colors.primary,
  },
  expandIcon: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  shiftsList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  shiftItem: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  shiftDate: {
    fontSize: typography.small,
    color: colors.text,
    fontWeight: "500",
  },
  shiftTime: {
    fontSize: typography.small,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  shiftFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.small,
    color: colors.textSecondary,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacing.md,
  },
  clearButtonText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
  },
});
