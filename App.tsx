import React from "react";
import { useColorScheme } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from "react-native-paper";
import Homescreen from "./screens/Homescreen";
import Reminderscreen from "./screens/Reminderscreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Reminders"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Reminders" component={Homescreen} />
          <Stack.Screen name="Add" component={Reminderscreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
