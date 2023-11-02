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
  KeyboardAvoidingView,
  Animated,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native-appearance";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import RNPickerSelect from "react-native-picker-select";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
var PushNotification = require("react-native-push-notification");
import DatePicker from "@react-native-community/datetimepicker";
import { DatePickerModal } from "./DatePickerModal";

import {
  getImmunizationDetails,
  getImmunizationListAccordingToAge,
  getAgeGroup,
  getAge,
  monthDiff,
  updateRecommndedImmunizations,
} from "./helpers";

var { height, width } = Dimensions.get("window");

export default class ManageVaccination extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      addVaccinationModal: false,
      isDateTimePickerVisible: false,
      date: "",
      immunization: "",
      typeOfImmunization: "",
      recommendedTime: "",
      catchUpTime: "",
      highRisk: "",
      description: "",
      sideEffects: "",
      profiles: [],
      immunizationList: [],
      recommendedTimeList: [],
      catchUpTimeList: [],
      dose: 0,
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

  storeData = async () => {
    try {
      var profiles = await AsyncStorage.getItem("profiles");
      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }

      var selectedProfile = profiles[this.state.indexOfEdit];

      var todaysDate = new Date();
      var timeDifference = monthDiff(todaysDate, new Date(this.state.date));
      var notificationTimeList = [];
      var notificationIdList = [];
      var vaccination_id =
        selectedProfile.vaccinations.length > 0
          ? selectedProfile.vaccinations[
              selectedProfile.vaccinations.length - 1
            ].vaccination_id + 1
          : 1;

      var vaccineIndex = selectedProfile.vaccinations.findIndex(
        (vaccination) =>
          vaccination.immunization === this.state.immunization &&
          vaccination.type !== "recommended"
      );
      // console.log("vaccineIndex", vaccineIndex);
      var vaccineObj = {
        vaccination_id: vaccination_id,
        date: [this.state.date],
        immunization: this.state.immunization,
        typeOfImmunization: this.state.typeOfImmunization,
        recommendedTime: this.state.recommendedTime,
        catchUpTime: this.state.catchUpTime,
        description: this.state.description,
        sideEffects: this.state.sideEffects,
        recommendedTimeForSelectedImmunzation: this.state.recommendedTime,
        catchUpTimeForSelectedImmunzation: this.state.catchUpTime,
        descriptionForSelectedImmunzation: this.state.description,
        sideEffectsForSelectedImmunzation: this.state.sideEffects,
        minimumAgeForSelectedImmunzation:
          this.state.minimumAgeForSelectedImmunzation,
        currentAge: [getAge(new Date(selectedProfile.birthDate))],
        notificationTimeList: notificationTimeList,
        notificationIdList: notificationIdList,
        creationDate: new Date(),
      };

      if (vaccineIndex == -1) {
        selectedProfile.vaccinations.push(vaccineObj);
      } else {
        vaccination_id =
          selectedProfile.vaccinations[vaccineIndex].vaccination_id;
        for (
          var p = 0;
          p <
          selectedProfile.vaccinations[vaccineIndex].notificationIdList.length;
          p++
        ) {
          PushNotification.cancelLocalNotifications({
            id: selectedProfile.vaccinations[vaccineIndex].notificationIdList[
              p
            ],
          });
        }
        vaccineObj.date = [
          ...selectedProfile.vaccinations[vaccineIndex].date,
          ...vaccineObj.date,
        ];
        vaccineObj.currentAge = [
          ...selectedProfile.vaccinations[vaccineIndex].currentAge,
          ...vaccineObj.currentAge,
        ];
        selectedProfile.vaccinations[vaccineIndex] = vaccineObj;
      }

      // selectedProfile.vaccinations.push({
      //   vaccination_id: vaccination_id,
      //   date: this.state.date,
      //   immunization: this.state.immunization,
      //   typeOfImmunization: this.state.typeOfImmunization,
      //   recommendedTime: this.state.recommendedTime,
      //   catchUpTime: this.state.catchUpTime,
      //   description: this.state.description,
      //   sideEffects: this.state.sideEffects,
      //   recommendedTimeForSelectedImmunzation: this.state.recommendedTimeForSelectedImmunzation,
      //   catchUpTimeForSelectedImmunzation: this.state.catchUpTimeForSelectedImmunzation,
      //   descriptionForSelectedImmunzation: this.state.descriptionForSelectedImmunzation,
      //   sideEffectsForSelectedImmunzation: this.state.sideEffectsForSelectedImmunzation,
      //   minimumAgeForSelectedImmunzation: this.state.minimumAgeForSelectedImmunzation,
      //   currentAge: selectedProfile.age,
      //   notificationTimeList: notificationTimeList
      // })

      // console.log("timeDifference", timeDifference, timeDifference%6);

      for (var i = 0; i < Math.floor(timeDifference / 6); i++) {
        var dateAfterMonths = new Date(
          todaysDate.setMonth(todaysDate.getMonth() + 6)
        );
        PushNotification.localNotificationSchedule({
          id: selectedProfile.profile_id + "" + vaccination_id + "" + i,
          title:
            "Recommended Immunization for " +
            selectedProfile.firstName +
            " " +
            selectedProfile.lastName,
          message: this.state.immunization,
          vaccination_id: vaccination_id,
          date: dateAfterMonths,
          userInfo: {
            id: selectedProfile.profile_id + "" + vaccination_id + "" + i,
            profile: selectedProfile,
            vaccination_id: vaccination_id,
          },
        });
        notificationIdList.push(
          selectedProfile.profile_id + "" + vaccination_id + "" + i
        );
        notificationTimeList.push(dateAfterMonths);
      }

      var selectedDate = new Date(this.state.date);
      selectedDate.setHours(todaysDate.getHours());
      selectedDate.setMinutes(todaysDate.getMinutes());
      selectedDate.setSeconds(todaysDate.getSeconds());
      if (
        notificationTimeList.length == 0 ||
        (notificationTimeList.length > 0 &&
          notificationTimeList[notificationTimeList.length - 1].getTime() <
            selectedDate.getTime())
      ) {
        notificationIdList.push(
          selectedProfile.profile_id +
            "" +
            vaccination_id +
            "" +
            notificationIdList.length
        );
        if (selectedDate.getTime() > new Date().getTime()) {
          notificationTimeList.push(selectedDate);
        }
        PushNotification.localNotificationSchedule({
          id:
            selectedProfile.profile_id +
            "" +
            vaccination_id +
            "" +
            (notificationIdList.length - 1),
          title:
            selectedDate.getTime() < new Date().getTime()
              ? "Immunization Summary"
              : "Recommended Immunization for " +
                selectedProfile.firstName +
                " " +
                selectedProfile.lastName,
          message: this.state.immunization,
          date: selectedDate,
          userInfo: {
            id:
              selectedProfile.profile_id +
              "" +
              vaccination_id +
              (notificationIdList.length - 1),
            profile: selectedProfile,
            vaccination_id: vaccination_id,
          },
        });
      }
      // console.log("notificationTimeList", notificationTimeList, selectedProfile.vaccinations);

      profiles[this.state.indexOfEdit] = selectedProfile;

      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));

      this.getData();

      this.closeVaccinationModal();
    } catch (e) {
      // saving error
      console.error(e);
    }
  };

  getData = async () => {
    try {
      const profiles = await AsyncStorage.getItem("profiles");
      console.log("profiles", profiles);
      if (profiles !== null) {
        this.setState({ profiles: JSON.parse(profiles) });
      }
    } catch (e) {
      // error reading value
    }
  };
  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  handleDatePicked = (date) => {
    console.log("A date has been picked: ", date);
    this.hideDateTimePicker();
    if (this.selectedDateType == "lastImmunizationDate") {
      this.setState({
        lastImmunizationDate: Moment(date).format("MMM DD, YYYY"),
      });
    } else {
      this.setState({ date: Moment(date).format("MMM DD, YYYY") });
    }
  };

  closeVaccinationModal() {
    this.setState({
      addVaccinationModal: !this.state.addVaccinationModal,
      date: "",
      immunization: "",
      typeOfImmunization: "",
      recommendedTime: "",
      catchUpTime: "",
      highRisk: "",
      description: "",
      sideEffects: "",
      immunizationList: [],
      recommendedTimeList: [],
      catchUpTimeList: [],
      dose: 0,
    });
  }

  getImmunizationList(year) {
    return [
      { label: "Hepatitis B (HepB)", value: "Hepatitis B (HepB)" },
      { label: "Rotavirus (RV)", value: "Rotavirus (RV)" },
      {
        label: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
        value: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
      },
      {
        label: "Haemophilus influenzae type b (Hib)",
        value: "Haemophilus influenzae type b (Hib)",
      },
      {
        label: "Pneumococcal conjugate (PCV13)",
        value: "Pneumococcal conjugate (PCV13)",
      },
      {
        label: "Inactivated poliovirus (IPV)",
        value: "Inactivated poliovirus (IPV)",
      },
      { label: "Influenza (IIV)", value: "Influenza (IIV)" },
      { label: "Influenza (LAIV)", value: "Influenza (LAIV)" },
      {
        label: "Measles, Mumps, Rubella (MMR)",
        value: "Measles, Mumps, Rubella (MMR)",
      },
      { label: "Varicella (VAR)", value: "Varicella (VAR)" },
      { label: "Hepatitis A (HepA)", value: "Hepatitis A (HepA)" },
      {
        label: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
        value: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
      },
      { label: "Tetanus, diphtheria (Td)", value: "Tetanus, diphtheria (Td)" },
      {
        label: "Human papillomavirus (HPV) Sex-related",
        value: "Human papillomavirus (HPV) Sex-related",
      },
      {
        label: "Meningococcal (MenACWY-D)",
        value: "Meningococcal (MenACWY-D)",
      },
      { label: "Meningococcal B (MenB)", value: "Meningococcal B (MenB)" },
      {
        label: "Pneumococcal polysaccharide (PPSV23)",
        value: "Pneumococcal polysaccharide (PPSV23)",
      },
      {
        label: "Influenza inactivated (IIV)",
        value: "Influenza inactivated (IIV)",
      },
      {
        label: "Influenza recombinant (RIV)",
        value: "Influenza recombinant (RIV)",
      },
      {
        label: "Influenza live attenuated (LAIV)",
        value: "Influenza live attenuated (LAIV)",
      },
      {
        label: "Zoster recombinant (Shingles) (RZV)",
        value: "Zoster recombinant (Shingles) (RZV)",
      },
      {
        label: "Zoster live (Shingles) (ZVL)",
        value: "Zoster live (Shingles) (ZVL)",
      },
      { label: "Anthrax Vaccine (AVA)", value: "Anthrax Vaccine (AVA)" },
      {
        label: "Japanese Encephalitis (IXIARO)",
        value: "Japanese Encephalitis (IXIARO)",
      },
      { label: "Rabies Vaccine", value: "Rabies Vaccine" },
      { label: "Smallpox Vaccine", value: "Smallpox Vaccine" },
      { label: "Typhoid Vaccine", value: "Typhoid Vaccine" },
      { label: "Yellow Fever Vaccine", value: "Yellow Fever Vaccine" },
    ];
  }

  renderProfileItem({ item, index }) {
    this.delayValue = this.delayValue + 500;
    const translateX = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [this.delayValue, 1],
    });
    var today = new Date();
    var olday = new Date(item.birthDate);
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
        <View style={{ flex: 1 }}>
          <View style={styles.nameView}>
            <Text style={[styles.name, { fontFamily: "Montserrat_Bold" }]}>
              {item.firstName + " " + item.lastName}
            </Text>
            {/*<Text style = {{marginTop:15,color:'white'}}>{Number((today.getTime() - olday.getTime()) / 31536000000).toFixed(0)} Years</Text>*/}
            <TouchableOpacity
              style={{ alignSelf: "flex-start" }}
              onPress={() => {
                // this.props.navigation.navigate("AddVaccination", {getData: this.getData, index: index});
                console.log(
                  "immunizationList",
                  this.getImmunizationList(
                    Number(
                      (today.getTime() - olday.getTime()) / 31536000000
                    ).toFixed(0)
                  )
                );
                this.setState({
                  addVaccinationModal: true,
                  indexOfEdit: index,
                  immunizationList: this.getImmunizationList(
                    Number(
                      (today.getTime() - olday.getTime()) / 31536000000
                    ).toFixed(0)
                  ),
                });
              }}
            >
              <Image style={styles.plus} source={require("./images/add.png")} />
            </TouchableOpacity>
          </View>
          <View style={styles.plusAndSummaryView}>
            <Text style={[styles.ageText, { fontFamily: "Montserrat_Medium" }]}>
              {getAge(new Date(item.birthDate))}
            </Text>
            <TouchableOpacity
              style={[styles.otherButtons, { marginBottom: 15 }]}
              onPress={() => {
                this.props.navigationProps.navigation.navigate(
                  "SummaryRecords",
                  { data: item, index: index, from: "ManageVaccination" }
                );
              }}
            >
              <View style={styles.summaryView}>
                <Text
                  style={[
                    styles.summaryText,
                    { fontFamily: "Montserrat_Medium" },
                  ]}
                >
                  SUMMARY
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <Image
            source={require("./images/anesthesia_profile.png")}
            style={styles.anesthesiaImage}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                goBack();
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
                  style={styles.vaccinationIcon}
                  source={require("./images/manage_vaccinations.png")}
                />
              </View>
            </TouchableOpacity>
            <Text
              style={[
                styles.vaccinationTitle,
                { fontFamily: "Montserrat_Bold" },
              ]}
            >
              Vaccinations
            </Text>
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
          visible={this.state.addVaccinationModal}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.modalTouch}
              onPress={() => {
                this.closeVaccinationModal();
              }}
            ></TouchableOpacity>
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps={true}
              style={styles.modalView}
            >
              <View
                style={[styles.header, { justifyContent: "space-between" }]}
              >
                <TouchableOpacity
                  onPress={() => {
                    this.closeVaccinationModal();
                  }}
                >
                  <Image
                    style={styles.cancel}
                    source={require("./images/cancel.png")}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.modalTitle,
                    { fontFamily: "Montserrat_Medium" },
                  ]}
                >
                  Add Immunization
                </Text>

                <TouchableOpacity
                  style={styles.homeButton}
                  onPress={() => {
                    if (
                      this.state.date == "" &&
                      this.state.immunization == ""
                    ) {
                      Alert.alert(
                        "Incomplete Information",
                        "Please select date and immunization."
                      );
                    } else if (this.state.date == "") {
                      Alert.alert(
                        "Incomplete Information",
                        "Please enter date."
                      );
                    } else if (this.state.immunization == "") {
                      Alert.alert(
                        "Incomplete Information",
                        "Please enter immunization."
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
                <View style={styles.dateView}>
                  <View style={styles.dateInnerView}>
                    <View style={styles.dateTitleView}>
                      <Text
                        style={[
                          styles.dateTitle,
                          { fontFamily: "Montserrat_Medium" },
                        ]}
                      >
                        Date
                      </Text>
                    </View>
                    <View style={styles.dateView}>
                      <View style={styles.selectedDateView}>
                        <Text
                          style={[
                            { fontFamily: "Montserrat_Bold" },
                            styles.selectedDateText,
                          ]}
                        >
                          {this.state.date == ""
                            ? "Select Date"
                            : this.state.date}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.inputView}>
                <View style={styles.inputInnerView}>
                  <View>
                    <View style={styles.titleView}>
                      <Text
                        style={[
                          styles.titleText,
                          { fontFamily: "Montserrat_Medium" },
                        ]}
                      >
                        Immunization
                      </Text>
                    </View>
                    <RNPickerSelect
                      style={{ paddingHorizontal: 20, ...pickerSelectStyles }}
                      onValueChange={(value) => {
                        this.setState({ immunization: value }, () => {
                          var details = getImmunizationDetails(value);
                          this.setState({
                            recommendedTimeForSelectedImmunzation:
                              details.recommendedTime,
                            catchUpTimeForSelectedImmunzation:
                              details.catchUpTime,
                            descriptionForSelectedImmunzation:
                              details.description,
                            sideEffectsForSelectedImmunzation:
                              details.sideEffects,
                            minimumAgeForSelectedImmunzation:
                              details.minimumAge,
                            recommendedTime: details.recommendedTime,
                            catchUpTime: details.catchUpTime,
                            description: details.description,
                            sideEffects: details.sideEffects,
                          });
                        });
                      }}
                      placeholderTextColor="#AEC2C2"
                      placeholder={{
                        label: "Select Immunization",
                        value: null,
                      }}
                      items={this.state.immunizationList}
                      value={this.state.immunization}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputView}>
                <View style={styles.inputInnerView}>
                  <View>
                    <View style={styles.titleView}>
                      <Text
                        style={[
                          styles.titleText,
                          { fontFamily: "Montserrat_Medium" },
                        ]}
                      >
                        Type of Immunization
                      </Text>
                    </View>
                    <RNPickerSelect
                      style={{ paddingHorizontal: 20, ...pickerSelectStyles }}
                      onValueChange={(value) => {
                        console.log("State is", value);
                        this.setState({ typeOfImmunization: value });
                      }}
                      placeholderTextColor="#AEC2C2"
                      placeholder={{
                        label: "Select Type of Immunization",
                        value: null,
                      }}
                      items={[
                        { label: "Dose 1", value: "Dose 1" },
                        { label: "Dose 2", value: "Dose 2" },
                        { label: "Dose 3", value: "Dose 3" },
                        { label: "Dose 4", value: "Dose 4" },
                        {
                          label: "Catch-up Vaccination 1",
                          value: "Catch-up Vaccination 1",
                        },
                        {
                          label: "Catch-up Vaccination 2",
                          value: "Catch-up Vaccination 2",
                        },
                        {
                          label: "Catch-up Vaccination 3",
                          value: "Catch-up Vaccination 3",
                        },
                        {
                          label: "Catch-up Vaccination 4",
                          value: "Catch-up Vaccination 4",
                        },
                        {
                          label: "Booster Vaccination",
                          value: "Booster Vaccination",
                        },
                      ]}
                      value={this.state.typeOfImmunization}
                      useNativeAndroidPickerStyle={false}
                    />
                  </View>
                </View>
              </View>

              {/*<View style = {{flexDirection: 'row', justifyContent: 'center', marginTop: 25}} >
                    <View style = {{borderRadius: 30, flex:0.8, backgroundColor:'#596969',height: 35,  alignSelf: 'center', marginTop:20}} >
                      <View>
                         <View style = {{flexDirection: 'row', marginTop:-25, marginBottom: -2}} >
                            <Text style= {{flexDirection: 'row', color:'white',width:'50%', fontSize:13, marginLeft:15}}>Recommended time</Text>
                            <Image style={{width:15, height:15, marginLeft: -15}} source={require('./images/info.png')}/>
                         </View>
                         <RNPickerSelect  style ={{paddingHorizontal: 20}}
                             onValueChange={(value) => console.log("State is",value)}
                             onValueChange={(value) => {
                               this.setState({recommendedTime: value});
                             }}
                             placeholderTextColor="#AEC2C2"
                             placeholder={{
                                   label: 'Select recommended time ',
                                   value: null,
                             }}
                             items={this.state.recommendedTimeList}
                             value={this.state.recommendedTime}
                             style={{ ...pickerSelectStyles }}
                             useNativeAndroidPickerStyle = {false}
                         />
                      </View>
                    </View>
                  </View>*/}

              {/*<View style = {{flexDirection: 'row', justifyContent: 'center', marginTop: 25}} >
                    <View style = {{borderRadius: 30, flex:0.8, backgroundColor:'#596969',height: 35,  alignSelf: 'center', marginTop:20}} >
                      <View>
                         <View style = {{flexDirection: 'row', marginTop:-25, marginBottom: -2}} >
                            <Text style= {{flexDirection: 'row', color:'white',width:'40%', fontSize:13, marginLeft:15}}>Catch up Time</Text>
                            <Image style={{width:15, height:15, marginLeft: -20}} source={require('./images/info.png')}/>
                         </View>
                         <RNPickerSelect  style ={{paddingHorizontal: 20}}
                             onValueChange={(value) => console.log("State is",value)}
                             onValueChange={(value) => {
                               this.setState({catchUpTime: value});
                             }}
                             placeholderTextColor="#AEC2C2"
                             placeholder={{
                                   label: 'Select catch up time ',
                                   value: null,
                             }}
                             items={this.state.catchUpTimeList}
                             value={this.state.catchUpTime}
                             style={{ ...pickerSelectStyles }}
                             useNativeAndroidPickerStyle = {false}
                         />
                      </View>
                    </View>
                  </View>*/}

              {/*<View style = {{flexDirection: 'row', justifyContent: 'center', marginTop: 25}} >
                    <View style = {{borderRadius: 30, flex:0.8, backgroundColor:'#596969',height: 35,  alignSelf: 'center', marginTop:20}} >
                      <View>
                         <View style = {{flexDirection: 'row', marginTop:-25}} >
                            <Text style= {{flexDirection: 'row', color:'white',width:'30%', fontSize:13, marginLeft:20}}>High Risk</Text>
                         </View>
                         <RNPickerSelect  style ={{paddingHorizontal: 20}}
                             onValueChange={(value) => console.log("State is",value)}
                             onValueChange={(value) => {
                               this.setState({highRisk: value});
                             }}
                             placeholderTextColor="#AEC2C2"

                             placeholder={{
                                   label: 'Select high risk',
                                   value: null,
                                 }}

                             items={[
                                 { label: '6-18 month', value: '6-18 month' },
                                 { label: '9-18 month', value: '9-18 month' },
                                 { label: '12-18 month', value: '12-18 month' },
                             ]}
                             value={this.state.highRisk}
                             style={{ ...pickerSelectStyles }}
                             useNativeAndroidPickerStyle = {false}
                         />
                      </View>
                    </View>
                  </View>*/}

              <View style={styles.inputView}>
                <View style={styles.otherInputInnerView}>
                  <View>
                    <View style={styles.otherTitleView}>
                      <Text
                        style={[
                          styles.titleText,
                          {
                            fontFamily: "Montserrat_Medium",
                            marginTop: -5,
                          },
                        ]}
                      >
                        Minimum Age
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.textInput,
                        { fontFamily: "Montserrat_Bold" },
                      ]}
                    >
                      {this.state.minimumAgeForSelectedImmunzation == "" ||
                      this.state.minimumAgeForSelectedImmunzation == undefined
                        ? "Minimum Age"
                        : this.state.minimumAgeForSelectedImmunzation}
                    </Text>
                    {/*<TextInput style= {[styles.textInput, {fontFamily: "Montserrat_Bold"}]}
                           placeholder="Minimum Age"
                           multiline
                           editable={false}
                           placeholderTextColor="#AEC2C2"
                           value={this.state.minimumAgeForSelectedImmunzation}
                           onChangeText={(value) => {
                             // this.setState({recommendedTime: value});
                           }}
                         />*/}
                  </View>
                </View>
              </View>

              <View style={[styles.inputView, { marginTop: 10 }]}>
                <View style={styles.otherInputInnerView}>
                  <View>
                    <View style={styles.otherTitleView}>
                      <Text
                        style={[
                          styles.titleText,
                          {
                            fontFamily: "Montserrat_Medium",
                            marginTop: -5,
                          },
                        ]}
                      >
                        Recommended Time
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.textInput,
                        { fontFamily: "Montserrat_Bold" },
                      ]}
                    >
                      {this.state.recommendedTime == "" ||
                      this.state.recommendedTime == undefined
                        ? "Recommended Time"
                        : this.state.recommendedTime}
                    </Text>
                    {/*<TextInput style= {[styles.textInput, {fontFamily: "Montserrat_Bold"}]}
                           placeholder="Recommended Time"
                           multiline
                           editable={false}
                           placeholderTextColor="#AEC2C2"
                           value={this.state.recommendedTime}
                           onChangeText={(value) => {
                             this.setState({recommendedTime: value});
                           }}
                         />*/}
                  </View>
                </View>
              </View>

              <View style={[styles.inputView, { marginTop: 10 }]}>
                <View style={styles.otherInputInnerView}>
                  <View>
                    <View style={styles.otherTitleView}>
                      <Text
                        style={[
                          styles.titleText,
                          {
                            fontFamily: "Montserrat_Medium",
                            marginTop: -5,
                          },
                        ]}
                      >
                        Catch-up Time
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.textInput,
                        { fontFamily: "Montserrat_Bold" },
                      ]}
                    >
                      {this.state.catchUpTime == "" ||
                      this.state.catchUpTime == undefined
                        ? "Catch-up Time"
                        : this.state.catchUpTime}
                    </Text>
                    {/*<TextInput
                           style= {[styles.textInput, {fontFamily: Font_Montserrat_Bold}]}
                           placeholder="Catch-up Time"
                           multiline
                           editable={false}
                           placeholderTextColor="#AEC2C2"
                           value={this.state.catchUpTime}
                           onChangeText={(value) => {
                             this.setState({catchUpTime: value});
                           }}
                         />*/}
                  </View>
                </View>
              </View>

              <View style={[styles.inputView, { marginTop: 10 }]}>
                <View style={styles.otherInputInnerView}>
                  <View>
                    <View style={styles.otherTitleView}>
                      <Text
                        style={[
                          styles.titleText,
                          {
                            fontFamily: "Montserrat_Medium",
                            marginTop: -5,
                          },
                        ]}
                      >
                        Description
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.textInput,
                        { fontFamily: "Montserrat_Bold" },
                      ]}
                    >
                      {this.state.description == "" ||
                      this.state.description == undefined
                        ? "Description"
                        : this.state.description}
                    </Text>
                    {/*<TextInput
                           style= {[styles.textInput, {fontFamily: Font_Montserrat_Bold}]}
                           placeholder="Description"
                           multiline
                           editable={false}
                           placeholderTextColor="#AEC2C2"
                           value={this.state.description}
                           onChangeText={(value) => {
                             this.setState({description: value});
                           }}
                         />*/}
                  </View>
                </View>
              </View>

              <View
                style={[styles.inputView, { marginTop: 10, marginBottom: 30 }]}
              >
                <View style={styles.otherInputInnerView}>
                  <View>
                    <View style={styles.otherTitleView}>
                      <Text
                        style={[
                          styles.titleText,
                          {
                            fontFamily: "Montserrat_Medium",
                            marginTop: -5,
                          },
                        ]}
                      >
                        Side Effects
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.textInput,
                        { fontFamily: "Montserrat_Bold" },
                      ]}
                    >
                      {this.state.sideEffects == "" ||
                      this.state.sideEffects == undefined
                        ? "Side Effects"
                        : this.state.sideEffects}
                    </Text>
                    {/*<TextInput
                           style= {[styles.textInput, {fontFamily: Font_Montserrat_Bold}]}
                           placeholder="Side Effects"
                           multiline
                           editable={false}
                           placeholderTextColor="#AEC2C2"
                           value={this.state.sideEffects}
                           onChangeText={(value) => {
                             this.setState({sideEffects: value});
                           }}
                         />*/}
                  </View>
                </View>
              </View>

              {/*<Text style= {{flexDirection: 'row', marginTop: 15, color:'white', fontSize:13, marginLeft:60}}>Description</Text>
                  <Text style= {{flexDirection: 'row', marginTop: 5, color:'#AEC2C2', fontSize:12, marginLeft:50, marginRight: 50}}>{this.state.description}</Text>

                  <Text style= {{flexDirection: 'row', marginTop: 15, color:'white', fontSize:13, marginLeft:60}}>Side Effects</Text>
                  <Text style= {{flexDirection: 'row', marginTop: 5, color:'#AEC2C2', fontSize:12, marginLeft:50, marginRight: 50, marginBottom: 30}}>{this.state.sideEffects}</Text>*/}
            </KeyboardAwareScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6F8A8A",
    height: "100%",
  },
  textInput: {
    fontSize: width / 30,
    paddingHorizontal: 15,
    minHeight: 35,
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: "#596969",
    borderRadius: 20,
    overflow: "hidden",
    fontWeight: "bold",
    color: "#AEC2C2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
  },
  plus: {
    width: 22,
    height: 22,
    marginRight: 15,
    marginTop: 0,
    resizeMode: "contain",
  },
  homeButton: {
    borderRadius: 5,
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
    alignSelf: "center",
  },
  otherButton: {
    borderRadius: 35,
    marginTop: -10,
    alignSelf: "center",
    backgroundColor: "#ECAE00",
  },
  name: {
    marginTop: 5,
    marginRight: 10,
    color: "white",
    fontSize: width / 25,
  },
  ageText: {
    marginTop: 10,
    color: "white",
    fontSize: width / 35,
  },
  summaryView: {
    backgroundColor: "#4A5C5C",
    borderRadius: 30,
    marginTop: 7,
  },
  summaryText: {
    fontSize: width / 45,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 10,
    marginRight: 10,
    color: "white",
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
  modalTouch: {
    flex: 1,
    width: width,
    height: height,
    position: "absolute",
  },
  dateInnerView: {
    flex: 0.89,
    alignSelf: "center",
    marginTop: 20,
  },
  dateTitleView: {
    flexDirection: "row",
    position: "absolute",
  },
  dateTitle: {
    flexDirection: "row",
    color: "white",
    fontSize: width / 35,
    marginLeft: 32,
    marginTop: -5,
  },
  dateView: {
    flexDirection: "row",
    justifyContent: "center",
  },
  selectedDateView: {
    borderRadius: 35,
    backgroundColor: "#596969",
    flex: 0.89,
    height: 35,
    marginTop: 20,
    justifyContent: "center",
  },
  selectedDateText: {
    color: "#AEC2C2",
    marginLeft: 15,
    marginRight: 20,
    fontSize: width / 30,
  },
  inputView: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  inputInnerView: {
    borderRadius: 30,
    flex: 0.8,
    backgroundColor: "#596969",
    height: 35,
    alignSelf: "center",
    marginTop: 25,
  },
  titleView: {
    flexDirection: "row",
    marginTop: -25,
    marginBottom: -5,
  },
  titleText: {
    flexDirection: "row",
    color: "white",
    fontSize: width / 35,
    marginLeft: 15,
  },
  otherInputInnerView: {
    borderRadius: 10,
    minHeight: 48,
    marginTop: 25,
    flex: 0.8,
  },
  otherTitleView: {
    flexDirection: "row",
    marginTop: -22,
    position: "absolute",
  },
  nameView: {
    marginRight: 10,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  plusAndSummaryView: {
    marginRight: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  anesthesiaImage: {
    position: "absolute",
    height: height / 1.5,
    width: width,
    bottom: -10,
    left: width / 3.3,
  },
  vaccinationIcon: {
    resizeMode: "contain",
    marginLeft: 10,
    width: 22,
    height: 22,
  },
  vaccinationTitle: {
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
    marginTop: "50%",
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
  modalTitle: {
    margin: 10,
    color: "white",
    fontSize: width / 22,
  },
  correct: {
    margin: 10,
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: width / 30,
    marginTop: 14,
    paddingHorizontal: 15, // to ensure the text is never behind the icon
    zIndex: 10,
    height: 40,
    color: "#AEC2C2",
    fontFamily: "Montserrat-Bold",
  },
  inputAndroid: {
    fontSize: width / 30,
    marginTop: 14,
    paddingHorizontal: 15, // to ensure the text is never behind the icon
    zIndex: 10,
    height: 40,
    color: "#AEC2C2",
    fontFamily: "Montserrat-Bold",
  },
});
