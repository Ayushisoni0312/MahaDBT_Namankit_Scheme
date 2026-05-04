// ============================================================
//  src/utils/validate.js
//
//  Validations for School Basic Details
//  Based on Excel spec: "School Application form" sheet
// ============================================================

// ── Helper ────────────────────────────────────────────────────
const toNum = (v) => parseInt(v || 0, 10);

// ── School Profile validations (rows 1–20) ────────────────────
export function validateSchoolProfile(form) {
  const errors = {};

  // Row 1 — Trustee Name: Mandatory (Yes) — NOTE: Excel says Yes for profile
  if (!form.trusteeName?.trim())
    errors.trusteeName = "Trustee Name is required.";

  // Row 2 — School Name: Mandatory
  if (!form.schoolName?.trim()) errors.schoolName = "School Name is required.";

  // Row 3 — Address: Mandatory
  if (!form.address?.trim()) errors.address = "Address is required.";

  // Row 4 — Mobile Number: Mandatory + 10-digit
  if (!form.mobileNumber?.trim())
    errors.mobileNumber = "Mobile Number is required.";
  else if (!/^\d{10}$/.test(form.mobileNumber))
    errors.mobileNumber = "Enter a valid 10-digit mobile number.";

  // Row 5 — District: Mandatory
  if (!form.district) errors.district = "Please select a District.";

  // Row 6 — Taluka: Mandatory
  if (!form.taluka) errors.taluka = "Please select a Taluka.";

  // Row 7 — Village: Mandatory
  if (!form.village) errors.village = "Please select a Village.";

  // Row 8 — Pincode: Mandatory + 6 digits
  if (!form.pincode?.trim()) errors.pincode = "Pincode is required.";
  else if (!/^\d{6}$/.test(form.pincode))
    errors.pincode = "Pincode must be exactly 6 digits.";

  // Row 9 — Email ID: Mandatory + valid format
  if (!form.emailId?.trim()) errors.emailId = "Email ID is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId))
    errors.emailId = "Enter a valid email address.";

  // Row 10 — PO Name: Mandatory
  if (!form.poName) errors.poName = "Please select a PO Name.";

  // Row 11 — UDISE Code: Mandatory
  if (!form.udiseCode?.trim()) errors.udiseCode = "UDISE Code is required.";

  // Row 12 — School Selection Year: Mandatory
  if (!form.schoolSelectionYear?.trim())
    errors.schoolSelectionYear = "School Selection Year is required.";

  // Row 13 — School Registration Number: Mandatory
  if (!form.schoolRegistrationNumber?.trim())
    errors.schoolRegistrationNumber = "School Registration Number is required.";

  // Row 14 — School Board: Mandatory (DDL: CBSE Board, SCC Board, SSC Board)
  if (!form.schoolBoard) errors.schoolBoard = "Please select a School Board.";

  // Row 15 — Total Number of SSC Batches Completed: Mandatory + Numeric
  if (
    form.sscBatchesCompletedCount === "" ||
    form.sscBatchesCompletedCount === null ||
    form.sscBatchesCompletedCount === undefined
  )
    errors.sscBatchesCompletedCount =
      "Total Number of SSC Batches Completed is required.";
  else if (
    isNaN(Number(form.sscBatchesCompletedCount)) ||
    Number(form.sscBatchesCompletedCount) < 0
  )
    errors.sscBatchesCompletedCount = "Must be a valid positive number.";

  // Row 16 — Year Of Establishment: Mandatory (4-digit year)
  if (!form.yearOfEstablishment)
    errors.yearOfEstablishment = "Year of Establishment is required.";

  // Row 17 — School Website Available: Mandatory
  if (!form.isWebsiteAvailable)
    errors.isWebsiteAvailable =
      "Please select an option for School Website Available.";

  // Row 18 — Website Link: Mandatory only if isWebsiteAvailable === "Yes"
  if (form.isWebsiteAvailable === "Yes") {
    if (!form.websiteLink?.trim())
      errors.websiteLink =
        "Website Link is required when website is available.";
    else if (!/^https?:\/\/.+/.test(form.websiteLink))
      errors.websiteLink =
        "Enter a valid URL starting with http:// or https://";
  }

  // Row 19 — School Falls Under Which Area: Mandatory (DDL: Rural, Nagar Palika, Maha Nagar Palika)
  if (!form.schoolAreaType)
    errors.schoolAreaType = "Please select school Area Type";

  // Row 20 — Number of Toilets On Each Floor In School Building: Mandatory + Numeric
  if (
    form.toiletsPerFloorCount === "" ||
    form.toiletsPerFloorCount === null ||
    form.toiletsPerFloorCount === undefined
  )
    errors.toiletsPerFloorCount = "Number of Toilets per Floor is required.";
  else if (
    isNaN(Number(form.toiletsPerFloorCount)) ||
    Number(form.toiletsPerFloorCount) < 0
  )
    errors.toiletsPerFloorCount = "Must be a valid positive number.";

  return errors;
}

