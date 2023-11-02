/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
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
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import ImagePicker from 'react-native-image-picker';
// import DateTimePickerModal from "react-native-modal-datetime-picker";
// import Moment from 'moment';
// import DateTimePicker from "react-native-modal-datetime-picker";
import { getAge } from "./helpers";

var { height, width } = Dimensions.get("window");

export default class ExportRecords extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      profiles: [],
      animatedValue: new Animated.Value(0),
    };
    this.delayValue = 500;
    this.renderProfileItem = this.renderProfileItem.bind(this);
    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    this.getData();
    Animated.spring(this.state.animatedValue, {
      toValue: 1,
      tension: 20,
      useNativeDriver: true,
    }).start();
  }

  getData = async () => {
    try {
      var profiles = await AsyncStorage.getItem("profiles");

      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }

      var todaysDate = new Date().getTime();

      for (var i = 0; i < profiles.length; i++) {
        var selectedProfile = profiles[i];
        for (var j = 0; j < selectedProfile.vaccinations.length; j++) {
          if (selectedProfile.vaccinations[j].unread == undefined) {
            for (
              var k = 0;
              k < selectedProfile.vaccinations[j].notificationTimeList.length;
              k++
            ) {
              if (
                todaysDate >=
                new Date(
                  selectedProfile.vaccinations[j].notificationTimeList[k]
                ).getTime()
              ) {
                selectedProfile.vaccinations[j].unread = true;
                selectedProfile.vaccinations[j].notificationDate =
                  selectedProfile.vaccinations[j].notificationTimeList[k];
                selectedProfile.unread = true;
              }
            }
          }
        }
        profiles[i] = selectedProfile;
      }

      this.setState({ profiles: profiles });
      console.log("profiles", profiles);

      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));
    } catch (e) {
      // error reading value
      console.log("getData error", e);
    }
  };

  renderProfileItem({ item, index }) {
    this.delayValue = this.delayValue + 500;
    const translateX = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [this.delayValue, 1],
    });
    // var today = new Date();
    // var olday = new Date(item.birthDate);
    return (
      <Animated.View>
        <TouchableOpacity
          style={[styles.profileRow, { transform: [{ translateX }] }]}
          onPress={() => {
            this.props.navigationProps.navigation.navigate("SummaryRecords", {
              data: item,
              index: index,
              getData: this.getData,
              from: "ExportRecords",
            });
          }}
        >
          <Image
            style={styles.profileImage}
            source={
              item.profileImage == ""
                ? require("./images/user.png")
                : { uri: item.profileImage }
            }
          />
          <View style={styles.nameView}>
            <View style={styles.nameInnerView}>
              <Text
                style={[styles.nameText, { fontFamily: "Montserrat_Bold" }]}
              >
                {item.firstName + " " + item.lastName}
              </Text>
              <Text
                style={[styles.ageText, { fontFamily: "Montserrat_Medium" }]}
              >
                {getAge(new Date(item.birthDate))}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              {item.unread && <View style={styles.unreadView}></View>}
              <Image
                style={styles.plus}
                source={require("./images/back.png")}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Image
            source={require("./images/anesthesia_export_records.png")}
            style={styles.anesthesiaImage}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                this.props.goBack();
              }}
            >
              <View style={styles.headerView}>
                <Image
                  style={styles.back}
                  source={require("./images/back.png")}
                />
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.pocketText,
                      { fontFamily: "Montserrat_Medium" },
                    ]}
                  >
                    Pocket
                  </Text>
                  <Text
                    style={[styles.vaxText, { fontFamily: "Montserrat_Bold" }]}
                  >
                    Vax
                  </Text>
                </View>
                <View style={styles.verticalLine}></View>
                <Image
                  style={styles.exportIcon}
                  source={require("./images/export_records.png")}
                />
              </View>
            </TouchableOpacity>
            <Text
              style={[styles.exportTitle, { fontFamily: "Montserrat_Bold" }]}
            >
              Export Records
            </Text>
          </View>
          {this.state.profiles.length > 0 ? (
            <FlatList
              style={{ marginTop: 30 }}
              data={this.state.profiles}
              renderItem={this.renderProfileItem}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={styles.noUserView}>
              <Text
                style={[styles.noUserText, { fontFamily: "Montserrat_Bold" }]}
              >
                No User Available
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4A5C5C",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
  },
  plus: {
    width: 23,
    height: 23,
    marginRight: 20,
    resizeMode: "contain",
    transform: [{ rotate: "180deg" }],
  },
  homeButton: {
    marginTop: 5,
    alignSelf: "flex-start",
  },
  profileRow: {
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    marginTop: 20,
    marginLeft: 35,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF66",
  },
  profileImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    margin: 10,
  },
  nameView: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  nameInnerView: {
    marginRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
    flex: 1,
  },
  nameText: {
    color: "white",
    fontSize: width / 25,
  },
  ageText: {
    marginTop: 10,
    color: "white",
    fontSize: width / 35,
  },
  unreadView: {
    backgroundColor: "rgb(253, 160, 55)",
    height: 12,
    width: 12,
    borderRadius: 6,
    alignSelf: "center",
  },
  anesthesiaImage: {
    position: "absolute",
    height: height / 1.5,
    width: width,
    bottom: -10,
    left: width / 3.3,
  },
  headerView: {
    flexDirection: "row",
    alignItems: "center",
  },
  back: {
    resizeMode: "contain",
    marginLeft: 5,
    marginTop: 0,
    width: 22,
    height: 22,
  },
  pocketText: {
    color: "white",
    fontSize: width / 32,
    marginLeft: 5,
  },
  vaxText: {
    color: "white",
    fontSize: width / 32,
  },
  verticalLine: {
    marginLeft: 10,
    height: 22,
    width: 3,
    backgroundColor: "white",
  },
  exportIcon: {
    resizeMode: "contain",
    marginLeft: 10,
    width: 22,
    height: 22,
  },
  exportTitle: {
    marginLeft: 10,
    marginTop: 5,
    color: "white",
    fontSize: width / 22,
  },
  noUserView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noUserText: {
    fontSize: width / 22,
    color: "white",
    textAlign: "center",
  },
});
