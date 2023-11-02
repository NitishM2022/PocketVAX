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
  StatusBar,
  Alert,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import ImagePicker from "react-native-image-picker";
//import DateTimePickerModal from "react-native-modal-datetime-picker";
import Moment from "moment";
//import DateTimePicker from "react-native-modal-datetime-picker";
import Share from "react-native-share";
//import PDFLib, { PDFDocument, PDFPage } from "react-native-pdf-lib";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import Home from "./Home";
var PushNotification = require("react-native-push-notification");
// import { Tooltip } from 'react-native-elements';
import Tooltip from "react-native-walkthrough-tooltip";

var { height, width } = Dimensions.get("window");

export default class SummaryRecords extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      profiles: [],
      upcomingImmunizationList: [],
      pastImmunizationList: [],
      toolTipVisiblePast: [],
      toolTipVisibleUpcoming: [],
    };
    this.renderImmunizationItem = this.renderImmunizationItem.bind(this);
    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    var today = new Date(),
      pastImmunizationList = [],
      upcomingImmunizationList = [];
    var profiles = await AsyncStorage.getItem("profiles");
    if (profiles == null) {
      profiles = [];
    } else {
      profiles = JSON.parse(profiles);
    }
    this.props.route.params.data = profiles[this.props.route.params.index];
    for (var i = 0; i < this.props.route.params.data.vaccinations.length; i++) {
      var dateToCompare = this.props.route.params.data.vaccinations[i].date;
      if (
        today.getTime() >
        new Date(
          dateToCompare instanceof Array
            ? dateToCompare[dateToCompare.length - 1]
            : dateToCompare
        ).getTime()
      ) {
        pastImmunizationList.push(this.props.route.params.data.vaccinations[i]);
      } else {
        upcomingImmunizationList.push(
          this.props.route.params.data.vaccinations[i]
        );
      }
    }

    var upcomingImmunizationWhichIsNotRecommnded =
      upcomingImmunizationList.filter(function (el) {
        return el.type !== "recommended";
      });

    var upcomingImmunizationWhichIsRecommnded = upcomingImmunizationList.filter(
      function (el) {
        return el.type == "recommended";
      }
    );

    for (var i = 0; i < upcomingImmunizationWhichIsNotRecommnded.length; i++) {
      var index = upcomingImmunizationWhichIsRecommnded.findIndex(
        (vaccination) =>
          vaccination.immunization ===
          upcomingImmunizationWhichIsNotRecommnded[i].immunization
      );
      if (index !== -1) {
        upcomingImmunizationWhichIsRecommnded.splice(index, 1);
      }
    }

    upcomingImmunizationList = [
      ...upcomingImmunizationWhichIsRecommnded,
      ...upcomingImmunizationWhichIsNotRecommnded,
    ];

    // var today = new Date();
    // var olday = new Date(this.props.route.params.data.birthDate);
    // var recommendedUpcomingImmunizations = Home.getImmunizationListAccordingToAge(Number((today.getTime() - olday.getTime()) / 31536000000).toFixed(0));
    //
    // console.log("recommendedUpcomingImmunizations", recommendedUpcomingImmunizations);
    //
    // for (var i = 0; i < recommendedUpcomingImmunizations.length; i++) {
    //   var details = Home.getImmunizationDetails(recommendedUpcomingImmunizations[i].label);
    //   upcomingImmunizationList.push({
    //     vaccination_id: upcomingImmunizationList.length == 0 ? 1 : upcomingImmunizationList[upcomingImmunizationList.length - 1].vaccination_id + 1,
    //     date: Moment(new Date()).format('MMM DD, YYYY'),
    //     immunization: recommendedUpcomingImmunizations[i].label,
    //     typeOfImmunization: 'Dose 1',
    //     recommendedTime: details.recommendedTime,
    //     catchUpTime: details.catchUpTime,
    //     description: details.description,
    //     sideEffects: details.sideEffects,
    //     recommendedTimeForSelectedImmunzation: details.recommendedTime,
    //     catchUpTimeForSelectedImmunzation: details.catchUpTime,
    //     descriptionForSelectedImmunzation: details.description,
    //     sideEffectsForSelectedImmunzation: details.sideEffects,
    //     minimumAgeForSelectedImmunzation: details.minimumAge,
    //     currentAge: this.props.route.params.data.age,
    //     notificationTimeList: [],
    //     creationDate: new Date()
    //   })
    // }

    this.setState({
      upcomingImmunizationList: upcomingImmunizationList,
      pastImmunizationList: pastImmunizationList,
    });

    this.updateProfileData();
  };

  async deleteRecommendedImmunization(immunization) {
    try {
      var profiles = await AsyncStorage.getItem("profiles");
      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }
      var vaccinations = profiles[this.props.route.params.index].vaccinations;
      var index = vaccinations.findIndex(
        (vaccination) =>
          vaccination.immunization === immunization &&
          vaccination.type == "recommended"
      );

      for (var p = 0; p < vaccinations[index].notificationIdList.length; p++) {
        PushNotification.cancelLocalNotifications({
          id: vaccinations[index].notificationIdList[p],
        });
      }

      if (index !== -1) {
        vaccinations.splice(index, 1);
      }
      profiles[this.props.route.params.index].vaccinations = vaccinations;

      this.props.route.params.data.vaccinations = vaccinations;

      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));

      this.getData();
    } catch (e) {
      // error reading value
      console.log("deleteRecommendedImmunization error", e);
    }
  }

  getNextImmunizationDate(immunization) {
    var nextImmunizationDate = Moment(new Date()).format("MMM DD, YYYY");
    var today = new Date();
    var olday = new Date(this.props.route.params.data.birthDate);
    var ageInMonth = Home.monthDiff(olday, today);

    console.log("ageInMonth", ageInMonth);

    if (immunization == "Hepatitis B (HepB)") {
      if (ageInMonth < 1) {
        nextImmunizationDate = "Immediately";
      } else if (ageInMonth >= 1 && ageInMonth <= 2) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 1
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 2
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 3 && ageInMonth <= 18) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 6
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 18
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 18) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (
      immunization == "Diphtheria, tetanus, and acellular pertussis (DTaP)"
    ) {
      if (ageInMonth < 3) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 2
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 3 && ageInMonth <= 4) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 4
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 5 && ageInMonth <= 6) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 6
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 7 && ageInMonth <= 18) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 15
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 18
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 19 && ageInMonth <= 72) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 48
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 72
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 72) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Haemophilus influenzae type b (Hib)") {
      if (ageInMonth < 3) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 2
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 3 && ageInMonth <= 4) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 4
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 5 && ageInMonth <= 6) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 6
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 7 && ageInMonth <= 15) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 12
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 15
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 15) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Polio (IPV)") {
      if (ageInMonth < 3) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 2
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 3 && ageInMonth <= 4) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 4
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 5 && ageInMonth <= 18) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 6
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 18
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 19 && ageInMonth <= 72) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 48
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 72
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 72) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Pneumococcal (PCV)") {
      if (ageInMonth < 3) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 2
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 3 && ageInMonth <= 4) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 4
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 5 && ageInMonth <= 6) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 6
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 7 && ageInMonth <= 15) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 12
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 15
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 15) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Rotavirus (RV)") {
      if (ageInMonth < 3) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 2
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 3 && ageInMonth <= 4) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 4
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 5 && ageInMonth <= 6) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 6
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 6) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Influenza (flu)") {
      nextImmunizationDate =
        "Use any influenza vaccine appropriate for age and health status annually";
    } else if (immunization == "Chickenpox (Varicella)") {
      if (ageInMonth <= 15) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 12
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 15
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 16 && ageInMonth <= 72) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 48
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 72
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 72) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Hepatitis A (HepA)") {
      if (ageInMonth <= 18) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 12
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 18
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 19) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 19
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 25
            )
          ).format("MMM, YYYY");
      }
    } else if (immunization == "Measles, Mumps, Rubella (MMR)") {
      if (ageInMonth <= 15) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 12
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 15
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 16 && ageInMonth <= 72) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 48
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 72
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 72) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Meningococcal conjugate vaccine") {
      nextImmunizationDate = "Consult a physician";
    } else if (immunization == "HPV vaccine") {
      if (ageInMonth <= 144) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 132
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 144
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 144 && ageInMonth <= 540) {
        nextImmunizationDate =
          "Till " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 540
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 540) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (
      immunization == "Tetanus, diphtheria, & acellular pertussis (Tdap)"
    ) {
      nextImmunizationDate =
        "Between " +
        Moment(
          new Date(this.props.route.params.data.birthDate).setMonth(
            olday.getMonth() + 132
          )
        ).format("MMM, YYYY") +
        " and " +
        Moment(
          new Date(this.props.route.params.data.birthDate).setMonth(
            olday.getMonth() + 144
          )
        ).format("MMM, YYYY");
    } else if (immunization == "Tetanus, diphtheria (Td)") {
      nextImmunizationDate =
        "If previously did not receive Tdap at or after age 11 years receive 1 dose Tdap, then Td or Tdap every 10 years";
    } else if (immunization == "Pneumococcal vaccines") {
      if (ageInMonth < 3) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 2
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 3 && ageInMonth <= 4) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 4
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 5 && ageInMonth <= 6) {
        nextImmunizationDate =
          "In " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 6
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth >= 7 && ageInMonth <= 15) {
        nextImmunizationDate =
          "Between " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 12
            )
          ).format("MMM, YYYY") +
          " and " +
          Moment(
            new Date(this.props.route.params.data.birthDate).setMonth(
              olday.getMonth() + 15
            )
          ).format("MMM, YYYY");
      } else if (ageInMonth > 15) {
        console.log("out of age");
        this.deleteRecommendedImmunization(immunization);
      }
    } else if (immunization == "Zoster vaccine") {
      nextImmunizationDate = "Age 50 years or older: 2-dose series";
    }

    return nextImmunizationDate;
  }

  updateProfileData = async () => {
    try {
      var profiles = await AsyncStorage.getItem("profiles");
      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }

      var selectedProfile = profiles[this.props.route.params.index];
      for (var j = 0; j < selectedProfile.vaccinations.length; j++) {
        if (selectedProfile.vaccinations[j].unread) {
          selectedProfile.vaccinations[j].unread = false;
        }
      }
      selectedProfile.unread = false;
      profiles[this.props.route.params.index] = selectedProfile;

      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));

      if (this.props.route.params.getData) {
        this.props.route.params.getData();
      }
    } catch (e) {
      // saving error
      console.log("AsyncStorage error", e);
    }
  };

  async exportAsPdf(records, title) {
    // // const docsDir = await PDFLib.getDocumentsDirectory();
    // const docsDir = "/storage/emulated/0";
    // const pdfPath = `${docsDir}/PocketVax` + new Date().getTime() + ".pdf";
    // console.log("pdfPath", pdfPath);
    // const page1 = PDFPage
    // .create()
    // .setMediaBox(200, 200)
    // .drawText(title, {
    //   x: 5,
    //   y: 235,
    //   color: '#000000',
    // })
    // for (var i = 0; i < records.length; i++) {
    //   page1
    //   .drawText("Name of Vaccine: " + records[i].immunization, {
    //     x: 5,
    //     y: 235,
    //     color: '#000000',
    //   })
    //   .drawText("Recommended Age: " + records[i].recommendedTime, {
    //     x: 5,
    //     y: 235,
    //     color: '#000000',
    //   })
    //   .drawText("Catch-up Time: " + records[i].catchUpTime, {
    //     x: 5,
    //     y: 235,
    //     color: '#000000',
    //   })
    // }
    //
    // PDFDocument
    // .create(pdfPath)
    // .addPages(page1)
    // .write() // Returns a promise that resolves with the PDF's path
    // .then(path => {
    //   console.log('PDF created at: ' + path);
    //   // Do stuff with your shiny new PDF!
    // });

    var text = "<div><br/><br/><h1>" + title + "</h1>" + "<br/><br/>";
    text =
      text +
      "<h2>Name of profile: " +
      this.props.route.params.data.firstName +
      " " +
      this.props.route.params.data.lastName +
      "</h2><h2>Date of birth: " +
      this.props.route.params.data.birthDate +
      "</h2><h2>Sex: " +
      (this.props.route.params.data.gender == "F" ? "Female" : "Male") +
      "</h2><br/><br/>";

    if (title == "Recommended Immunizations") {
      for (var i = 0; i < records.length; i++) {
        // text = text + '<div style="border : 1px solid black; padding: 20px; margin-bottom: 20px;"><h2>Name of Vaccine</h2>' + '<h3>' + records[i].immunization + '</h3>' + '<br/><h2>Recommended Time</h2>' + '<h3>' + records[i].recommendedTimeForSelectedImmunzation + '</h3>' + '<br/><h2>Catch-up Time</h2>' + '<h3>' + records[i].catchUpTime + '</h3></div>';
        // text = text + '<div style="border : 1px solid black; padding: 20px; margin-bottom: 20px;"><h2>Name of Vaccine</h2>' + '<h3>' + records[i].immunization + '</h3>' + '<br/><h2>Recommended Time</h2>' + '<h3>' + records[i].recommendedTimeForSelectedImmunzation + '</h3>' + '<br/><h2>Catch-up Time</h2>' + '<h3>' + records[i].catchUpTime + '</h3></div>';
        text = text + "<h2>" + "• " + records[i].immunization + "</h2>";
      }
    } else {
      for (var i = 0; i < records.length; i++) {
        // text = text + '<div style="border : 1px solid black; padding: 20px; margin-bottom: 20px;"><h2>Name of Vaccine</h2>' + '<h3>' + records[i].immunization + '</h3>' + '<br/><h2>Date of Immunization</h2>' + '<h3>' + records[i].date + " (" + records[i].currentAge + ")" + '</h3>' + '<br/><h2>Recommended Time</h2>' + '<h3>' + records[i].recommendedTimeForSelectedImmunzation + '</h3>' + '<br/><h2>Dose Number</h2>' + '<h3>' + records[i].typeOfImmunization + '</h3></div>';
        // text = text + '<div style="border : 1px solid black; padding: 20px; margin-bottom: 20px;"><h2>Name of Vaccine</h2>' + '<h3>' + records[i].immunization + '</h3>' + '<br/><h2>Date of Immunization</h2>' + '<h3>' + records[i].date + " (" + records[i].currentAge + ")" + '</h3>' + '</div>';
        // text = text + '<div style="border : 1px solid black; padding: 20px; margin-bottom: 20px;"><h2>Name of Vaccine</h2>' + '<h3>' + records[i].immunization + '</h3>' + '<br/><h2>Date of Immunization</h2>' + '<h3>';
        text =
          text +
          "<div>" +
          "<h3>" +
          records[i].immunization +
          "</h3>" +
          "<h3>Dates on file: ";
        for (var j = 0; j < records[i].date.length; j++) {
          // text = text + ((j == 0) ? '' : ', ') + records[i].date[j] + " (" + records[i].currentAge[j] + ")";
          text =
            text +
            (j == 0 ? "" : ", ") +
            Moment(new Date(records[i].date[j])).format("MM/DD/YYYY");
        }
        text = text + "</h3><br/>" + "</div>";
      }
    }

    text = text + "</div>";

    let options = {
      html: text,
      fileName: "PocketVax" + new Date().getTime(),
      directory: "Documents",
    };

    let file = await RNHTMLtoPDF.convert(options);
    console.log("PDF created at: " + file.filePath);

    var today = new Date();
    var olday = new Date(this.props.route.params.data.birthDate);
    var age = Number((today.getTime() - olday.getTime()) / 31536000000).toFixed(
      0
    );
    var immunizationList = Home.getImmunizationListAccordingToAge(age);
    var list = "";

    for (var i = 0; i < immunizationList.length; i++) {
      list = list + "• " + immunizationList[i].label + "\n";
    }

    var message = "";
    if (title == "Recommended Immunizations") {
      message =
        "Dear " +
        this.props.route.params.data.firstName +
        " " +
        this.props.route.params.data.lastName +
        "," +
        "\n\n" +
        "According to your profile:" +
        "\n\n" +
        "The Centers for Disease Control and Prevention (CDC) recommend the following immunizations for " +
        (age <= 13 ? "children" : "people") +
        " between " +
        Home.getAgeGroup(age) +
        " years of age:" +
        "\n\n" +
        list +
        (age <= 13
          ? "\n" +
            "** Influenza (flu) - babies 6 months and older should receive a flu vaccination every flu season"
          : "") +
        "\n\n" +
        "Thank you," +
        "\n" +
        "PocketVax Team";
    }

    Share.open({
      url: "file://" + file.filePath,
      message: message,
    })
      .then((res) => {
        console.log("Share res", res);
      })
      .catch((err) => {
        err && console.log("Share err", err);
      });
  }

  async deleteVaccination(vaccination_id) {
    try {
      var profiles = await AsyncStorage.getItem("profiles");
      if (profiles == null) {
        profiles = [];
      } else {
        profiles = JSON.parse(profiles);
      }
      var vaccinations = profiles[this.props.route.params.index].vaccinations;
      var index = vaccinations.findIndex(
        (vaccination) => vaccination.vaccination_id === vaccination_id
      );

      for (var p = 0; p < vaccinations[index].notificationIdList.length; p++) {
        PushNotification.cancelLocalNotifications({
          id: vaccinations[index].notificationIdList[p],
        });
      }

      if (index !== -1) {
        vaccinations.splice(index, 1);
      }
      profiles[this.props.route.params.index].vaccinations = vaccinations;

      this.props.route.params.data.vaccinations = vaccinations;

      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));

      this.getData();
    } catch (e) {
      // error reading value
      console.log("deleteVaccination error", e);
    }
  }

  changeTooltipState(type, index, value) {
    if (type == "past") {
      let { toolTipVisiblePast } = this.state;
      toolTipVisiblePast[index] = value;
      this.setState({
        toolTipVisiblePast,
      });
    } else {
      let { toolTipVisibleUpcoming } = this.state;
      toolTipVisibleUpcoming[index] = value;
      this.setState({
        toolTipVisibleUpcoming,
      });
    }
  }

  renderImmunizationItem(item, index, type) {
    return (
      <View style={{ width: width }}>
        <View style={styles.profileRow}>
          <View style={styles.immunizationView}>
            <View style={styles.immunizationTextView}>
              <Text
                style={[
                  styles.immunizationText,
                  { fontFamily: Home.Font_Montserrat_Bold },
                ]}
              >
                {item.immunization}
              </Text>
              {/*(item.unread) &&
                <View style={{backgroundColor: 'rgb(253, 160, 55)', height: 10, width: 10, borderRadius: 5, marginLeft: 5, alignSelf: 'center'}}>
                </View>
              */}
            </View>
            {/*<Tooltip skipAndroidStatusBar={true} popover={<Text style={{fontFamily: Home.Font_Montserrat_Light}}>{item.description}</Text>} overlayColor={'rgba(0, 0, 0, 0)'} backgroundColor={'white'} height={null} width={width - 100}>
              <View style={styles.infoView}>
                <Image source={require('./images/info.png')} style={styles.info}/>
              </View>
            </Tooltip>*/}
            <Tooltip
              isVisible={
                type == "past"
                  ? this.state.toolTipVisiblePast[index]
                  : this.state.toolTipVisibleUpcoming[index]
              }
              content={
                <Text style={{ fontFamily: Home.Font_Montserrat_Light }}>
                  * {item.description}
                </Text>
              }
              placement={index == 0 && type == "past" ? "bottom" : "top"}
              showChildInTooltip={false}
              backgroundColor={"transparent"}
              onClose={() => {
                this.changeTooltipState(type, index, false);
              }}
            >
              <TouchableOpacity
                style={styles.infoView}
                onPress={() => {
                  this.changeTooltipState(type, index, true);
                }}
              >
                <Image
                  source={require("./images/info.png")}
                  style={styles.info}
                />
              </TouchableOpacity>
            </Tooltip>
            {/*<Text style={{fontStyle: 'italic', color:'#CB8B30', fontFamily: Home.Font_Montserrat_Bold}}>{item.notificationDate ? Moment(new Date(item.notificationDate)).format('MMM DD, YYYY') : (item.creationDate) ? Moment(new Date(item.creationDate)).format('MMM DD, YYYY') : Moment(new Date()).format('MMM DD, YYYY')}</Text>*/}
          </View>
          {/*(type == 'upcoming') &&
            <Text style={{ color:'white', marginRight: 10, fontSize: width/30,marginLeft:15, marginTop: -5, fontFamily: Home.Font_Montserrat_Medium}}>Next Immunization Date - {(item.type == 'recommended') ? this.getNextImmunizationDate(item.immunization) : item.date}</Text>
          */}
          {/*(type == 'upcoming') &&
            <Text style={{ marginRight:15,color:'white', fontSize: width/30, marginLeft:15,marginTop:10, marginBottom:15, fontFamily: Home.Font_Montserrat_Medium}}>{item.description}</Text>
          */}
          {type == "past" && (
            <Text
              style={[
                styles.datesView,
                { fontFamily: Home.Font_Montserrat_Medium },
              ]}
            >
              {item.date instanceof Array ? (
                item.date.map((date, index) => {
                  return (
                    <Text
                      style={[
                        styles.datesText,
                        { fontFamily: Home.Font_Montserrat_Medium },
                      ]}
                    >
                      {(index == 0 ? "" : ",") +
                        " " +
                        Moment(new Date(date)).format("MM/DD/YYYY")}
                    </Text>
                  );
                })
              ) : (
                <Text
                  style={[
                    styles.datesText,
                    { fontFamily: Home.Font_Montserrat_Medium },
                  ]}
                >
                  {" " + Moment(new Date(item.date)).format("MM/DD/YYYY")}
                </Text>
              )}
            </Text>
          )}
          {type == "past" && (
            <TouchableOpacity
              style={[styles.otherButtons]}
              onPress={() => {
                Alert.alert(
                  "Delete Immunization",
                  "Are you sure you want to delete this immunization?",
                  [
                    {
                      text: "No",
                    },
                    {
                      text: "Yes",
                      onPress: () =>
                        this.deleteVaccination(item.vaccination_id),
                    },
                  ],
                  { cancelable: false }
                );
              }}
            >
              <View style={styles.deleteButtonView}>
                <Text
                  style={[
                    styles.deleteButtonText,
                    { fontFamily: Home.Font_Montserrat_Medium },
                  ]}
                >
                  DELETE
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={"#4A5C5C"} barStyle={"dark-content"} />
        <View style={styles.container}>
          <Image
            source={require("./images/anesthesia_export_records.png")}
            style={styles.anesthesiaImage}
          />
          <View
            style={[
              styles.header,
              {
                marginTop: this.props.route.params.from == "Home" ? 20 : 0,
                marginBottom: 40,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => {
                this.props.navigation.goBack();
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
                      { fontFamily: Home.Font_Montserrat_Medium },
                    ]}
                  >
                    Pocket
                  </Text>
                  <Text
                    style={[
                      styles.vaxText,
                      { fontFamily: Home.Font_Montserrat_Bold },
                    ]}
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
              adjustsFontSizeToFit
              numberOfLines={Platform.OS == "ios" ? 1 : 2}
              style={[
                styles.exportTitle,
                { fontFamily: Home.Font_Montserrat_Bold },
              ]}
            >
              {this.props.route.params.from == "ExportRecords"
                ? "Export Records"
                : "Immunization Summary"}
            </Text>
          </View>

          {/*<Text style= {{ alignSelf:'center', textAlign: 'center', marginTop:20,color:'white', marginBottom: 30, fontSize: width/26.5, fontFamily: Home.Font_Montserrat_Bold}}>{this.props.route.params.from == 'ExportRecords' ? 'Summary - ' : ''}{this.props.route.params.data.firstName} {this.props.route.params.data.lastName}</Text>*/}

          <ScrollView>
            <View
              adjustsFontSizeToFit
              numberOfLines={Platform.OS == "ios" ? 1 : 2}
              style={styles.summaryView}
            >
              <Text
                style={[
                  styles.nameText,
                  { fontFamily: Home.Font_Montserrat_ExtraBold },
                ]}
              >
                {this.props.route.params.data.firstName}{" "}
                {this.props.route.params.data.lastName}
              </Text>
              {this.state.pastImmunizationList.length > 0 && (
                <TouchableOpacity
                  style={{ marginTop: 15 }}
                  onPress={() => {
                    this.exportAsPdf(
                      this.state.pastImmunizationList,
                      "Immunization Summary"
                    );
                  }}
                >
                  <View style={styles.exportButtonView}>
                    <Text
                      style={[
                        styles.exportButtonText,
                        { fontFamily: Home.Font_Montserrat_Medium },
                      ]}
                    >
                      EXPORT
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/*<View style = {{flexDirection:'row', justifyContent: 'space-between', paddingLeft:30, paddingRight: 30, paddingBottom: 30,}}>
              <Text style ={{color:'white', marginRight: 80, fontSize: width/26.5, fontFamily: Home.Font_Montserrat_Medium}}>Past Immunizations</Text>
              <TouchableOpacity onPress={() => {
                this.exportAsPdf(this.state.pastImmunizationList, "Past Immunizations")
              }}>
              <View style = {{backgroundColor:'#6C893D', borderRadius:30, position: 'absolute', right: 0}}>
                <Text style={{fontSize: width/40,textAlign:'center', marginTop:4, marginBottom: 4, marginLeft: 15, marginRight: 15, color:'white', fontFamily: Home.Font_Montserrat_Medium}}>EXPORT</Text>
              </View>

              </TouchableOpacity>

            </View>*/}

            {this.state.pastImmunizationList.length > 0 ? (
              <FlatList
                extraData={this.state}
                contentContainerStyle={styles.listContainerStyle}
                style={{ flexGrow: 0 }}
                data={this.state.pastImmunizationList}
                renderItem={({ item, index }) =>
                  this.renderImmunizationItem(item, index, "past")
                }
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <View>
                <View style={styles.line}></View>
                <Text
                  style={[
                    styles.noImmunizationText,
                    { fontFamily: Home.Font_Montserrat_Medium },
                  ]}
                >
                  No Immunization Summary Available
                </Text>
              </View>
            )}

            <View style={styles.recommendedImmunizationView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={Platform.OS == "ios" ? 1 : 2}
                style={[
                  styles.nameText,
                  { fontFamily: Home.Font_Montserrat_ExtraBold },
                ]}
              >
                * Recommended Immunizations
              </Text>
              {this.state.upcomingImmunizationList.length > 0 && (
                <TouchableOpacity
                  style={{ marginTop: 15 }}
                  onPress={() => {
                    this.exportAsPdf(
                      this.state.upcomingImmunizationList,
                      "Recommended Immunizations"
                    );
                  }}
                >
                  <View style={styles.exportButtonView}>
                    <Text
                      style={[
                        styles.exportButtonText,
                        { fontFamily: Home.Font_Montserrat_Medium },
                      ]}
                    >
                      EXPORT
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {this.state.upcomingImmunizationList.length > 0 ? (
              <FlatList
                extraData={this.state}
                style={{ marginBottom: 30, flexGrow: 0 }}
                contentContainerStyle={styles.listContainerStyle}
                data={this.state.upcomingImmunizationList}
                renderItem={({ item, index }) =>
                  this.renderImmunizationItem(item, index, "upcoming")
                }
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <View>
                <View style={styles.line}></View>
                <Text style={[styles.noImmunizationText, { marginBottom: 30 }]}>
                  No Recommended Immunizations Available
                </Text>
              </View>
            )}

            <View style={[styles.linkView, { flexDirection: "row" }]}>
              <Text style={[styles.link, { marginRight: 5 }]}>*</Text>
              <Text
                style={[styles.link, { textDecorationLine: "underline" }]}
                onPress={() =>
                  Linking.openURL(
                    "https://www.cdc.gov/vaccines/schedules/index.html"
                  )
                }
              >
                https://www.cdc.gov/vaccines/schedules/index.html
              </Text>
            </View>

            <View style={[styles.linkView, { marginBottom: 30 }]}>
              <Text style={[styles.link, { marginTop: 5 }]}>
                * As recommended by the CDC:
              </Text>
              <Text
                style={[
                  styles.link,
                  { textDecorationLine: "underline", marginLeft: 10 },
                ]}
                onPress={() =>
                  Linking.openURL(
                    "https://www.cdc.gov/vaccines/vpd/vaccines-age.html"
                  )
                }
              >
                https://www.cdc.gov/vaccines/vpd/vaccines-age.html
              </Text>
            </View>
          </ScrollView>
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
  homeButton: {
    marginTop: 5,
    alignSelf: "flex-start",
  },
  profileRow: {
    marginTop: 10,
    width: width - 60,
    alignSelf: "center",
    backgroundColor: "#546868DD",
  },
  otherButtons: {
    borderRadius: 5,
    marginTop: 5,
    alignItems: "flex-end",
    marginRight: 20,
    marginBottom: 15,
  },
  line: {
    height: 1,
    backgroundColor: "white",
    marginLeft: 30,
    marginRight: 30,
    marginTop: -10,
    marginBottom: 20,
  },
  info: {
    height: 17,
    width: 17,
    resizeMode: "contain",
  },
  immunizationView: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  immunizationTextView: {
    flexDirection: "row",
    width: "90%",
  },
  immunizationText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width / 27,
  },
  datesView: {
    color: "white",
    marginRight: 10,
    fontSize: width / 32,
    marginLeft: 15,
    marginTop: -5,
  },
  datesText: {
    color: "white",
    marginRight: 10,
    fontSize: width / 32,
    marginLeft: 15,
    marginTop: -5,
  },
  deleteButtonView: {
    backgroundColor: "#6F8A8A",
    borderRadius: 30,
    marginRight: -5,
  },
  deleteButtonText: {
    fontSize: width / 50,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 10,
    marginRight: 10,
    color: "white",
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
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 5,
    color: "white",
    fontSize: width / 22,
  },
  summaryView: {
    flexDirection: "column",
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: "center",
  },
  nameText: {
    color: "white",
    fontSize: width / 24,
  },
  exportButtonView: {
    backgroundColor: "#82A1A1",
    borderRadius: 30,
  },
  exportButtonText: {
    fontSize: width / 40,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 15,
    marginRight: 15,
    color: "white",
  },
  listContainerStyle: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  noImmunizationText: {
    fontSize: width / 26.5,
    color: "white",
    textAlign: "center",
    alignSelf: "center",
    marginLeft: 30,
    marginRight: 30,
  },
  recommendedImmunizationView: {
    flexDirection: "column",
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 30,
    alignItems: "center",
  },
  infoView: {
    height: 20,
    width: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  linkView: {
    marginLeft: 30,
    marginRight: 30,
  },
  link: {
    fontSize: width / 26.5,
    color: "white",
  },
});
