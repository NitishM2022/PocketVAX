/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Pressable,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePicker from "react-native-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Moment from "moment";
// import DateTimePicker from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Appearance } from "react-native-appearance";
import { DatePickerModal } from "../DatePickerModal";
var PushNotification = require("react-native-push-notification");
import DatePicker from "@react-native-community/datetimepicker";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  getImmunizationDetails,
  getImmunizationListAccordingToAge,
  getAgeGroup,
  getAge,
  monthDiff,
  updateRecommndedImmunizations,
} from "../helpers";

var { height, width } = Dimensions.get("window");

export default function ManageProfileScreen({ navigation }) {
  const goBack = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Pressable style={styles.button2} onPress={() => goBack()}>
          <View style={{ flexDirection: "row" }}>
            <Image
              style={styles.profileIcon}
              source={require("../images/left-arrow.png")}
            />
            <View>
              <Text style={styles.buttonText}>Go Back</Text>
            </View>
          </View>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#82A1A1",
  },
  topContainer: {
    flexDirection: "row",
  },
  verticalLine: {
    marginTop: width / 6 + 12,
    marginBottom: 12,
    marginRight: 8,
    width: 13,
    backgroundColor: "#81819f",
    zIndex: 1,
  },
  titleContainer: {
    justifyContent: "center", //Centered vertically
    flexDirection: "column",
  },
  sectionTitle: {
    marginTop: width / 6,
    fontSize: width / 5,
    color: "#85a2a1",
    fontFamily: "Montserrat_Regular",
  },
  sectionTitle2: {
    fontSize: width / 4,
    color: "#85a2a1",
    fontFamily: "Montserrat_Bold",
    fontWeight: "bold",
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
    paddingTop: width / 15,
    paddingRight: width / 8,

    width: width / 20,
    height: 20,
    resizeMode: "contain",
    //backgroundColor: "red",
  },
  button1: {
    // borderTopStartRadius: 40,
    // borderTopEndRadius: 40,
    padding: width / 11,
    backgroundColor: "#82A1A1",
  },
  button2: {
    padding: width / 11,
    backgroundColor: "#6F8A8A",
  },
  button3: {
    padding: width / 11,
    backgroundColor: "#4A5C5C",
  },
  buttonText: {
    color: "white",
    fontFamily: "Montserrat_Medium",
    fontSize: width / 20,
  },
});
