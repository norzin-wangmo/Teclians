/** Royal University of Bhutan — constituent and affiliated colleges. */
export const RUB_UNIVERSITY = "Royal University of Bhutan";

export const RUB_CONSTITUENT_COLLEGES = [
  { name: "College of Natural Resources", collegeCode: "cnr", district: "Punakha" },
  { name: "College of Science and Technology", collegeCode: "cst", district: "Chukha" },
  { name: "Gaeddu College of Business Studies", collegeCode: "gcbs", district: "Chukha" },
  { name: "College of Language and Culture Studies", collegeCode: "clcs", district: "Trongsa" },
  { name: "Jigme Namgyel Engineering College", collegeCode: "jnec", district: "Samdrup Jongkhar" },
  { name: "Paro College of Education", collegeCode: "pce", district: "Paro" },
  { name: "Samtse College of Education", collegeCode: "sce", district: "Samtse" },
  { name: "Sherubtse College", collegeCode: "sherubtse", district: "Trashigang" },
  {
    name: "Gyalpozhing College of Information Technology",
    collegeCode: "gcit",
    district: "Thimphu",
  },
] as const;

export const RUB_AFFILIATED_COLLEGES = [
  { name: "Royal Thimphu College", collegeCode: "rtc", district: "Thimphu" },
  { name: "Norbuling Rigter College", collegeCode: "nrc", district: "Paro" },
] as const;

export const RUB_ALL_COLLEGES = [...RUB_CONSTITUENT_COLLEGES, ...RUB_AFFILIATED_COLLEGES];

export const RUB_EMAIL_DOMAIN = "rub.edu.bt";

/** Bhutan Ministry of Education school-level institutions (grades 11–12, etc.). */
export const SCHOOL_LEVEL_EMAIL_DOMAIN = "education.gov.bt";

export const DEMO_SECONDARY_SCHOOL = {
  name: "Motithang Higher Secondary School",
  district: "Thimphu",
} as const;
