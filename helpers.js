var PushNotification = require("react-native-push-notification");
import AsyncStorage from "@react-native-async-storage/async-storage";

export function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

export function getAge(dob) {
  var now = new Date();
  var yearNow = now.getYear();
  var monthNow = now.getMonth();
  var dateNow = now.getDate();

  var yearDob = dob.getYear();
  var monthDob = dob.getMonth();
  var dateDob = dob.getDate();
  var age = {};
  var ageString = "";
  var yearString = "";
  var monthString = "";
  var dayString = "";

  var yearAge = yearNow - yearDob;

  if (monthNow >= monthDob) var monthAge = monthNow - monthDob;
  else {
    yearAge--;
    var monthAge = 12 + monthNow - monthDob;
  }

  if (dateNow >= dateDob) var dateAge = dateNow - dateDob;
  else {
    monthAge--;
    var dateAge = 31 + dateNow - dateDob;

    if (monthAge < 0) {
      monthAge = 11;
      yearAge--;
    }
  }

  age = {
    years: yearAge,
    months: monthAge,
    days: dateAge,
  };

  if (age.years > 1) yearString = " Years";
  else yearString = " Year";
  if (age.months > 1) monthString = " Months";
  else monthString = " Month";
  if (age.days > 1) dayString = " Days";
  else dayString = " Day";

  if (age.years > 0 && age.months > 0 && age.days > 0)
    ageString = age.years + yearString;
  else if (age.years == 0 && age.months == 0 && age.days > 0)
    ageString = age.days + dayString;
  else if (age.years > 0 && age.months == 0 && age.days == 0)
    ageString = age.years + yearString;
  else if (age.years > 0 && age.months > 0 && age.days == 0)
    ageString = age.years + yearString;
  else if (age.years == 0 && age.months > 0 && age.days > 0)
    ageString = age.months + monthString;
  else if (age.years > 0 && age.months == 0 && age.days > 0)
    ageString = age.years + yearString;
  else if (age.years == 0 && age.months > 0 && age.days == 0)
    ageString = age.months + monthString;
  else ageString = "0 Years";

  // if ( (age.years > 0) && (age.months > 0) && (age.days > 0) )
  //   ageString = age.years + yearString + ", " + age.months + monthString + ", and " + age.days + dayString + " old.";
  // else if ( (age.years == 0) && (age.months == 0) && (age.days > 0) )
  //   ageString = "Only " + age.days + dayString + " old!";
  // else if ( (age.years > 0) && (age.months == 0) && (age.days == 0) )
  //   ageString = age.years + yearString + " old. Happy Birthday!!";
  // else if ( (age.years > 0) && (age.months > 0) && (age.days == 0) )
  //   ageString = age.years + yearString + " and " + age.months + monthString + " old.";
  // else if ( (age.years == 0) && (age.months > 0) && (age.days > 0) )
  //   ageString = age.months + monthString + " and " + age.days + dayString + " old.";
  // else if ( (age.years > 0) && (age.months == 0) && (age.days > 0) )
  //   ageString = age.years + yearString + " and " + age.days + dayString + " old.";
  // else if ( (age.years == 0) && (age.months > 0) && (age.days == 0) )
  //   ageString = age.months + monthString + " old.";
  // else ageString = "Oops! Could not calculate age!";

  return ageString;
}

