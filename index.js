/**
 * @format
 */
import * as React from "react";
import { AppRegistry } from "react-native";
// import App from './App';
import Home from "./screens/Home";
import ManageProfile from "./screens/ManageProfile";
import ManageVaccination from "./ManageVaccination";
import ExportRecords from "./ExportRecords";
import SummaryRecords from "./SummaryRecords";
import { name as appName } from "./app.json";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ManageProfile" component={ManageProfile} />
        <Stack.Screen name="ManageVaccination" component={ManageVaccination} />
        <Stack.Screen name="ExportRecords" component={ExportRecords} />
        <Stack.Screen name="SummaryRecords" component={SummaryRecords} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent(appName, () => App);
console.disableYellowBox = true;
