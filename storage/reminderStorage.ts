import AsyncStorage from "@react-native-async-storage/async-storage";
import { Reminder } from "../types";

const STORAGE_KEY = "reminders";

export const getAllReminders = async (): Promise<Reminder[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load reminders:", error);
    return [];
  }
};

export const saveReminder = async (reminder: Reminder): Promise<void> => {
  try {
    const reminders = await getAllReminders();
    reminders.push(reminder);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error("Failed to save reminder:", error);
  }
};

export const updateReminder = async (updated: Reminder): Promise<void> => {
  try {
    const reminders = await getAllReminders();
    const newList = reminders.map((r) => (r.id === updated.id ? updated : r));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  } catch (error) {
    console.error("Failed to update reminder:", error);
  }
};

export const deleteReminder = async (id: string): Promise<void> => {
  try {
    const reminders = await getAllReminders();
    const newList = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  } catch (error) {
    console.error("Failed to delete reminder:", error);
  }
};

export const toggleReminderDone = async (
  id: string
): Promise<Reminder | null> => {
  try {
    const reminders = await getAllReminders();
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, done: !r.done } : r
    );
    const changed = updated.find((r) => r.id === id) || null;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return changed;
  } catch (error) {
    console.error("Failed to toggle reminder:", error);
    return null;
  }
};

export const clearAllReminders = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear reminders:", error);
  }
};
