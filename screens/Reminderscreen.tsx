import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import React, { useState } from "react";
import { View } from "react-native";
import {
  Button,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { saveReminder } from "../storage/reminderStorage";
import { Priority, Reminder } from "../types";
import { getIntervalForPriority } from "../utils/notifications";

export default function Reminderscreen() {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).slice(2);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission for notifications not granted!");
      return false;
    }
    return true;
  };

  const scheduleNotification = async (
    body: string,
    interval: number
  ): Promise<string> => {
    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: interval,
      repeats: true,
    } as const;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Reminder",
        body,
      },
      trigger,
    });

    return id;
  };

  const handleSave = async () => {
    console.log("Save pressed");
    const hasPermission = await requestNotificationPermission();
    console.log("Notification permission:", hasPermission);
    if (!hasPermission) return;

    const intervalInSeconds = getIntervalForPriority(priority);
    console.log("Scheduling notification with interval:", intervalInSeconds);

    const notificationId = await scheduleNotification(text, intervalInSeconds);
    console.log("Notification scheduled with ID:", notificationId);

    const reminder: Reminder = {
      id: generateId(),
      text,
      priority,
      createdAt: Date.now(),
      done: false,
      notificationId,
    };
    console.log("test");

    await saveReminder(reminder);
    console.log("Reminder saved");

    navigation.goBack();
  };

  return (
    <View
      style={{
        padding: 16,
        paddingTop: 50,
        flex: 1,
        gap: 16,
        backgroundColor: colors.background,
      }}
    >
      <TextInput
        label="Reminder"
        value={text}
        onChangeText={setText}
        mode="outlined"
      />

      <Text variant="labelLarge">Priority</Text>
      <RadioButton.Group
        onValueChange={(value) => setPriority(value as Priority)}
        value={priority}
      >
        <RadioButton.Item label="Normal" value="normal" />
        <RadioButton.Item label="Urgent" value="urgent" />
        <RadioButton.Item label="Very Urgent" value="very_urgent" />
      </RadioButton.Group>

      <Button mode="contained" onPress={handleSave} disabled={!text.trim()}>
        Save
      </Button>
    </View>
  );
}