export function getImmunizationListAccordingToAge(year) {
  if (year <= 1) {
    return [
      { label: "Hepatitis B (HepB)", value: "Hepatitis B (HepB)" },
      {
        label: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
        value: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
      },
      {
        label: "Haemophilus influenzae type b (Hib)",
        value: "Haemophilus influenzae type b (Hib)",
      },
      { label: "Polio (IPV)", value: "Polio (IPV)" },
      { label: "Pneumococcal (PCV)", value: "Pneumococcal (PCV)" },
      { label: "Rotavirus (RV)", value: "Rotavirus (RV)" },
      { label: "Influenza (flu)", value: "Influenza (flu)" },
    ];
  } else if (year >= 1 && year <= 2) {
    return [
      { label: "Chickenpox (Varicella)", value: "Chickenpox (Varicella)" },
      {
        label: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
        value: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
      },
      {
        label: "Haemophilus influenzae type b (Hib)",
        value: "Haemophilus influenzae type b (Hib)",
      },
      {
        label: "Measles, Mumps, Rubella (MMR)",
        value: "Measles, Mumps, Rubella (MMR)",
      },
      { label: "Polio (IPV)", value: "Polio (IPV)" },
      { label: "Pneumococcal (PCV)", value: "Pneumococcal (PCV)" },
      { label: "Hepatitis A (HepA)", value: "Hepatitis A (HepA)" },
      { label: "Hepatitis B (HepB)", value: "Hepatitis B (HepB)" },
      { label: "Influenza (flu)", value: "Influenza (flu)" },
    ];
  } else if (year >= 2 && year <= 3) {
    return [{ label: "Influenza (flu)", value: "Influenza (flu)" }];
  } else if (year >= 4 && year <= 6) {
    return [
      {
        label: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
        value: "Diphtheria, tetanus, and acellular pertussis (DTaP)",
      },
      { label: "Polio (IPV)", value: "Polio (IPV)" },
      {
        label: "Measles, Mumps, Rubella (MMR)",
        value: "Measles, Mumps, Rubella (MMR)",
      },
      { label: "Chickenpox (varicella)", value: "Chickenpox (varicella)" },
      { label: "Influenza (flu)", value: "Influenza (flu)" },
    ];
  } else if (year >= 7 && year <= 10) {
    return [{ label: "Influenza (flu)", value: "Influenza (flu)" }];
  } else if (year >= 11 && year <= 12) {
    return [
      {
        label: "Meningococcal conjugate vaccine",
        value: "Meningococcal conjugate vaccine",
      },
      { label: "HPV vaccine", value: "HPV vaccine" },
      {
        label: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
        value: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
      },
      { label: "Influenza (flu)", value: "Influenza (flu)" },
    ];
  } else if (year >= 13 && year <= 18) {
    return [{ label: "Influenza (flu)", value: "Influenza (flu)" }];
  } else if (year >= 19 && year <= 26) {
    return [
      { label: "HPV vaccine", value: "HPV vaccine" },
      {
        label: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
        value: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
      },
      {
        label: "Tetanus, diphtheria (Td)",
        value: "Tetanus, diphtheria (Td)",
      },
      { label: "Influenza (flu)", value: "Influenza (flu)" },
    ];
  } else if (year >= 27 && year <= 60) {
    return [
      { label: "Influenza (flu)", value: "Influenza (flu)" },
      {
        label: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
        value: "Tetanus, diphtheria, & acellular pertussis (Tdap)",
      },
      {
        label: "Tetanus, diphtheria (Td)",
        value: "Tetanus, diphtheria (Td)",
      },
      { label: "Zoster vaccine", value: "Zoster vaccine" },
    ];
  } else if (year > 60) {
    return [
      { label: "Pneumococcal vaccines", value: "Pneumococcal vaccines" },
      { label: "Zoster vaccine", value: "Zoster vaccine" },
    ];
  }
}

export function getAgeGroup(year) {
  if (year <= 1) {
    return "0-1";
  } else if (year >= 1 && year <= 2) {
    return "1-2";
  } else if (year >= 2 && year <= 3) {
    return "2-3";
  } else if (year >= 4 && year <= 6) {
    return "4-6";
  } else if (year >= 7 && year <= 10) {
    return "7-10";
  } else if (year >= 11 && year <= 12) {
    return "11-12";
  } else if (year >= 13 && year <= 18) {
    return "13-18";
  } else if (year >= 19 && year <= 26) {
    return "19-26";
  } else if (year >= 27 && year <= 60) {
    return "27-60";
  } else if (year > 60) {
    return "60+";
  }
}