// ── School Intake validations (rows 21–28, auto-calc 29–35) ──
export function validateSchoolIntake(intake) {
  const errors = {};

  const fields = [
    // Rows 21–24: Residential + Non-Residential Boys
    {
      key: "namankit_boys_residential",
      label: "Total Count of Boys under Namankit (Residential)",
    },
    {
      key: "namankit_boys_nonresidential",
      label: "Total Count of Boys under Namankit (Non-Residential)",
    },
    {
      key: "other_boys_residential",
      label: "Total Count of Boys not under Namankit (Residential)",
    },
    {
      key: "other_boys_nonresidential",
      label: "Total Count of Boys not under Namankit (Non-Residential)",
    },
    // Rows 25–28: Residential + Non-Residential Girls
    {
      key: "namankit_girls_residential",
      label: "Total Count of Girls under Namankit (Residential)",
    },
    {
      key: "namankit_girls_nonresidential",
      label: "Total Count of Girls under Namankit (Non-Residential)",
    },
    {
      key: "other_girls_residential",
      label: "Total Count of Girls not under Namankit (Residential)",
    },
    {
      key: "other_girls_nonresidential",
      label: "Total Count of Girls not under Namankit (Non-Residential)",
    },
  ];

  fields.forEach(({ key, label }) => {
    const val = intake[key];
    if (val === "" || val === null || val === undefined)
      errors[key] = `${label} is required.`;
    else if (isNaN(Number(val)) || Number(val) < 0)
      errors[key] = `${label} must be a valid positive number.`;
  });

  return errors;
}

// ── School Performance validations (rows 36–41) ──────────────
export function validateSchoolPerformance(rows) {
  // Row 41 remark: Actor has to add MINIMUM 3 School Performance Years
  if (!rows || rows.length < 3)
    return "Please add at least 3 School Performance Years.";
  return null;
}

// ── Performance row validation (single row) ──────────────────
export function validatePerformanceRow(row) {
  const errors = {};

  // Row 36 — School Performance Year: Mandatory (YYYY-YYYY)
  if (!row.year) errors.year = "School Performance Year is required.";

  // Row 37 — Standard: Mandatory (HSC, SSC, Scholarship, MTS, NTS, Any Other)
  if (!row.standard) errors.standard = "Standard is required.";

  // Row 38 — Others (text area): Mandatory if "Any Other" selected
  if (row.standard === "Any Other" && !row.others?.trim())
    errors.others = "Please specify 'Others' when 'Any Other' is selected.";

  // Row 39 — No of Students Appeared: Mandatory + Numeric
  if (
    row.studentsAppeared === "" ||
    row.studentsAppeared === null ||
    row.studentsAppeared === undefined
  )
    errors.studentsAppeared = "No of Students Appeared is required.";
  else if (
    isNaN(Number(row.studentsAppeared)) ||
    Number(row.studentsAppeared) < 0
  )
    errors.studentsAppeared = "Must be a valid positive number.";

  // Row 40 — No of Students Passed: Mandatory + Numeric
  if (
    row.studentsPassed === "" ||
    row.studentsPassed === null ||
    row.studentsPassed === undefined
  )
    errors.studentsPassed = "No of Students Passed is required.";
  else if (isNaN(Number(row.studentsPassed)) || Number(row.studentsPassed) < 0)
    errors.studentsPassed = "Must be a valid positive number.";

  // Extra: Students Passed cannot exceed Students Appeared
  if (
    row.studentsAppeared !== "" &&
    row.studentsPassed !== "" &&
    !isNaN(Number(row.studentsAppeared)) &&
    !isNaN(Number(row.studentsPassed)) &&
    Number(row.studentsPassed) > Number(row.studentsAppeared)
  ) {
    errors.studentsPassed = "Students Passed cannot exceed Students Appeared.";
  }

  return errors;
}

