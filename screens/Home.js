import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  SafeAreaView,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

var { height, width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const navManageProfile = () => {
    navigation.navigate("ManageProfile"); // Replace 'Page1' with the name of your first page.
  };

  const navManageVaccination = () => {
    navigation.navigate("ManageVaccination"); // Replace 'Page2' with the name of your second page.
  };

  const navExportRecords = () => {
    navigation.navigate("ExportRecords"); // Replace 'Page3' with the name of your third page.
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.topContainer}>
          {/* <View style={styles.verticalLine} /> */}
          <View style={styles.titleContainer}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.sectionTitle}
            >
              Pocket
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.sectionTitle2}
            >
              VAX
            </Text>
          </View>
        </View>

        <View style={styles.middleSection}>
          <Image
            style={styles.tinyLogo}
            source={require("../images/anesthesia.png")}
          />
        </View>
      </SafeAreaView>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.button1} onPress={navManageProfile}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={styles.profileIcon}
              source={require("../images/profile.png")}
            />
            <View>
              <Text style={styles.buttonText}>Manage Profiles</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.button2} onPress={navManageVaccination}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={styles.profileIcon}
              source={require("../images/vaccine.png")}
            />
            <View>
              <Text style={styles.buttonText}>Manage Vaccinations</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.button3} onPress={navExportRecords}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={styles.profileIcon}
              source={require("../images/export.png")}
            />
            <View>
              <Text style={styles.buttonText}>Export Records</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topContainer: {
    flexDirection: "row",
  },
  verticalLine: {
    marginTop: width / 6 + 12,
    marginBottom: 12,
    marginRight: 8,
    width: 13,
    // backgroundColor: "#81819f",
    backgroundColor: "#82A1A1",
    zIndex: 1,
  },
  titleContainer: {
    justifyContent: "center", //Centered vertically
    alignItems: "center",
    flexDirection: "column",
  },
  sectionTitle: {
    marginTop: width / 6,
    fontSize: width / 6,
    // color: "#85a2a1",
    color: "black",
    fontFamily: "Montserrat-Regular",
  },
  sectionTitle2: {
    fontSize: width / 4,
    // color: "#85a2a1",
    color: "black",
    fontFamily: "Montserrat-Bold",
    lineHeight: width / 4,
  },
  middleSection: {
    justifyContent: "center",
    height: height / 4,
    width: width * 0.6,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  tinyLogo: {
    width: width + 200,
    height: height / 1.5,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
    width: "100%",
  },
  profileIcon: {
    height: 36,
    resizeMode: "contain",
    //backgroundColor: "red",
  },
  button1: {
    // borderTopStartRadius: 40,
    // borderTopEndRadius: 40,
    padding: width / 14,
    backgroundColor: "#82A1A1",
  },
  button2: {
    padding: width / 14,
    backgroundColor: "#6F8A8A",
  },
  button3: {
    padding: width / 14,
    backgroundColor: "#4A5C5C",
  },
  buttonText: {
    color: "white",
    fontFamily: "Montserrat-Thin",
    fontSize: width / 22,
    fontWeight: "thin",
  },
});