export function getImmunizationDetails(immunization) {
  var recommendedTime = "",
    catchUpTime = "",
    description = "",
    sideEffects = "",
    minimumAge = "";

  if (immunization == "Hepatitis B (HepB)") {
    minimumAge = "Birth";
    recommendedTime = "3-dose series at 0, 1–2, 6–18 months";
    catchUpTime = "4 mos and 19 mos +";
    description =
      "Prevents Hepatitis B, a liver disease that may cause scarring of the organ, liver failure, and cancer. This disease is most commonly spread by exposure to infected body fluids.";
    sideEffects =
      "Occasionally, the injection site becomes sore, and a mild fever develops. People with a history of a severe allergic reaction to baker’s yeast, which is used in the production of the hepatitis B vaccine, should not be given the vaccine.";
  } else if (
    immunization == "Diphtheria, tetanus, and acellular pertussis (DTaP)"
  ) {
    minimumAge = "6 weeks";
    recommendedTime = "5-dose series at 2, 4, 6, 15–18 months, 4–6 years";
    catchUpTime =
      "Dose 5 is not necessary if dose 4 was administered at age 4 years or older and at least 6 months after dose 3.";
    description =
      "Diphtheria usually causes inflammation of the throat and mucous membranes of the mouth. However, the bacteria that cause diphtheria produce a toxin that can damage the heart, kidneys, and nervous system. Tetanus (lockjaw) causes severe muscle spasms, which result from a toxin produced by bacteria. Pertussis (whooping cough) is a very contagious respiratory infection that is particularly dangerous to children younger than 2 years old and to people who have a weakened immune system.";
    sideEffects =
      "The injection site may become sore, swollen, and red. Serious side effects are rare.";
  } else if (immunization == "Haemophilus influenzae type b (Hib)") {
    minimumAge = "6 weeks";
    recommendedTime =
      "ActHIB, Hiberix, or Pentacel: 4-dose series at 2, 4, 6, 12–15 months. PedvaxHIB: 3-dose series at 2, 4, 12–15 months";
    catchUpTime =
      "Dose 1 at 7–11 months: Administer dose 2 at least 4 weeks later and dose 3 (final dose) at 12–15 months or 8 weeks after dose 2 (whichever is later). Unvaccinated at 15–59 months: 1 dose";
    description =
      "Protect against bacterial infections due to Hib, such as pneumonia and meningitis.";
    sideEffects =
      "Occasionally, the injection site becomes sore, swollen, and red. After being vaccinated, children may have a fever, cry, and be irritable.";
  } else if (
    immunization == "Polio (IPV)" ||
    immunization == "Inactivated poliovirus (IPV)"
  ) {
    minimumAge = "6 weeks";
    recommendedTime =
      "4-dose series at ages 2, 4, 6–18 months, 4–6 years; administer the final dose at or after age 4 years and at least 6 months after the previous dose.";
    catchUpTime =
      "In the first 6 months of life, use minimum ages and intervals only for travel to a polio-endemic region or during an outbreak.";
    description =
      "Protects against polio, or poliomyelitis. Polio destroys nerve cells in the spinal cord.";
    sideEffects =
      "People who have allergies to the antibiotics streptomycin, neomycin, or polymyxin B may have an allergic reaction to the polio vaccine.";
  } else if (
    immunization == "Pneumococcal (PCV)" ||
    immunization == "Pneumococcal conjugate (PCV13)"
  ) {
    minimumAge = "6 weeks";
    recommendedTime = "4-dose series at 2, 4, 6, 12–15 months";
    catchUpTime =
      "1 dose for healthy children age 24–59 months with any incomplete PCV13 series.";
    description =
      "Pneumococcal infections include ear infections, sinusitis, pneumonia, bloodstream infections, and meningitis.";
    sideEffects =
      "Occasionally, the injection site becomes painful and red. Other side effects include fever, irritability, drowsiness, loss of appetite, and vomiting.";
  } else if (immunization == "Rotavirus (RV)") {
    minimumAge = "6 weeks";
    recommendedTime =
      "Rotarix: 2-dose series at 2 and 4 months. RotaTeq: 3-dose series at 2, 4, and 6 months";
    catchUpTime =
      "Do not start the series on or after age 15 weeks, 0 days. The maximum age for the final dose is 8 months, 0 days.";
    description =
      "Rotavirus is a virus that infects the bowels, causing severe inflammation of the stomach and bowels. Rotavirus is the most common cause of severe diarrhea among infants and children throughout the world";
    sideEffects =
      "Infants may have mild, temporary diarrhea or vomiting. They may become irritable.";
  } else if (
    immunization == "Influenza (flu)" ||
    immunization == "Influenza (IIV)" ||
    immunization == "Influenza (LAIV)" ||
    immunization == "Influenza inactivated (IIV)" ||
    immunization == "Influenza recombinant (RIV)" ||
    immunization == "Influenza live attenuated (LAIV)"
  ) {
    minimumAge = "6 months";
    if (immunization == "Influenza (LAIV)") {
      minimumAge = "2 years";
    } else if (immunization == "Influenza recombinant (RIV)") {
      minimumAge = "18 years";
    } else if (immunization == "Influenza live attenuated (LAIV)") {
      minimumAge = "2 years";
    }

    recommendedTime =
      "Use any influenza vaccine appropriate for age and health status annually";
    if (
      immunization == "Influenza inactivated (IIV)" ||
      immunization == "Influenza recombinant (RIV)" ||
      immunization == "Influenza live attenuated (LAIV)"
    ) {
      recommendedTime = "2 doses, separated by at least 4 weeks";
    }
    catchUpTime =
      "Use any influenza vaccine appropriate for age and health status annually";
    description =
      "Influenza can be mild, causing fever, aches, and fatigue, but it can be serious. Influenza can cause severe pneumonia, worsening of chronic heart and lung disorders, organ failure, and death.";
    sideEffects =
      "Occasionally, the injection site becomes sore. Fever and muscle aches occur uncommonly.";
  } else if (immunization == "Meningococcal (MenACWY-D)") {
    minimumAge = "2 months";
    recommendedTime = "2-dose series at 11–12 years, 16 years";
    catchUpTime =
      "1st Dose at Age 13–15 years and a booster at age 16–18 years (minimum interval: 8 weeks); Age 16–18 years receive 1 dose";
    description =
      "Protects against meningitis, an infection of the tissue covering the brain.";
    sideEffects =
      "The injection site may become sore, swollen, and red. Occasionally, include headache, fatigue, fever.";
  } else if (
    immunization == "Chickenpox (Varicella)" ||
    immunization == "Varicella (VAR)"
  ) {
    minimumAge = "12 months";
    recommendedTime = "2-dose series at 12–15 months, 4–6 year";
    catchUpTime =
      "Age 7-12 years have a 2 dose series with a three-month interval. Age 13 years and older have 2 dose series with 4-8 week intervals.";
    description =
      "Protects against Chickenpox, resulting in a skin rash that forms small, itchy blisters.";
    sideEffects =
      "The varicella vaccine is very safe, and common side effects are mild.";
  } else if (immunization == "Measles, Mumps, Rubella (MMR)") {
    minimumAge = "12 months";
    recommendedTime = "2-dose series at 12–15 months, 4–6 years";
    catchUpTime =
      "Unvaccinated children and adolescents: 2-dose series at least 4 weeks apart";
    description =
      "Measles causes a rash, fever, and cough. It affects mainly children and can be very serious. It can lead to brain damage, pneumonia, and sometimes death. Mumps causes the salivary glands to swell and become painful. Mumps can affect the testes, brain, and pancreas, especially in adults. Rubella (German measles) causes a runny nose, swollen lymph nodes, and a rash with a slight reddening of the skin, especially the face.";
    sideEffects =
      "Some people have mild side effects, such as a fever, a general feeling of illness, and a rash. Joints may become temporarily stiff and painful, usually in teenage girls and women.";
  } else if (immunization == "Hepatitis A (HepA)") {
    minimumAge = "12 months";
    recommendedTime =
      "2-dose series (minimum interval: 6 months) beginning at 12 months";
    catchUpTime =
      "Unvaccinated persons through 18 years should complete a 2-dose series (minimum interval: 6 months). Persons who previously received 1 dose at age 12 months or older should receive dose 2 at least 6 months after dose 1.";
    description =
      "A often causes no symptoms, although it can cause fever, nausea, vomiting, and jaundice and, rarely, leads to severe liver failure and death.";
    sideEffects = "Sometimes the injection site is sore, red, and swollen.";
  } else if (
    immunization == "Meningococcal conjugate vaccine" ||
    immunization == "Meningococcal B (MenB)"
  ) {
    minimumAge = "10 years";
    recommendedTime = "Consult a physician";
    catchUpTime = "Consult a physician";
    description =
      "Protects against a fifth type of meningococcal bacterium (called type B).";
    sideEffects =
      "The injection site may become sore, swollen, and red. Occasionally, headache, fatigue, fever.";
  } else if (
    immunization == "Tetanus, diphtheria, & acellular pertussis (Tdap)"
  ) {
    minimumAge = "11 years";
    recommendedTime = "Adolescents age 11–12 years receive 1 dose Tdap";
    catchUpTime =
      "Adolescents age 13–18 years who have not received. Tdap should receive 1 dose, then Td or Tdap booster every 10 years. ";
    description =
      "The tetanus-diphtheria (Td) vaccine protects against toxins produced by tetanus and diphtheria bacteria, not against the bacteria itself. Typically, the tetanus bacteria enter the body through a wound and begin to grow and produce the toxin. The toxin causes severe muscle spasms and can be fatal.";
    sideEffects =
      "Sometimes the injection site is sore, swollen, and red. Serious side effects are rare.";
  } else if (immunization == "Tetanus, diphtheria (Td)") {
    minimumAge = "11 years";
    recommendedTime =
      "If previously did not receive Tdap at or after age 11 years receive 1 dose Tdap, then Td or Tdap every 10 years";
    catchUpTime = "Td or Tdap booster every 10 years";
    description =
      "The tetanus-diphtheria (Td) vaccine protects against toxins produced by tetanus and diphtheria bacteria, not against the bacteria itself. Typically, the tetanus bacteria enter the body through a wound and begin to grow and produce the toxin. The toxin causes severe muscle spasms and can be fatal.";
    sideEffects =
      "Sometimes the injection site is sore, swollen, and red. Serious side effects are rare.";
  } else if (
    immunization == "Zoster vaccine" ||
    immunization == "Zoster recombinant (Shingles) (RZV)" ||
    immunization == "Zoster live (Shingles) (ZVL)"
  ) {
    minimumAge = "50 years";
    recommendedTime = "Age 50 years or older: 2-dose series";
    catchUpTime = "Consult a physician";
    description =
      "Shingles is a painful rash that usually develops on one side of the body, often the face or torso. For some people, the pain can last for months or even years after the rash goes away.";
    sideEffects = "The injection site may become sore, swollen, and red.";
  } else if (
    immunization == "HPV vaccine" ||
    immunization == "Human papillomavirus (HPV) Sex-related"
  ) {
    minimumAge = "9 years";
    recommendedTime =
      "HPV vaccination routinely recommended at age 11–12 years, based on shared clinical decision";
    catchUpTime = "approved for adults up to Age 45";
    description =
      "Protects against infection by the strains of HPV that are most likely to cause cervical cancer, vaginal cancer, and vulvar cancer in women, penile cancer in men and anal cancer, throat cancer, and genital warts in both sexes.";
    sideEffects =
      "The injection site sometimes becomes sore, swollen, and red.";
  } else if (
    immunization == "Pneumococcal vaccines" ||
    immunization == "Pneumococcal polysaccharide (PPSV23)"
  ) {
    minimumAge = "6 weeks";
    recommendedTime = "4-dose series at 2, 4, 6, 12–15 months";
    catchUpTime =
      "1 dose for healthy children age 24–59 months with any incomplete PCV13 series.";
    description =
      "Protects against bacterial infections caused by pneumococci. Pneumococcal infections include ear infections, sinusitis, pneumonia, bloodstream infections, and meningitis.";
    sideEffects =
      "Occasionally, the injection site becomes painful and red. Occasionally, fever, irritability, drowsiness, loss of appetite, and vomiting.";
  } else if (immunization == "Anthrax Vaccine (AVA)") {
    minimumAge = "18 years";
    recommendedTime = "Exposure-related";
    catchUpTime = "Consult a physician";
    description =
      "Protects against anthrax.  Anthrax can spread throughout the body and cause severe illness, including brain infections and even death if left untreated.";
    sideEffects =
      "The injection site may become sore, swollen, and red. Other side effects include muscle ache, headache or fatigue.";
  } else if (immunization == "Japanese Encephalitis (IXIARO)") {
    minimumAge = "16 years";
    recommendedTime = "Exposure-related";
    catchUpTime = "Consult a physician";
    description =
      "Protects against the Japanese Encephalitis virus which may cause fever, headache or encephalitis (brain infection).";
    sideEffects =
      "The injection site may become sore, swollen, and red. Other side effects include muscle ache, headache or low-grade fever.";
  } else if (immunization == "Rabies Vaccine") {
    minimumAge = "Consult a physician";
    recommendedTime = "Exposure-related";
    catchUpTime = "Consult a physician";
    description =
      "Rabies is a virus that attacks the brain and nervous system. It is transmitted by a bite from a rabid animal (meaning an animal infected with rabies virus).";
    sideEffects =
      "The injection site may become sore, swollen, and red. Other side effects include muscle ache, headache or stomach pain.";
  } else if (immunization == "Smallpox Vaccine") {
    minimumAge = "18";
    recommendedTime = "Consult a physician";
    catchUpTime = "Consult a physician";
    description =
      "Protects against smallpox which develops into flu-like symptoms, patients also experience a rash that appears first on the face, hands, forearms, and then later appears on the trunk. There's no treatment or cure for smallpox.";
    sideEffects =
      "The injection site may become sore, swollen, and red. Other side effects include muscle ache, headache or fatigue.";
  } else if (immunization == "Typhoid Vaccine") {
    minimumAge = "Consult a physician";
    recommendedTime = "Exposure-related";
    catchUpTime = "Consult a physician";
    description =
      "Protects against typhoid fever, a bacterial disease spread through contaminated food and water or close contact. Symptoms include high fever, headache, belly pain, and either constipation or diarrhea.";
    sideEffects =
      "The injection site may become sore, swollen, and red. Other side effects include muscle ache, headache or fatigue.";
  } else if (immunization == "Yellow Fever Vaccine") {
    minimumAge = "9 months";
    recommendedTime = "Exposure-related";
    catchUpTime = "Consult a physician";
    description =
      "Yellow fever is a viral infection spread by a particular species of mosquito. Mild cases cause fever, headache, nausea, and vomiting. Serious cases may cause fatal heart, liver, and kidney conditions.";
    sideEffects =
      "The injection site may become sore, swollen, and red. Other side effects include muscle ache, headache or fever.";
  }

  return {
    minimumAge: minimumAge,
    recommendedTime: recommendedTime,
    catchUpTime: catchUpTime,
    description: description,
    sideEffects: sideEffects,
  };
}

