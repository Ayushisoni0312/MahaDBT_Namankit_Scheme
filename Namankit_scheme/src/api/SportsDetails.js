// ============================================================
//  src/api/sportsDetails.js
//
//  3 separate Liferay objects:
//  1. sportfacilities           → main form (single record)
//  2. culturalprogramsportsfacilities → one record per cultural row
//  3. educationaltourssportsfacilities → one record per tour row
//
//  loadSportsDetails(schoolProfileId)
//    → GET all 3 objects filtered by schoolProfileId
//
//  submitSportsDetails({ form, culturalRows, tourRows, schoolProfileId, recordId, culturalIds, tourIds })
//    → POST/PATCH main form
//    → POST new rows, PATCH existing rows for cultural & tours
// ============================================================
import {
  saveSportsFacilities, patchSportsFacilities, getSportsFacilities,
  saveCulturalProgram,  patchCulturalProgram,  getCulturalPrograms,
  saveEducationalTour,  patchEducationalTour,  getEducationalTours,
} from "./liferay";

// ── Load all 3 objects ────────────────────────────────────────
export async function loadSportsDetails(schoolProfileId) {
  const [record, culturalRecords, tourRecords] = await Promise.all([
    getSportsFacilities(schoolProfileId),
    getCulturalPrograms(schoolProfileId),
    getEducationalTours(schoolProfileId),
  ]);
  return {
    record,
    recordId:      record?.id || null,
    culturalRecords,
    tourRecords,
  };
}

// ── Map main record → form state ─────────────────────────────
export function mapRecordToForm(record) {
  if (!record) return null;
  return {
    noOfPhysicalEducationPTTeacherAvailable:  record.noOfPhysicalEducationPTTeacherAvailable  || "",
    numberOfSportsPlayedOnPlayground:         record.numberOfSportsPlayedOnPlayground          || "",
    detailsOfSportsPlayedOnPlayground:        record.detailsOfSportsPlayedOnPlayground         || "",
    availOfQualifiedSportsTeacherAsPerStuCnt: record.availOfQualifiedSportsTeacherAsPerStuCnt ? "Yes" : "No",
    availabilityOfSeparateAuditorium:         record.availabilityOfSeparateAuditorium          ? "Yes" : "No",
    auditoriumAreasqFt:                       record.auditoriumAreasqFt                        || "",
    schoolMagazine:                           record.schoolMagazine                            ? "Yes" : "No",
    schoolMagazineTypeId:                     record.schoolMagazineTypeId                      || "",
  };
}

// ── Map cultural records → rows ───────────────────────────────
export function mapCulturalToRows(records) {
  return (records || []).map((r) => ({
    id:          r.id,
    liferayId:   r.id,
    yearId:      r.culturalProgramConductedBySchoolYearId || "",
    programName: r.culturalProgramName                    || "",
    remarks:     r.culturalProgramRemarks                 || "",
  }));
}

// ── Map tour records → rows ───────────────────────────────────
export function mapToursToRows(records) {
  return (records || []).map((r) => ({
    id:          r.id,
    liferayId:   r.id,
    yearId:      r.educationalToursCondBySchoolYearId || "",
    programName: r.educationalToursProgramName         || "",
    place:       r.educationalToursPlace               || "",
    purpose:     r.educationalToursPurpose             || "",
  }));
}

// ── Submit all 3 objects ──────────────────────────────────────
export async function submitSportsDetails({ form, culturalRows, tourRows, schoolProfileId, recordId }) {

  // 1. Main sports form — POST or PATCH
  const sportsPayload = {
    schoolProfileId:                           schoolProfileId || 0,
    auditoriumAreasqFt:                        Number(form.auditoriumAreasqFt)                       || 0,
    availabilityOfSeparateAuditorium:          form.availabilityOfSeparateAuditorium                === "Yes",
    availOfQualifiedSportsTeacherAsPerStuCnt:  form.availOfQualifiedSportsTeacherAsPerStuCnt        === "Yes",
    detailsOfSportsPlayedOnPlayground:         form.detailsOfSportsPlayedOnPlayground               || "",
    noOfPhysicalEducationPTTeacherAvailable:   Number(form.noOfPhysicalEducationPTTeacherAvailable) || 0,
    numberOfSportsPlayedOnPlayground:          Number(form.numberOfSportsPlayedOnPlayground)        || 0,
    schoolMagazine:                            form.schoolMagazine                                  === "Yes",
    schoolMagazineTypeId:                      Number(form.schoolMagazineTypeId)                    || 0,
  };

  console.log(`[SportsFacilities] ${recordId ? "PATCH" : "POST"} →`, JSON.stringify(sportsPayload, null, 2));
  if (recordId) {
    await patchSportsFacilities(recordId, sportsPayload);
  } else {
    await saveSportsFacilities(sportsPayload);
  }

  // 2. Cultural programs — POST new, PATCH existing
  for (const row of culturalRows) {
    const payload = {
      schoolProfileId:                        schoolProfileId || 0,
      culturalProgramConductedBySchoolYearId: Number(row.yearId)   || 0,
      culturalProgramName:                    row.programName       || "",
      culturalProgramRemarks:                 row.remarks           || "",
    };
    console.log(`[CulturalProgram] ${row.liferayId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));
    if (row.liferayId) {
      await patchCulturalProgram(row.liferayId, payload);
    } else {
      await saveCulturalProgram(payload);
    }
  }

  // 3. Educational tours — POST new, PATCH existing
  for (const row of tourRows) {
    const payload = {
      schoolProfileId:                    schoolProfileId || 0,
      educationalToursCondBySchoolYearId: Number(row.yearId)   || 0,
      educationalToursPlace:              row.place             || "",
      educationalToursProgramName:        row.programName       || "",
      educationalToursPurpose:            row.purpose           || "",
    };
    console.log(`[EducationalTour] ${row.liferayId ? "PATCH" : "POST"} →`, JSON.stringify(payload, null, 2));
    if (row.liferayId) {
      await patchEducationalTour(row.liferayId, payload);
    } else {
      await saveEducationalTour(payload);
    }
  }
}