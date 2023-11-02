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
  TextInput,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePicker from "react-native-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Moment from "moment";
// import DateTimePicker from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Appearance } from "react-native-appearance";
import { DatePickerModal } from "./DatePickerModal";
var PushNotification = require("react-native-push-notification");
import DatePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

import {
  getImmunizationDetails,
  getImmunizationListAccordingToAge,
  getAgeGroup,
  getAge,
  monthDiff,
  updateRecommndedImmunizations,
} from "./helpers";

var { height, width } = Dimensions.get("window");

export default class ManageProfile extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      addProfileModal: false,
      profiles: [],
      profileImage: "",
      firstName: "",
      lastName: "",
      birthDate: Moment(new Date()).format("MMM DD, YYYY"),
      selectedGender: "",
      isDateTimePickerVisible: false,
      animatedValue: new Animated.Value(0),
      processing: false,
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

  storeData = async () => {
    try {
      var profiles = await AsyncStorage.getItem("profiles");
      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }

      if (this.state.indexOfEdit !== undefined) {
        var selectedProfile = profiles[this.state.indexOfEdit];
        selectedProfile.profileImage = this.state.profileImage;
        selectedProfile.firstName = this.state.firstName;
        selectedProfile.lastName = this.state.lastName;
        selectedProfile.birthDate = this.state.birthDate;
        selectedProfile.gender = this.state.selectedGender;
        selectedProfile.age = getAge(new Date(this.state.birthDate));
        profiles[this.state.indexOfEdit] = selectedProfile;
      } else {
        var today = new Date();
        var olday = new Date(this.state.birthDate);
        var ageInYear = Number(
          (today.getTime() - olday.getTime()) / 31536000000
        ).toFixed(0);
        var recommendedUpcomingImmunizations =
          getImmunizationListAccordingToAge(ageInYear);
        var upcomingImmunizationList = [];

        for (var i = 0; i < recommendedUpcomingImmunizations.length; i++) {
          var details = getImmunizationDetails(
            recommendedUpcomingImmunizations[i].label
          );
          var todaysDate = new Date();
          var ageGroup = getAgeGroup(ageInYear);
          var yearDifference =
            ageGroup.split("-")[1] == undefined
              ? 90 - ageInYear
              : ageGroup.split("-")[1] - ageInYear;
          var dateAfterYears = new Date();
          dateAfterYears.setFullYear(
            todaysDate.getFullYear() +
              (yearDifference >= 0 ? yearDifference : 0)
          );
          var timeDifference = monthDiff(todaysDate, new Date(dateAfterYears));
          var notificationTimeList = [];
          var notificationIdList = [];
          var vaccination_id =
            upcomingImmunizationList.length == 0
              ? 1
              : upcomingImmunizationList[upcomingImmunizationList.length - 1]
                  .vaccination_id + 1;
          var dateAfterMonths = new Date();
          for (var j = 0; j < Math.floor(timeDifference / 6) + 1; j++) {
            notificationTimeList.push(dateAfterMonths);
            notificationIdList.push(
              (profiles.length > 0
                ? profiles[profiles.length - 1].profile_id + 1
                : 1) +
                "" +
                vaccination_id +
                "" +
                i +
                "" +
                j
            );
            dateAfterMonths = new Date(
              todaysDate.setMonth(todaysDate.getMonth() + 6)
            );
          }

          upcomingImmunizationList.push({
            vaccination_id: vaccination_id,
            date: [
              Moment(
                new Date().setFullYear(new Date().getFullYear() + 100)
              ).format("MMM DD, YYYY"),
            ],
            immunization: recommendedUpcomingImmunizations[i].label,
            typeOfImmunization: "Dose 1",
            recommendedTime: details.recommendedTime,
            catchUpTime: details.catchUpTime,
            description: details.description,
            sideEffects: details.sideEffects,
            recommendedTimeForSelectedImmunzation: details.recommendedTime,
            catchUpTimeForSelectedImmunzation: details.catchUpTime,
            descriptionForSelectedImmunzation: details.description,
            sideEffectsForSelectedImmunzation: details.sideEffects,
            minimumAgeForSelectedImmunzation: details.minimumAge,
            currentAge: [getAge(new Date(this.state.birthDate))],
            notificationTimeList: notificationTimeList,
            notificationIdList: notificationIdList,
            creationDate: new Date(),
            type: "recommended",
          });
        }

        profiles.push({
          profile_id:
            profiles.length > 0
              ? profiles[profiles.length - 1].profile_id + 1
              : 1,
          profileImage: this.state.profileImage,
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          birthDate: this.state.birthDate,
          gender: this.state.selectedGender,
          age: getAge(new Date(this.state.birthDate)),
          ageGroup: getAgeGroup(ageInYear),
          vaccinations: upcomingImmunizationList,
        });

        for (var k = 0; k < upcomingImmunizationList.length; k++) {
          var todaysDate = new Date();
          var ageGroup = getAgeGroup(ageInYear);
          var yearDifference =
            ageGroup.split("-")[1] == undefined
              ? 90 - ageInYear
              : ageGroup.split("-")[1] - ageInYear;
          var dateAfterYears = new Date();
          dateAfterYears.setFullYear(
            todaysDate.getFullYear() +
              (yearDifference >= 0 ? yearDifference : 0)
          );
          var timeDifference = monthDiff(todaysDate, new Date(dateAfterYears));
          var dateAfterMonths = new Date();
          for (var l = 0; l < Math.floor(timeDifference / 6) + 1; l++) {
            // console.log('dateAfterMonthsdfds', dateAfterMonths, profiles[profiles.length - 1].profile_id + '' + upcomingImmunizationList[k].vaccination_id + "" + k + "" + l);
            PushNotification.localNotificationSchedule({
              id:
                profiles[profiles.length - 1].profile_id +
                "" +
                upcomingImmunizationList[k].vaccination_id +
                "" +
                k +
                "" +
                l,
              title:
                "Recommended Immunization for " +
                profiles[profiles.length - 1].firstName +
                " " +
                profiles[profiles.length - 1].lastName,
              message: upcomingImmunizationList[k].immunization,
              vaccination_id: upcomingImmunizationList[k].vaccination_id,
              date: dateAfterMonths,
              userInfo: {
                id:
                  profiles[profiles.length - 1].profile_id +
                  "" +
                  upcomingImmunizationList[k].vaccination_id +
                  "" +
                  k +
                  "" +
                  l,
                profile: profiles[profiles.length - 1],
                vaccination_id: upcomingImmunizationList[k].vaccination_id,
              },
            });
            dateAfterMonths = new Date(
              todaysDate.setMonth(todaysDate.getMonth() + 6)
            );
          }
        }

        // var todaysDate = new Date();
        // var ageGroup = getAgeGroup(ageInYear);
        // var yearDifference = (ageGroup.split('-')[1] == undefined) ? 90 - ageInYear : ageGroup.split('-')[1] - ageInYear;
        // var dateAfterYears = new Date();
        // dateAfterYears.setFullYear(todaysDate.getFullYear() + (yearDifference >= 0 ? yearDifference : 0))
        // var timeDifference = monthDiff(todaysDate, new Date(dateAfterYears));
        // var dateAfterMonths = new Date(todaysDate.setSeconds(todaysDate.getSeconds() + 30));
        // for (var l = 0; l < Math.floor(timeDifference/6) + 1; l++) {
        //   console.log('dateAfterMonthsdfds', dateAfterMonths);
        //   PushNotification.localNotificationSchedule({
        //     id: profiles[profiles.length - 1].profile_id + '' + 100 + l,
        //     title: "Recommended Immunization for " + profiles[profiles.length - 1].firstName + " " + profiles[profiles.length - 1].lastName,
        //     message: "Some immunizations are recommended for " + profiles[profiles.length - 1].firstName + " " + profiles[profiles.length - 1].lastName + '. Please have a look.',
        //     date: dateAfterMonths,
        //     userInfo: {id: profiles[profiles.length - 1].profile_id + ''  + 100, profile: profiles[profiles.length - 1]}
        //   });
        //   dateAfterMonths = new Date(todaysDate.setMonth(todaysDate.getMonth() + 6))
        // }
      }

      // console.log("profiles to save", profiles);

      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));

      // this.props.route.params.getData();
      this.getData();

      if (this.state.indexOfEdit !== undefined) {
        updateRecommndedImmunizations();
      }

      this.setState({
        indexOfEdit: undefined,
      });

      this.closeProfileModal();
    } catch (e) {
      // saving error
      console.log("AsyncStorage error", e);
    }
  };

  getData = async () => {
    try {
      const profiles = await AsyncStorage.getItem("profiles");
      console.log("profiles", profiles);
      if (profiles !== null) {
        this.setState({ profiles: JSON.parse(profiles) });
      }
      this.setState({ processing: false });
    } catch (e) {
      // error reading value
      console.log("getData error", e);
    }
  };

  async deleteProfile(index) {
    try {
      this.setState({ processing: true });
      var profiles = await AsyncStorage.getItem("profiles");
      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }

      for (var i = 0; i < profiles[index].vaccinations.length; i++) {
        for (
          var p = 0;
          p < profiles[index].vaccinations[i].notificationIdList.length;
          p++
        ) {
          PushNotification.cancelLocalNotifications({
            id: profiles[index].vaccinations[i].notificationIdList[p],
          });
        }
      }

      profiles.splice(index, 1);

      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));

      this.getData();
    } catch (e) {
      // error reading value
      console.log("deleteProfile error", e);
    }
  }

  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  handleDatePicked = (date) => {
    console.log("A date has been picked: ", date);
    this.hideDateTimePicker();
    this.setState({ birthDate: Moment(date).format("MMM DD, YYYY") });
  };

  showImagePicker() {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: "images",
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        this.setState({
          profileImage: response.uri,
        });
      }
    });
  }

  closeProfileModal() {
    this.setState({
      addProfileModal: !this.state.addProfileModal,
      profileImage: "",
      firstName: "",
      lastName: "",
      birthDate: Moment(new Date()).format("MMM DD, YYYY"),
      selectedGender: "",
    });
  }

  renderProfileItem({ item, index }) {
    this.delayValue = this.delayValue + 500;
    const translateX = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [this.delayValue, 1],
    });
    return (
      <Animated.View
        style={[styles.profileRow, { transform: [{ translateX }] }]}
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
          <Text style={[styles.name, { fontFamily: "Montserrat_Bold" }]}>
            {item.firstName + " " + item.lastName}
          </Text>
          <View style={styles.buttonsView}>
            {/*<Text style = {{marginTop:10, color:'white', fontSize: width/35, flex: 1, marginRight: 5, fontFamily: 'Montserrat_Medium'}}>{Moment(item.birthDate).format('MMM DD, YYYY')}</Text>*/}
            <View style={styles.buttonsInnerView}>
              <TouchableOpacity
                style={[styles.otherButtons, { marginTop: 8 }]}
                onPress={() => {
                  // this.props.navigation.navigate("AddProfile", {data: item, index: index, getData: this.getData});
                  this.setState({
                    addProfileModal: true,
                    profileImage: item.profileImage,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    birthDate: item.birthDate,
                    selectedGender: item.gender,
                    indexOfEdit: index,
                  });
                }}
              >
                <View style={styles.editButtonViewOfProfile}>
                  <Text
                    style={[
                      styles.buttonsTextOfProfile,
                      { fontFamily: "Montserrat_Medium" },
                    ]}
                  >
                    EDIT
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.otherButtons, { marginTop: 8, marginLeft: -1 }]}
                onPress={() => {
                  Alert.alert(
                    "Delete Profile",
                    "Are you sure you want to delete this profile?",
                    [
                      {
                        text: "No",
                      },
                      { text: "Yes", onPress: () => this.deleteProfile(index) },
                    ],
                    { cancelable: false }
                  );
                }}
              >
                <View style={styles.deleteView}>
                  <Text
                    style={[
                      styles.buttonsTextOfProfile,
                      { fontFamily: "Montserrat_Medium" },
                    ]}
                  >
                    DELETE
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.otherButtons, { marginTop: 1, marginLeft: -5 }]}
                onPress={() => {
                  this.props.navigationProps.navigation.navigate(
                    "SummaryRecords",
                    { data: item, index: index, from: "ManageProfile" }
                  );
                }}
              >
                <View style={styles.summaryView}>
                  <Text
                    style={[
                      styles.buttonsTextOfProfile,
                      { fontFamily: "Montserrat_Medium" },
                    ]}
                  >
                    SUMMARY
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          {this.state.processing && (
            <View style={styles.progressBarOverlay}>
              <View style={styles.progressBar}>
                <ActivityIndicator size="small" color="#000000" />
                <Text
                  style={[
                    styles.processingText,
                    { fontFamily: "Montserrat_Medium" },
                  ]}
                >
                  Processing...
                </Text>
              </View>
            </View>
          )}
          <Image
            source={require("./images/anesthesia_profile.png")}
            style={styles.anesthesiaImage}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <View style={styles.pocektVaxViewStyle}>
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
                  style={styles.manageProfileIcon}
                  source={require("./images/manage_profile.png")}
                />
                <Text
                  style={[
                    styles.profilesText,
                    { fontFamily: "Montserrat_Bold" },
                  ]}
                >
                  Profiles
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                //  this.props.navigation.navigate("AddProfile", {getData: this.getData});
                this.setState({ addProfileModal: !this.state.addProfileModal });
              }}
            >
              <Image style={styles.plus} source={require("./images/add.png")} />
            </TouchableOpacity>
          </View>

          {this.state.profiles.length > 0 && (
            <FlatList
              style={{ marginTop: 30 }}
              data={this.state.profiles}
              renderItem={this.renderProfileItem}
              keyExtractor={(item, index) => index.toString()}
            />
          )}

          {this.state.profiles.length == 0 && (
            <View style={styles.noUserView}>
              <Text
                style={[styles.noUserText, { fontFamily: "Montserrat_Bold" }]}
              >
                No User Available
              </Text>
            </View>
          )}
        </View>

        <Modal
          animationType="slide"
          animated={true}
          transparent={true}
          visible={this.state.addProfileModal}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.modalTouch}
              onPress={() => {
                this.closeProfileModal();
              }}
            ></TouchableOpacity>
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps={true}
              style={styles.modalView}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => {
                    this.closeProfileModal();
                  }}
                >
                  <Image
                    style={styles.cancel}
                    source={require("./images/cancel.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={() => {
                    if (
                      this.state.firstName == "" &&
                      this.state.lastName == ""
                    ) {
                      Alert.alert(
                        "Incomplete Information",
                        "Please enter your First Name and Last Name."
                      );
                    } else if (this.state.firstName == "") {
                      Alert.alert(
                        "Incomplete Information",
                        "Please enter your First Name."
                      );
                    } else if (this.state.lastName == "") {
                      Alert.alert(
                        "Incomplete Information",
                        "Please enter your Last Name."
                      );
                    } else {
                      this.storeData();
                    }
                  }}
                >
                  <Image
                    style={styles.correct}
                    source={require("./images/correct.png")}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.showImagePicker();
                }}
              >
                <Image
                  style={styles.profileImageModal}
                  source={
                    this.state.profileImage == ""
                      ? require("./images/user.png")
                      : { uri: this.state.profileImage }
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.otherButton}
                onPress={() => {
                  this.showImagePicker();
                }}
              >
                <View style={styles.editButtonModalView}>
                  <Text
                    style={[
                      styles.editButtonModalText,
                      { fontFamily: "Montserrat_Medium" },
                    ]}
                  >
                    EDIT
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.firstNameView}>
                <View style={styles.firstNameInnerView}>
                  <View style={{ marginRight: 20 }}>
                    <View style={styles.titleView}>
                      <Text
                        style={[
                          styles.titleText,
                          { fontFamily: "Montserrat_Medium" },
                        ]}
                      >
                        First Name
                      </Text>
                    </View>

                    <TextInput
                      style={[
                        styles.textInput,
                        { fontFamily: "Montserrat_Bold" },
                      ]}
                      placeholder="First Name"
                      placeholderTextColor="#AEC2C2"
                      value={this.state.firstName}
                      onBlur={(value) => {
                        this.setState({ userNameFocused: false });
                      }}
                      onFocus={(value) => {
                        this.setState({ userNameFocused: true });
                      }}
                      onChangeText={(value) => {
                        this.setState({ firstName: value });
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.lastNameView}>
                <View style={styles.lastNameInnerView}>
                  <View style={{ marginRight: 20 }}>
                    <View style={styles.titleView}>
                      <Text
                        style={[
                          styles.titleText,
                          { fontFamily: "Montserrat_Medium" },
                        ]}
                      >
                        Last Name
                      </Text>
                    </View>

                    <TextInput
                      style={[
                        styles.textInput,
                        { fontFamily: "Montserrat_Bold" },
                      ]}
                      placeholder="Last Name"
                      placeholderTextColor="#AEC2C2"
                      value={this.state.lastName}
                      onBlur={(value) => {
                        this.setState({ userNameFocused: false });
                      }}
                      onFocus={(value) => {
                        this.setState({ userNameFocused: true });
                      }}
                      onChangeText={(value) => {
                        this.setState({ lastName: value });
                      }}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.dateViewModal}>
                <View style={styles.calendarView}>
                  <Image
                    style={styles.calendarImage}
                    source={require("./images/calendar.png")}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.otherButtons, { marginTop: 10 }]}
                  onPress={() => {
                    this.showDateTimePicker();
                  }}
                >
                  {Platform.OS == "ios" ? (
                    <DatePickerModal
                      customPickerIOS={DatePicker}
                      mode={"date"}
                      isVisible={this.state.isDateTimePickerVisible}
                      onConfirm={this.handleDatePicked}
                      onCancel={this.hideDateTimePicker}
                      isDarkModeEnabled={false}
                    />
                  ) : (
                    <DateTimePickerModal
                      isVisible={this.state.isDateTimePickerVisible}
                      onConfirm={this.handleDatePicked}
                      onCancel={this.hideDateTimePicker}
                      isDarkModeEnabled={
                        Appearance.getColorScheme() == "dark" ? true : false
                      }
                    />
                  )}
                  <View style={{ marginRight: 50 }}>
                    <Text
                      style={[
                        styles.dateOfBirth,
                        { fontFamily: "Montserrat_Medium" },
                      ]}
                    >
                      Date Of Birth
                    </Text>
                    <Text
                      style={[
                        styles.homeButtonText,
                        {
                          fontWeight: "bold",
                          marginLeft: 10,
                          color:
                            this.state.birthDate == "" ? "#AEC2C2" : "#AEC2C2",
                          fontFamily: "Montserrat_Bold",
                        },
                      ]}
                    >
                      {this.state.birthDate == ""
                        ? "Birth Date"
                        : this.state.birthDate}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.lastNameView}>
                <View style={styles.horizontalLine}></View>
              </View>

              <View style={styles.sexView}>
                <Text
                  style={[styles.sexText, { fontFamily: "Montserrat_Medium" }]}
                >
                  Sex
                </Text>
              </View>

              <View style={styles.buttonsView}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    {
                      fontFamily: "Montserrat_Medium",
                      borderColor:
                        this.state.selectedGender == "M" ? "#82A1A1" : "white",
                      backgroundColor:
                        this.state.selectedGender == "M"
                          ? "#82A1A1"
                          : "#475757",
                    },
                  ]}
                  onPress={() => {
                    this.setState({ selectedGender: "M" });
                  }}
                >
                  <Text style={[styles.genderButtonText, { color: "white" }]}>
                    M
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    {
                      fontFamily: "Montserrat_Medium",
                      borderColor:
                        this.state.selectedGender == "F" ? "#82A1A1" : "white",
                      backgroundColor:
                        this.state.selectedGender == "F"
                          ? "#82A1A1"
                          : "#475757",
                    },
                  ]}
                  onPress={() => {
                    this.setState({ selectedGender: "F" });
                  }}
                >
                  <Text style={[styles.genderButtonText, { color: "white" }]}>
                    F
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#82A1A1",
    height: "100%",
  },
  genderButton: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginTop: 10,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
    borderWidth: 1,
  },
  genderButtonText: {
    padding: 0,
    fontSize: width / 23,
  },
  textInput: {
    fontSize: width / 30,
    paddingHorizontal: 15,
    height: 35,
    paddingBottom: 0,
    paddingTop: 0,
    backgroundColor: "#596969",
    borderRadius: 30,
    color: "#AEC2C2",
    marginTop: -5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
  },
  plus: {
    width: 22,
    height: 22,
    marginRight: 10,
    resizeMode: "contain",
  },
  homeButton: {
    marginTop: 5,
    alignSelf: "flex-start",
  },
  homeButtonText: {
    padding: 5,
  },
  profileTitleText: {
    marginTop: 30,
    marginLeft: 5,
  },
  profileTitleUnderline: {
    width: "100%",
    height: 1,
    marginTop: 10,
    backgroundColor: "black",
  },
  dateViewModal: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    marginTop: -15,
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
  otherButtons: {
    borderRadius: 5,
    marginTop: 5,
    alignItems: "center",
    marginRight: 10,
  },
  profileImageModal: {
    height: 120,
    width: 120,
    borderWidth: 1,
    borderRadius: 60,
    borderColor: "transparent",
    alignSelf: "center",
    marginTop: -20,
  },
  otherButton: {
    borderRadius: 35,
    marginTop: -10,
    alignSelf: "center",
    backgroundColor: "#ECAE00",
  },
  delete: {
    height: 22,
    width: 22,
    resizeMode: "contain",
    marginRight: 10,
    marginTop: 8,
  },
  progressBarOverlay: {
    flex: 1,
    zIndex: 2,
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  progressBar: {
    width: 120,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "white",
  },
  processingText: {
    fontSize: 11,
    marginTop: 5,
  },
  name: {
    color: "white",
    textAlign: "center",
    fontSize: width / 25,
    width: "95%",
  },
  editButtonViewOfProfile: {
    backgroundColor: "#4A5C5C",
    borderRadius: 30,
    marginRight: -5,
  },
  buttonsTextOfProfile: {
    fontSize: width / 45,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 10,
    marginRight: 10,
    color: "white",
  },
  deleteView: {
    backgroundColor: "#4A5C5C",
    borderRadius: 30,
  },
  summaryView: {
    backgroundColor: "#4A5C5C",
    borderRadius: 30,
    marginTop: 7,
    width: "90%",
    marginRight: 10,
  },
  pocektVaxViewStyle: {
    flexDirection: "row",
    alignItems: "center",
  },
  verticalLine: {
    marginLeft: 10,
    height: 22,
    width: 3,
    backgroundColor: "white",
  },
  modalTouch: {
    flex: 1,
    width: width,
    height: height,
    position: "absolute",
  },
  editButtonModalView: {
    backgroundColor: "#82A1A1",
    borderRadius: 50,
  },
  firstNameView: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  firstNameInnerView: {
    borderRadius: 10,
    flex: 0.8,
    height: 48,
    alignSelf: "center",
    marginTop: 20,
  },
  titleView: {
    flexDirection: "row",
    marginTop: -22,
    position: "absolute",
  },
  lastNameView: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  lastNameInnerView: {
    borderRadius: 10,
    flex: 0.8,
    height: 48,
    alignSelf: "center",
    marginTop: 10,
  },
  dateOfBirth: {
    color: "white",
    fontSize: width / 35,
    marginLeft: 15,
  },
  horizontalLine: {
    flex: 0.8,
    height: 1,
    backgroundColor: "#82A1A1",
  },
  sexView: {
    width: 50,
    backgroundColor: "#475757",
    marginTop: -10,
    justifyContent: "center",
    marginLeft: width * 0.43,
  },
  sexText: {
    color: "white",
    fontSize: width / 28,
    textAlign: "center",
    backgroundColor: "#475757",
  },
  nameView: {
    paddingTop: 15,
    paddingBottom: 15,
    flex: 1,
  },
  buttonsView: {
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonsInnerView: {
    flexDirection: "row",
    marginRight: -12,
  },
  anesthesiaImage: {
    position: "absolute",
    height: height / 1.5,
    width: width,
    bottom: -10,
    left: width / 3.3,
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
  manageProfileIcon: {
    resizeMode: "contain",
    marginLeft: 10,
    width: 22,
    height: 22,
  },
  profilesText: {
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
  modalView: {
    flexGrow: 1,
    marginTop: "40%",
    backgroundColor: "#475757",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1000,
  },
  cancel: {
    margin: 10,
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  correct: {
    margin: 10,
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  editButtonModalText: {
    textAlign: "center",
    fontSize: width / 38,
    marginTop: 3,
    width: 50,
    height: 17,
    color: "white",
  },
  titleText: {
    flexDirection: "row",
    color: "white",
    fontSize: width / 35,
    marginLeft: 15,
    marginTop: -5,
  },
  calendarView: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(94, 115, 115)",
    borderRadius: 30,
    marginLeft: 40,
  },
  calendarImage: {
    height: 20,
    width: 20,
    resizeMode: "contain",
  },
});
