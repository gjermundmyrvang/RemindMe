import React, { useEffect, useState, useRef } from "react";
import { View, FlatList } from "react-native";
import {
  AnimatedFAB,
  List,
  Checkbox,
  useTheme,
  Text,
  Button,
  Snackbar,
  Portal,
} from "react-native-paper";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Reminder } from "../types";
import {
  deleteReminder,
  getAllReminders,
  updateReminder,
} from "../storage/reminderStorage";

const priorityColors = {
  very_urgent: "#d32f2f",
  urgent: "#fbc02d",
  normal: "#388e3c",
};

type PendingDelete = {
  reminder: Reminder;
  timeoutId: NodeJS.Timeout;
};

export default function HomeScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<"all" | "urgent" | "sort">("sort");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarReminder, setSnackbarReminder] = useState<Reminder | null>(
    null
  );
  const pendingDeletes = useRef<Map<string, PendingDelete>>(new Map());
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  useEffect(() => {
    if (isFocused) loadReminders();
  }, [isFocused]);

  const loadReminders = async () => {
    const data = await getAllReminders();
    setReminders(data);
  };

  const handleToggleDone = async (id: string) => {
    const toDelete = reminders.find((r) => r.id === id);
    if (!toDelete) return;

    // Optimistically update UI
    setReminders((prev) => prev.filter((r) => r.id !== id));
    setSnackbarReminder(toDelete);
    setSnackbarVisible(true);

    const timeoutId = setTimeout(async () => {
      await deleteReminder(id);
      pendingDeletes.current.delete(id);
    }, 5000);

    pendingDeletes.current.set(id, { reminder: toDelete, timeoutId });
  };

  const undoDelete = async () => {
    if (!snackbarReminder) return;

    const pending = pendingDeletes.current.get(snackbarReminder.id);
    if (pending) {
      clearTimeout(pending.timeoutId);
      await updateReminder({ ...snackbarReminder, done: false });
      pendingDeletes.current.delete(snackbarReminder.id);
      loadReminders();
    }

    setSnackbarVisible(false);
    setSnackbarReminder(null);
  };

  const filteredReminders = reminders.filter((r) =>
    filter === "urgent"
      ? r.priority === "very_urgent" || r.priority === "urgent"
      : true
  );

  const sortedReminders =
    filter === "sort"
      ? filteredReminders
          .slice()
          .sort((b, a) => a.priority.localeCompare(b.priority))
      : filteredReminders;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 10,
        paddingTop: 50,
      }}
    >
      {/* Filter buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 16,
        }}
      >
        <Button
          mode={filter === "all" ? "contained" : "outlined"}
          onPress={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          mode={filter === "urgent" ? "contained" : "outlined"}
          onPress={() => setFilter("urgent")}
        >
          Urgent Only
        </Button>
        <Button
          mode={filter === "sort" ? "contained" : "outlined"}
          onPress={() => setFilter("sort")}
        >
          Sort by Priority
        </Button>
      </View>

      {sortedReminders.length === 0 ? (
        <Text style={{ marginTop: 32, textAlign: "center" }}>
          No reminders yet
        </Text>
      ) : (
        <FlatList
          data={sortedReminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.text}
              description={null}
              left={() => (
                <View
                  style={{
                    width: 8,
                    height: "100%",
                    backgroundColor:
                      priorityColors[item.priority] || colors.surfaceDisabled,
                    marginRight: 10,
                    borderRadius: 4,
                  }}
                />
              )}
              right={() => (
                <Checkbox
                  status="unchecked"
                  onPress={() => handleToggleDone(item.id)}
                  color={colors.primary}
                />
              )}
            />
          )}
        />
      )}

      <AnimatedFAB
        icon="plus"
        label="Add"
        extended={true}
        onPress={() => navigation.navigate("Add")}
        visible={true}
        animateFrom="right"
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
        }}
      />
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={5000}
          action={{
            label: "Undo",
            onPress: undoDelete,
          }}
        >
          Reminder completed
        </Snackbar>
      </Portal>
    </View>
  );
}
