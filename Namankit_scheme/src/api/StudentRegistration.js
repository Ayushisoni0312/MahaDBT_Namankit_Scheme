import { uploadFileToFolder } from "./upload";
import { saveStudentRegistration, patchStudentRegistration } from "./liferay";

// Submit student registration payload. If recordId is present, PATCH, else POST.
export async function submitStudentRegistration({ form, recordId }) {
  // upload photo if provided
  const uploadedPhoto = form.studentsPhoto
    ? await uploadFileToFolder(form.studentsPhoto, "School Documents")
    : null;

  const payload = buildPayload({ form, uploadedPhoto });

  console.log(
    `[StudentRegistration] ${recordId ? "PATCH" : "POST"} →`,
    JSON.stringify(payload, null, 2),
  );

  if (recordId) {
    await patchStudentRegistration(recordId, payload);
  } else {
    await saveStudentRegistration(payload);
  }

  return payload;
}

function buildPayload({ form, uploadedPhoto }) {
  return {
    externalReferenceCode: form.externalReferenceCode || "",
    keywords: form.keywords || [],
    permissions: form.permissions || [],
    taxonomyCategoryIds: form.taxonomyCategoryIds || [],
    aadharNumberUID: form.aadharNumberUID ? Number(form.aadharNumberUID) : 0,
    admissionDate: form.admissionDate || "",
    birthDate: form.birthDate || "",
    currentAdmissionDate: form.currentAdmissionDate || "",
    concernedPO: form.concernedPO || "",
    currentClass: form.currentClass || "",
    state: form.state || "",
    district: form.district || "",
    emailId: form.emailId || "",
    familyIncome: form.familyIncome || "",
    fatherFirstName: form.fatherFirstName || "",
    fatherLastName: form.fatherLastName || "",
    fatherMiddleName: form.fatherMiddleName || "",
    firstName: form.firstName || "",
    gender: form.gender || "",
    homeAddress: form.homeAddress || "",
    isActive: typeof form.isActive === "boolean" ? form.isActive : true,
    isDropout: typeof form.isDropout === "boolean" ? form.isDropout : false,
    lastName: form.lastName || "",
    middleName: form.middleName || "",
    mobileNumber: form.mobileNumber || "",
    mothersName: form.mothersName || "",
    oldAdmissionDate: form.oldAdmissionDate || "",
    pincode: form.pincode || "",
    pOName: form.pOName || "",
    studentName: form.studentName || "",
    studentsPhoto: uploadedPhoto
      ? {
          id: uploadedPhoto.documentId,
          name: uploadedPhoto.title,
          fileURL: uploadedPhoto.downloadURL,
          fileBase64: "",
          folder: { externalReferenceCode: "", siteId: 0 },
        }
      : null,
    taluka: form.taluka || "",
    uniqueNumber: form.uniqueNumber || "",
    village: form.village || "",
  };
}