export function validateStudentRegistration(form) {
  const errors = {};

  if (!form.firstName?.trim()) errors.firstName = "First name is required";
  if (!form.lastName?.trim()) errors.lastName = "Last name is required";

  if (!form.gender) errors.gender = "Please select gender";

  if (!form.birthDate?.trim()) errors.birthDate = "Birth date is required";

  if (!form.currentClass) errors.currentClass = "Please select current class";
  if (!form.currentAdmissionDate)
    errors.currentAdmissionDate = "Please select current admission date";

  if (!form.fatherFirstName?.trim())
    errors.fatherFirstName = "Father's name is required";

  if (!form.mothersName?.trim())
    errors.mothersName = "Mother's name is required";

  if (!form.homeAddress?.trim())
    errors.homeAddress = "Home address is required";

  if (!form.district) errors.district = "Please select a district";
  if (!form.taluka) errors.taluka = "Please select a taluka";
  if (!form.village) errors.village = "Please select a village";

  if (!form.pincode?.trim()) errors.pincode = "Pincode is required";
  else if (!/^\d{6}$/.test(form.pincode))
    errors.pincode = "Pincode must be 6 digits";

  if (form.mobileNumber && !/^\d{10}$/.test(form.mobileNumber))
    errors.mobileNumber = "Enter a valid 10-digit mobile number";

  if (form.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId))
    errors.emailId = "Enter a valid email address";

  if (!form.aadharNumberUID?.toString()?.trim())
    errors.aadharNumberUID = "Aadhar number is required";
  else if (!/^\d{12}$/.test(form.aadharNumberUID.toString()))
    errors.aadharNumberUID = "Aadhar must be 12 digits";

  return errors;
}

// ── GR Details validation ───────────────────────────────────
export function validateGRDetails(form) {
  const errors = {};
  if (!form.committeeDate)
    errors.committeeDate = "Committee meeting date is required.";
  if (!form.grDate) errors.grDate = "GR date is required.";
  if (form.committeeDate && form.grDate) {
    const c = new Date(form.committeeDate);
    const g = new Date(form.grDate);
    if (isNaN(c.getTime()) || isNaN(g.getTime())) {
      errors.grDate = "Invalid date format.";
    } else if (g < c) {
      errors.grDate = "GR date cannot be before committee meeting date.";
    }
  }

  if (!form.atcName) errors.atcName = "Please select ATC.";
  if (!form.schoolType) errors.schoolType = "Please select School Type.";
  if (!form.description || !form.description.trim())
    errors.description = "Brief description is required.";

  const maxSize = 5 * 1024 * 1024; // 5 MB
  // Only PDF allowed per requirement
  const allowed = ["application/pdf"];

  if (!form.grFile) errors.grFile = "GR file is required.";
  else if (form.grFile.size > maxSize)
    errors.grFile = "GR file must be <= 5MB.";
  else if (form.grFile.type && !allowed.includes(form.grFile.type))
    errors.grFile = "GR file should be PDF.";

  if (!form.momFile) errors.momFile = "MOM file is required.";
  else if (form.momFile.size > maxSize)
    errors.momFile = "MOM file must be <= 5MB.";
  else if (form.momFile.type && !allowed.includes(form.momFile.type))
    errors.momFile = "MOM file should be PDF.";

  return errors;
}

// ── Photo upload validation (row 42) ─────────────────────────
export function validateSchoolPhoto(form) {
  const errors = {};
  // Row 42 — Upload School Photo: Mandatory
  if (!form.schoolPhoto && !form.uploadSchoolPhoto)
    errors.schoolPhoto = "School Photo is required.";
  return errors;
}

// ── Full School Basic Details validation ─────────────────────
// Combines all sub-section validations into one call
export function validateAllSchoolBasicDetails(profile, intake, perfRows) {
  const profileErrors = validateSchoolProfile(profile);
  const intakeErrors = validateSchoolIntake(intake);
  const photoErrors = validateSchoolPhoto(profile);
  const perfError = validateSchoolPerformance(perfRows);

  return {
    profileErrors,
    intakeErrors,
    photoErrors,
    perfError, // string or null
    hasErrors:
      Object.keys(profileErrors).length > 0 ||
      Object.keys(intakeErrors).length > 0 ||
      Object.keys(photoErrors).length > 0 ||
      !!perfError,
  };
}
