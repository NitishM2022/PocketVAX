// export default function CreateProfileSheet() {
//   return (
//     <Animated.View style={[styles.profileRow, { transform: [{ translateX }] }]}>
//       <Image
//         style={styles.profileImage}
//         source={
//           item.profileImage == ""
//             ? require("./images/user.png")
//             : { uri: item.profileImage }
//         }
//       />
//       <View style={styles.nameView}>
//         <Text style={[styles.name, { fontFamily: "Montserrat_Bold" }]}>
//           {item.firstName + " " + item.lastName}
//         </Text>
//         <View style={styles.buttonsView}>
//           {/*<Text style = {{marginTop:10, color:'white', fontSize: width/35, flex: 1, marginRight: 5, fontFamily: 'Montserrat_Medium'}}>{Moment(item.birthDate).format('MMM DD, YYYY')}</Text>*/}
//           <View style={styles.buttonsInnerView}>
//             <TouchableOpacity
//               style={[styles.otherButtons, { marginTop: 8 }]}
//               onPress={() => {
//                 // this.props.navigation.navigate("AddProfile", {data: item, index: index, getData: this.getData});
//                 this.setState({
//                   addProfileModal: true,
//                   profileImage: item.profileImage,
//                   firstName: item.firstName,
//                   lastName: item.lastName,
//                   birthDate: item.birthDate,
//                   selectedGender: item.gender,
//                   indexOfEdit: index,
//                 });
//               }}
//             >
//               <View style={styles.editButtonViewOfProfile}>
//                 <Text
//                   style={[
//                     styles.buttonsTextOfProfile,
//                     { fontFamily: "Montserrat_Medium" },
//                   ]}
//                 >
//                   EDIT
//                 </Text>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.otherButtons, { marginTop: 8, marginLeft: -1 }]}
//               onPress={() => {
//                 Alert.alert(
//                   "Delete Profile",
//                   "Are you sure you want to delete this profile?",
//                   [
//                     {
//                       text: "No",
//                     },
//                     { text: "Yes", onPress: () => this.deleteProfile(index) },
//                   ],
//                   { cancelable: false }
//                 );
//               }}
//             >
//               <View style={styles.deleteView}>
//                 <Text
//                   style={[
//                     styles.buttonsTextOfProfile,
//                     { fontFamily: "Montserrat_Medium" },
//                   ]}
//                 >
//                   DELETE
//                 </Text>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.otherButtons, { marginTop: 1, marginLeft: -5 }]}
//               onPress={() => {
//                 this.props.navigationProps.navigation.navigate(
//                   "SummaryRecords",
//                   { data: item, index: index, from: "ManageProfile" }
//                 );
//               }}
//             >
//               <View style={styles.summaryView}>
//                 <Text
//                   style={[
//                     styles.buttonsTextOfProfile,
//                     { fontFamily: "Montserrat_Medium" },
//                   ]}
//                 >
//                   SUMMARY
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Animated.View>
//   );
// }
