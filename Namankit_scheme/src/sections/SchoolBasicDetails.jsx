// ============================================================
//  src/sections/SchoolBasicDetails.jsx
// ============================================================
import { useState, useEffect } from "react";
import SchoolProfile from "./SchoolProfile";
import SchoolIntake from "./SchoolIntake";
import SchoolPerformance from "./SchoolPerformance";
import UploadSchoolProfile from "./UploadSchoolProfile";
import { Alert, BtnSave, BtnReset, BtnBack } from "../components/FormFields";
import {
  validateAllSchoolBasicDetails,
} from "../utils/validate";
import {
  saveSchoolBasicDetails,
  patchSchoolBasicDetails,
  getSchoolProfileById,
} from "../api/liferay";
import { uploadFileToFolder } from "../api/upload";

const emptyProfile = {
  trusteeName: "",
  schoolName: "",
  address: "",
  mobileNumber: "",
  state: "",
  district: "",
  taluka: "",
  village: "",
  pincode: "",
  emailId: "",
  poName: "",
  udiseCode: "",
  schoolSelectionYear: "",
  schoolRegistrationNumber: "",
  schoolBoard: "",
  sscBatchesCompletedCount: "",
  yearOfEstablishment: "",
  isWebsiteAvailable: "",
  websiteLink: "",
  schoolAreaType: "",
  toiletsPerFloorCount: "",
  schoolPhoto: null,
};

const emptyIntake = {
  namankit_boys_residential: "",
  namankit_boys_nonresidential: "",
  other_boys_residential: "",
  other_boys_nonresidential: "",
  namankit_girls_residential: "",
  namankit_girls_nonresidential: "",
  other_girls_residential: "",
  other_girls_nonresidential: "",
};

