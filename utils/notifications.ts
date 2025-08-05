import { Priority } from "../types";

export const getIntervalForPriority = (priority: Priority): number => {
  switch (priority) {
    case "very_urgent":
      return 60 * 60;
    case "urgent":
      return 12 * 60 * 60;
    default:
      return 48 * 60 * 60;
  }
};