export async function updateRecommndedImmunizations() {
  try {
    var profiles = await AsyncStorage.getItem("profiles");
    if (profiles == null) {
      profiles = [];
    } else {
      profiles = JSON.parse(profiles);
    }

    for (var m = 0; m < profiles.length; m++) {
      var today = new Date();
      var olday = new Date(profiles[m].birthDate);
      var ageInYear = Number(
        (today.getTime() - olday.getTime()) / 31536000000
      ).toFixed(0);
      var ageGroup = getAgeGroup(ageInYear);

      if (ageGroup !== profiles[m].ageGroup) {
        var recommendedUpcomingImmunizations =
          getImmunizationListAccordingToAge(ageInYear);
        var upcomingImmunizationList = [];

        var oldVaccinationsWithoutRecommendation = profiles[
          m
        ].vaccinations.filter(function (el) {
          return el.type !== "recommended";
        });
        var oldVaccinationsWithRecommendation = profiles[m].vaccinations.filter(
          function (el) {
            return el.type == "recommended";
          }
        );

        console.log(
          "oldVaccinationsWithoutRecommendation",
          oldVaccinationsWithoutRecommendation
        );

        for (var i = 0; i < recommendedUpcomingImmunizations.length; i++) {
          var details = getImmunizationDetails(
            recommendedUpcomingImmunizations[i].label
          );
          var todaysDate = new Date();
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
            oldVaccinationsWithoutRecommendation.length == 0
              ? 1
              : oldVaccinationsWithoutRecommendation[
                  oldVaccinationsWithoutRecommendation.length - 1
                ].vaccination_id + 1;
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
            currentAge: [getAge(new Date(profiles[m].birthDate))],
            notificationTimeList: notificationTimeList,
            notificationIdList: notificationIdList,
            creationDate: new Date(),
            type: "recommended",
          });
        }

        profiles[m].vaccinations = [
          ...oldVaccinationsWithoutRecommendation,
          ...upcomingImmunizationList,
        ];
        profiles[m].ageGroup = ageGroup;

        for (var n = 0; n < oldVaccinationsWithRecommendation.length; n++) {
          for (
            var p = 0;
            p < oldVaccinationsWithRecommendation[n].notificationIdList.length;
            p++
          ) {
            PushNotification.cancelLocalNotifications({
              id: oldVaccinationsWithRecommendation[n].notificationIdList[p],
            });
          }
        }

        for (var k = 0; k < upcomingImmunizationList.length; k++) {
          var todaysDate = new Date();
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
            PushNotification.localNotificationSchedule({
              id:
                profiles[m].profile_id +
                "" +
                upcomingImmunizationList[k].vaccination_id +
                "" +
                k +
                "" +
                l,
              title:
                "Recommended Immunization for " +
                profiles[m].firstName +
                " " +
                profiles[m].lastName,
              message: upcomingImmunizationList[k].immunization,
              vaccination_id: upcomingImmunizationList[k].vaccination_id,
              date: dateAfterMonths,
              userInfo: {
                id:
                  profiles[m].profile_id +
                  "" +
                  upcomingImmunizationList[k].vaccination_id +
                  "" +
                  k +
                  "" +
                  l,
                profile: profiles[m],
                vaccination_id: upcomingImmunizationList[k].vaccination_id,
              },
            });
            dateAfterMonths = new Date(
              todaysDate.setMonth(todaysDate.getMonth() + 6)
            );
          }
        }
      }
    }

    await AsyncStorage.setItem("profiles", JSON.stringify(profiles));
  } catch (e) {
    // saving error
    console.log("updateRecommndedImmunizations error", e);
  }
}