export default function SchoolBasicDetails({ onTabChange, onSave, schoolProfileId }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [intake, setIntake] = useState(emptyIntake);
  const [perfRows, setPerfRows] = useState([]);
  const [errors, setErrors] = useState({});        // profile field errors
  const [intakeErrors, setIntakeErrors] = useState({});        // intake field errors
  const [photoErrors, setPhotoErrors] = useState({});        // photo errors
  const [perfError, setPerfError] = useState(null);      // performance min-3 error
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // ── Load existing record ──────────────────────────────────
  useEffect(() => {
    if (!schoolProfileId) return;
    setLoadingData(true);
    getSchoolProfileById(schoolProfileId)
      .then((record) => {
        if (!record) return;
        console.log('School Details.....', record)
        setRecordId(record.id);
        setProfile({
          trusteeName: record.trusteeName || "",
          schoolName: record.schoolName || "",
          address: record.address || "",
          mobileNumber: record.mobileNumberTrustee || "",
          state: record.stateId || "",
          district: record.districtId || "",
          taluka: record.talukaId || "",
          village: record.villageId || "",
          pincode: record.pincode || "",
          emailId: record.emailId || "",
          poName: record.poNameId || "",
          udiseCode: record.udiseCode || "",
          schoolSelectionYear: record.schoolSelectionYear || "",
          schoolRegistrationNumber: record.schoolRegistrationNo || "",
          schoolBoard: record.schoolBoardId || "",
          sscBatchesCompletedCount: record.totalNoOfSscBatchesCompleted || "",
          yearOfEstablishment: record.yearOfEstablishment || "",
          isWebsiteAvailable: record.schoolWebsiteAvailable ? "Yes" : "No",
          websiteLink: record.websiteLink || "",
          schoolAreaType: record.schoolFallsUnderWhichAreaId || "",
          toiletsPerFloorCount: record.noOfToiletsOnEachFloorInSchlBuilding || "",
          schoolPhoto: null,
        });
      })
      .catch((err) => console.error("[SchoolBasicDetails] load error:", err))
      .finally(() => setLoadingData(false));
  }, [schoolProfileId]);

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    // Run full validation
    const { profileErrors, intakeErrors, photoErrors, perfError, hasErrors }
      = validateAllSchoolBasicDetails(profile, intake, perfRows);

    setErrors(profileErrors);
    setIntakeErrors(intakeErrors);
    setPhotoErrors(photoErrors);
    setPerfError(perfError);

    if (hasErrors) {
      setAlert({
        type: "error",
        message: "Please fix the highlighted errors before saving.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setAlert(null);
    try {
      const uploadedPhoto = profile.schoolPhoto
        ? await uploadFileToFolder(profile.schoolPhoto, "School Documents")
        : null;

      const payload = {
        address: profile.address || "",
        districtId: Number(profile.district) || 0,
        emailId: profile.emailId || "",
        higherSecondaryUDISECode: "",
        liferayUserId: 0,
        mobileNumber: 0,
        mobileNumberPrincipal: profile.mobileNumber || "",
        mobileNumberSchool: profile.mobileNumber || "",
        mobileNumberTrustee: profile.mobileNumber || "",
        noOfToiletsOnEachFloorInSchlBuilding: Number(profile.toiletsPerFloorCount) || 0,
        pincode: profile.pincode || "",
        poName: "",
        poNameId: Number(profile.poName) || 0,
        primaryUDISECode: profile.udiseCode || "",
        schoolBoardId: Number(profile.schoolBoard) || 0,
        schoolFallsUnderWhichAreaId: Number(profile.schoolAreaType) || 0,
        schoolMasterID: 0,
        schoolName: profile.schoolName || "",
        schoolRegistrationNo: profile.schoolRegistrationNumber || "",
        schoolSelectionYear: profile.schoolSelectionYear
          ? `${profile.schoolSelectionYear.split("-")[0]}-01-01`
          : "",
        schoolWebsiteAvailable: profile.isWebsiteAvailable === "Yes",
        screenName: "",
        secondaryUDISECode: "",
        stateId: Number(profile.state) || 0,
        talukaId: Number(profile.taluka) || 0,
        totalNoOfSscBatchesCompleted: Number(profile.sscBatchesCompletedCount) || 0,
        trusteeName: profile.trusteeName || "",
        udiseCode: profile.udiseCode || "",
        uploadSchoolPhoto: uploadedPhoto
          ? {
            id: uploadedPhoto.documentId,
            name: uploadedPhoto.title,
            fileURL: uploadedPhoto.downloadURL,
            fileBase64: "",
            folder: { externalReferenceCode: "", siteId: 0 },
          }
          : null,
        villageId: Number(profile.village) || 0,
        websiteLink: profile.websiteLink || "",
        yearOfEstablishment: Number(profile.yearOfEstablishment) || 0,
      };

      const response = recordId
        ? await patchSchoolBasicDetails(recordId, payload)
        : await saveSchoolBasicDetails(payload);

      onSave?.({ ...profile, ...intake, performance: perfRows, schoolId: response?.id });
      setAlert({ type: "success", message: "School Basic Details saved successfully!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setAlert({ type: "error", message: "Save failed — " + (err.message || "Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(emptyProfile);
    setIntake(emptyIntake);
    setPerfRows([]);
    setErrors({});
    setIntakeErrors({});
    setPhotoErrors({});
    setPerfError(null);
    setAlert(null);
  };

  return (
    <div style={{ padding: "16px 20px 32px" }}>
      {loadingData && (
        <div style={{ textAlign: "center", padding: "12px", color: "#888", fontSize: 13 }}>
          Loading saved data...
        </div>
      )}

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <div style={{ background: "#ffffff", border: "1px solid #d6e0e0", borderRadius: 3, padding: "18px 20px 22px" }}>
        {/* School Profile fields */}
        <SchoolProfile
          form={profile}
          setForm={setProfile}
          errors={errors}
        />

        {/* School Intake table with errors */}
        <SchoolIntake
          intake={intake}
          setIntake={setIntake}
          errors={intakeErrors}
        />

        {/* School Performance with min-3 error */}
        <SchoolPerformance
          rows={perfRows}
          setRows={setPerfRows}
          perfError={perfError}
        />

        {/* Photo upload with error */}
        <UploadSchoolProfile
          form={profile}
          setForm={setProfile}
          errors={photoErrors}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <BtnReset onClick={handleReset} />
        <BtnBack onClick={() => onTabChange?.("Final Submit")} />
        <BtnSave onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </BtnSave>
      </div>
    </div>
  );
}