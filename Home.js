/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  ScrollView,
} from "react-native";
import ExportRecords from "./ExportRecords";
import ManageProfile from "./ManageProfile";
import ManageVaccination from "./ManageVaccination";
var isHidden = true;
var { height, width } = Dimensions.get("window");
var PushNotification = require("react-native-push-notification");
import AsyncStorage from "@react-native-async-storage/async-storage";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { updateRecommndedImmunizations } from "./helpers";

import Moment from "moment";

const screen = Dimensions.get("screen");

export default class Home extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.y_translate = new Animated.Value(0);
    this.state = {
      menu_expanded: false,
      ready: false,
      slideFromLeft: new Animated.Value(0),
      slideFromLeftTop: new Animated.Value(0),
      slideFromRight: new Animated.Value(0),
      animationBottomView: new Animated.Value(0),
      animation: new Animated.Value(screen.height * 0.36),
      animationVaccination: new Animated.Value(screen.height * 0.24),
      animationExportRecord: new Animated.Value(screen.height * 0.12),
      verticalLineForTitleVisible: false,
      verticalLineForDescriptionVisible: false,
    };
    this.handleNavigation = this.handleNavigation.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
    this.goBack = this.goBack.bind(this);
    this.updateProfileData = this.updateProfileData.bind(this);
    this.configureNotifications = this.configureNotifications.bind(this);
    this.configureNotifications();
  }

  componentDidMount() {
    this._start();
    setTimeout(
      function () {
        this.setState({
          verticalLineForTitleVisible: true,
        });
      }.bind(this),
      300
    );
    setTimeout(
      function () {
        this.setState({
          verticalLineForDescriptionVisible: true,
        });
      }.bind(this),
      300
    );
    updateRecommndedImmunizations();
  }

  configureNotifications() {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: (notification) => this.updateProfileData(notification),

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  }

  //this if actually important
  updateProfileData = async (notification) => {
    console.log("Notification:", notification);
    try {
      var profiles = await AsyncStorage.getItem("profiles");
      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }

      if (notification.userInfo == undefined) {
        notification.userInfo = notification.data;
      }
      var index = profiles.findIndex(
        (obj) => obj.profile_id === notification.userInfo.profile.profile_id
      );

      if (index !== -1) {
        var selectedProfile = profiles[index];
        var vaccineIndex = selectedProfile.vaccinations.findIndex(
          (obj) => obj.vaccination_id === notification.userInfo.vaccination_id
        );
        if (vaccineIndex !== -1) {
          selectedProfile.vaccinations[vaccineIndex].unread = false;
        }
        // else {
        //   for (var i = 0; i < selectedProfile.vaccinations.length; i++) {
        //     if (selectedProfile.vaccinations[i].type == 'recommended') {
        //       selectedProfile.vaccinations[i].unread = false;
        //     }
        //   }
        // }

        selectedProfile.unread = false;
        profiles[index] = selectedProfile;

        await AsyncStorage.setItem("profiles", JSON.stringify(profiles));

        this.props.navigation.navigate("SummaryRecords", {
          data: selectedProfile,
          index: index,
          from: "Home",
        });
      }
    } catch (e) {
      // saving error
      console.log("AsyncStorage error", e);
    }
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  };

  _start = () => {
    // return Animated.sequence([
    //   Animated.spring(this.state.animationBottomView, {
    //     toValue: 1,
    //     tension: 20,
    //     useNativeDriver: true
    //   }),
    //   Animated.timing(this.state.slideFromLeft, {
    //     toValue: 1,
    //     duration: 650,
    //     useNativeDriver: true
    //   }),
    //   Animated.timing(this.state.slideFromRight, {
    //     toValue: 1,
    //     duration: 800,
    //     useNativeDriver: true
    //   }),
    //   Animated.timing(this.state.slideFromLeftTop, {
    //     toValue: 1,
    //     duration: 650,
    //     useNativeDriver: true
    //   }),
    // ]).start();

    Animated.spring(this.state.animationBottomView, {
      toValue: 1,
      tension: 20,
      useNativeDriver: true,
    }).start();
    Animated.timing(this.state.slideFromLeft, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
    Animated.timing(this.state.slideFromRight, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
    Animated.timing(this.state.slideFromLeftTop, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  };

  handleNavigation = (type) => {
    let key =
      type == "profile"
        ? "animation"
        : type == "ManageVaccination"
        ? "animationVaccination"
        : "animationExportRecord";
    const initialValue =
      type == "profile"
        ? screen.height * 0.35
        : type == "ManageVaccination"
        ? screen.height * 0.24
        : screen.height * 0.14;
    const finalvalue = screen.height + 60;
    this.state[key].setValue(initialValue);
    Animated.timing(this.state[key], {
      toValue: finalvalue,
      useNativeDriver: false,
      duration: 300,
    }).start(() => {
      // this.props.navigation.push((type == 'profile') ? 'ManageProfile' : (type == 'ManageVaccination') ? 'ManageVaccination' : 'ExportRecords')
      // setTimeout(() => {
      //   this.hideMenu(type)
      // }, 500);

      // if (type == 'profile') {
      //   this.state['animationVaccination'].setValue(screen.height * 0.24);
      //     Animated.timing(
      //       this.state['animationVaccination'],
      //       {
      //         toValue: -100,
      //         useNativeDriver: false
      //       }
      //     ).start();
      //
      //     this.state['animationExportRecord'].setValue(-screen.height * 0.14);
      //       Animated.timing(
      //         this.state['animationExportRecord'],
      //         {
      //           toValue: -100,
      //           useNativeDriver: false
      //         }
      //       ).start();
      // }
      // else if (type == 'ManageVaccination') {
      //   this.state['animationExportRecord'].setValue(screen.height * 0.14);
      //     Animated.timing(
      //       this.state['animationExportRecord'],
      //       {
      //         toValue: -100,
      //         useNativeDriver: false
      //       }
      //     ).start();
      // }

      this.setState({ fullScreenView: type });
    });
  };

  hideMenu = (type) => {
    let key =
      type == "profile"
        ? "animation"
        : type == "ManageVaccination"
        ? "animationVaccination"
        : "animationExportRecord";
    const initialValue = screen.height * 1;
    const finalvalue =
      type == "profile"
        ? screen.height * 0.35
        : type == "ManageVaccination"
        ? screen.height * 0.24
        : screen.height * 0.12;
    this.state[key].setValue(initialValue);
    Animated.timing(this.state[key], {
      toValue: finalvalue,
      useNativeDriver: false,
      duration: 300,
    }).start();
  };

  _renderTopSection() {
    let { slideFromLeft } = this.state;

    return (
      <Animated.View style={[styles.topSection]}>
        <View style={styles.topSectionInnerView}>
          <View style={styles.viewToHideVerticalLine} />
          {this.state.verticalLineForTitleVisible && (
            <View
              style={[
                styles.verticalLine,
                { height: this.state.verticalLineHeight },
              ]}
            />
          )}
          <Animated.View
            style={{
              flex: 1,
              alignSelf: "center",
              transform: [
                {
                  translateX: slideFromLeft.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-600, 0],
                  }),
                },
              ],
            }}
            onLayout={(event) => {
              var { x, y, width, height } = event.nativeEvent.layout;
              this.setState({ verticalLineHeight: height });
            }}
          >
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
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  _renderInjectionImage() {
    let { slideFromRight } = this.state;

    return (
      <Animated.View
        style={[
          styles.middleSection,
          {
            transform: [
              {
                translateX: slideFromRight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [800, 50],
                }),
              },
            ],
          },
        ]}
      >
        <Image
          style={styles.tinyLogo}
          source={require("./images/anesthesia.png")}
        />
      </Animated.View>
    );
  }

  _renderDescription() {
    let { slideFromLeftTop } = this.state;

    return (
      <Animated.View style={[styles.bottomTextContainer]}>
        <View style={styles.subContainer}>
          <View
            style={{
              backgroundColor: "white",
              zIndex: 1,
              width: 70,
              marginLeft: -20,
            }}
          />
          {this.state.verticalLineForDescriptionVisible && (
            <View style={{ width: 13, backgroundColor: "#81819f" }} />
          )}
          <Animated.View
            style={{
              transform: [
                {
                  translateX: slideFromLeftTop.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-600, 0],
                  }),
                },
              ],
            }}
          >
            <ScrollView style={{ height: screen.height / 10 }}>
              <Text style={styles.description} ellipsizeMode={"tail"}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  _renderManageProfile() {
    return (
      <Animated.View
        style={[
          styles.bottomSection,
          {
            height: this.state.animation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.subContainer}
          onPress={() => this.handleNavigation("profile")}
        >
          <View style={styles.button}>
            <View style={{ flexDirection: "row" }}>
              <Image
                style={styles.profileIcon}
                source={require("./images/manage_profile.png")}
              />
              <View>
                <Text style={styles.buttonText}>Manage Profiles</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  _renderManageVaccination() {
    return (
      <Animated.View
        style={[
          styles.bottomVaccinationContainer,
          {
            height: this.state.animationVaccination,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.subContainer}
          onPress={() => this.handleNavigation("ManageVaccination")}
        >
          <View style={styles.button}>
            <View style={{ flexDirection: "row" }}>
              <Image
                style={styles.vaccinationIcon}
                source={require("./images/manage_vaccinations.png")}
              />
              <View>
                <Text style={[styles.buttonText, { marginTop: 5 }]}>
                  Manage Vaccinations
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  _renderExportRecords() {
    return (
      <Animated.View
        style={[
          styles.bottomExportContainer,
          {
            height: this.state.animationExportRecord,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.subContainer}
          onPress={() => this.handleNavigation("ExportRecords")}
        >
          <View style={styles.button}>
            <View style={{ flexDirection: "row" }}>
              <Image
                style={styles.profileIcon}
                source={require("./images/export_records.png")}
              />
              <View>
                <Text style={styles.buttonText}>Export Records</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  getView() {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            height: height - height * 0.3 - height * 0.1,
            justifyContent: "center",
          }}
        >
          {this._renderTopSection()}
          {this._renderInjectionImage()}
        </View>
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            width: width,
            height: "100%",
            zIndex: 3,
            transform: [
              {
                translateY: this.state.animationBottomView.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                }),
              },
            ],
          }}
        >
          {(this.state.fullScreenView == undefined ||
            this.state.fullScreenView == "profile") &&
            this._renderManageProfile()}
          {(this.state.fullScreenView == undefined ||
            this.state.fullScreenView == "ManageVaccination") &&
            this._renderManageVaccination()}
          {(this.state.fullScreenView == undefined ||
            this.state.fullScreenView == "ExportRecords") &&
            this._renderExportRecords()}
        </Animated.View>

        {this.state.fullScreenView == "profile" && (
          <View style={styles.fullView}>
            <ManageProfile goBack={this.goBack} navigationProps={this.props} />
          </View>
        )}
        {this.state.fullScreenView == "ManageVaccination" && (
          <View style={styles.fullView}>
            <ManageVaccination
              goBack={this.goBack}
              navigationProps={this.props}
            />
          </View>
        )}
        {this.state.fullScreenView == "ExportRecords" && (
          <View style={styles.fullView}>
            <ExportRecords goBack={this.goBack} navigationProps={this.props} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  goBack() {
    this.hideMenu(this.state.fullScreenView);
    this.setState({ fullScreenView: undefined });
  }

  render() {
    var statusBarColor = "transparent";
    if (this.state.fullScreenView == "profile") {
      statusBarColor = "#82A1A1";
    } else if (this.state.fullScreenView == "ManageVaccination") {
      statusBarColor = "#6F8A8A";
    } else if (this.state.fullScreenView == "ExportRecords") {
      statusBarColor = "#4A5C5C";
    }

    if (this.state.fullScreenView) {
      return (
        <SafeAreaView
          style={[styles.container, { backgroundColor: statusBarColor }]}
        >
          <StatusBar
            translucent={!this.state.fullScreenView}
            backgroundColor={statusBarColor}
            barStyle={"dark-content"}
          />
          {this.getView()}
        </SafeAreaView>
      );
    } else {
      return (
        <View style={styles.container}>
          <StatusBar
            translucent={!this.state.fullScreenView}
            backgroundColor={statusBarColor}
            barStyle={"dark-content"}
          />
          {this.getView()}
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  subContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  body: {
    backgroundColor: "white",
  },
  tinyLogo: {
    width: screen.width + 200,
    height: screen.height / 1.5,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: screen.width / 6,
    color: "#85a2a1",
    paddingLeft: 10,
    marginTop: -10,
    fontFamily: "Montserrat_Regular",
  },
  sectionTitle2: {
    fontSize: screen.width / 6,
    color: "#85a2a1",
    paddingLeft: 10,
    marginTop: 0,
    fontFamily: "Montserrat_Bold",
  },
  description: {
    fontSize: width / 25,
    color: "#81819f",
    paddingLeft: 10,
    fontFamily: "Montserrat_Italic",
    marginRight: 20,
  },
  topSection: {
    justifyContent: "center",
    height: 150,
    marginTop: 50,
    paddingHorizontal: 50,
    zIndex: 1,
  },
  middleSection: {
    justifyContent: "center",
    height: screen.height / 4,
    width: screen.width * 0.6,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  bottomTextContainer: {
    justifyContent: "center",
    height: 77,
    marginTop: 20,
    paddingHorizontal: 40,
  },
  bottomSection: {
    position: "absolute",
    backgroundColor: "#82A1A1",
    justifyContent: "center",
    marginTop: 0,
    paddingHorizontal: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: screen.height * 0.3,
    width: "100%",
    bottom: 0,
    zIndex: 5,
  },
  bottomVaccinationContainer: {
    position: "absolute",
    backgroundColor: "#6F8A8A",
    justifyContent: "center",
    marginTop: 30,
    paddingHorizontal: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: screen.height * 0.2,
    width: "100%",
    bottom: 0,
    zIndex: 5,
  },
  bottomExportContainer: {
    position: "absolute",
    backgroundColor: "#4A5C5C",
    justifyContent: "center",
    marginTop: 30,
    paddingHorizontal: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: screen.height * 0.1,
    width: "100%",
    bottom: 0,
    zIndex: 5,
  },
  button: {
    width: "100%",
    marginTop: screen.height / 23,
  },
  buttonText: {
    marginLeft: 15,
    color: "white",
    fontSize: screen.width / 20,
    fontFamily: "Montserrat_Medium",
  },
  topSectionInnerView: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  viewToHideVerticalLine: {
    backgroundColor: "white",
    zIndex: 2,
    width: 70,
    marginLeft: -50,
  },
  verticalLine: {
    width: 13,
    marginBottom: 10,
    alignSelf: "center",
    backgroundColor: "#81819f",
    zIndex: 1,
  },
  profileIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  vaccinationIcon: {
    width: 20,
    height: 30,
    resizeMode: "contain",
  },
  fullView: {
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 3,
  },
});
