// ============================================================
//  src/api/poGrading.js
//
//  Liferay Objects:
//  - schoolgradings         (ERC: 43f209c9-3975-ce94-74ad-698a39b4ae52)
//  - schoolgradingquestions (ERC: 904b61ff-a3e2-be39-aba0-0a8ee1b8c058)
//  - namankitschoolprofiles — update approvalStatus
// ============================================================
import { apiFetch, apiPost, apiPatch } from "./liferay";
 
// ── School Grading (main record) ──────────────────────────────
export const getSchoolGrading = (schoolProfileId) =>
  apiFetch(
    `/o/c/schoolgradings?filter=schoolProfileId eq ${schoolProfileId}&pageSize=1`,
  ).then((d) => (d.items || [])[0] || null);
 
export const saveSchoolGrading = (payload) =>
  apiPost("/o/c/schoolgradings", payload);
export const patchSchoolGrading = (id, payload) =>
  apiPatch(`/o/c/schoolgradings/${id}`, payload);
 
// ── Grading Questions (one per question per school) ───────────
export const getGradingQuestions = (schoolProfileId) =>
  apiFetch(
    `/o/c/schoolgradingquestions?filter=schoolProfileId eq ${schoolProfileId}&pageSize=50&sort=questionNumber:asc`,
  ).then((d) => d.items || []);
 
export const saveGradingQuestion = (payload) =>
  apiPost("/o/c/schoolgradingquestions", payload);
export const patchGradingQuestion = (id, payload) =>
  apiPatch(`/o/c/schoolgradingquestions/${id}`, payload);
 
// ── Update approval status on school profile ─────────────────
export const updateApprovalStatus = (schoolProfileId, status) =>
  apiPatch(`/o/c/namankitschoolprofiles/${schoolProfileId}`, {
    approvalStatus: status,
  });
 
// ── Get all schools with approvalStatus for PO list ───────────
export const getAllSchoolsForPO = (schoolType) => {
  console.log("schoolType", schoolType);
  return apiFetch(
    "/o/c/namankitschoolprofiles?pageSize=200&sort=dateCreated:desc",
  ).then((d) => {
    const items = d.items || [];
    const currentYear = new Date().getFullYear();
 
    if (!schoolType) return items;
 
    return items.filter((s) => {
      const year = Number(s.yearOfEstablishment);
 
      // ✅ Check valid 4-digit year
      if (!year || year.toString().length !== 4) return false;
 
      if (
        (schoolType === "NEW" &&
          year === currentYear &&
          s.approvalStatus !== "" &&
          s.approvalStatus !== "PO Recommended for Approval") ||
        s.approvalStatus === "SendBack by ATC"
      ) {
        // ✅ Only current year (e.g., 2026)
        return { ...s };
      } else if (
        (schoolType === "OLD" &&
          year < currentYear &&
          s.approvalStatus !== "" &&
          s.approvalStatus !== "PO Recommended for Approval") ||
        s.approvalStatus === "SendBack by ATC"
      ) {
        // ✅ Less than current year
        return { ...s };
      }
    });
  });
};
 
export const getAllSchoolsForATC = (schoolType) => {
  console.log("schoolType", schoolType);
  return apiFetch(
    "/o/c/namankitschoolprofiles?pageSize=200&sort=dateCreated:desc",
  ).then((d) => {
    const items = d.items || [];
    const currentYear = new Date().getFullYear();
 
    if (!schoolType) return items;
 
    return items.filter((s) => {
      const year = Number(s.yearOfEstablishment);
 
      // ✅ Check valid 4-digit year
      if (!year || year.toString().length !== 4) return false;
 
      if (
        schoolType === "NEW" &&
        year === currentYear &&
        s.approvalStatus !== "" &&
        s.approvalStatus === "PO Recommended for Approval"
      ) {
        // ✅ Only current year (e.g., 2026)
        return { ...s };
      } else if (
        schoolType === "OLD" &&
        year < currentYear &&
        s.approvalStatus !== "" &&
        s.approvalStatus === "PO Recommended for Approval"
      ) {
        // ✅ Less than current year
        return { ...s };
      }
    });
  });
};
 
// ── Submit all grading questions + main record ────────────────
export async function submitGrading({
  schoolProfileId,
  questions,
  poRemarksSummary,
  totalMarks,
  assignedFees,
  tddFees,
  finalFees,
  approvalStatus,
  gradingRecordId,
  existingQuestions,
}) {
  // 1. Save or update main grading record
  const gradingPayload = {
    schoolProfileId: Number(schoolProfileId),
    poRemarksSummary,
    totalMarks,
    assignedFees,
    tddFees,
    finalFees,
    approvalStatus,
    atcRemarksSummary: "",
    proposedStudents: 0,
  };
 
  if (gradingRecordId) {
    await patchSchoolGrading(gradingRecordId, gradingPayload);
  } else {
    await saveSchoolGrading(gradingPayload);
  }
 
  // 2. Save or update each question
  for (const q of questions) {
    // Convert string question numbers to numeric for Liferay Long Integer field
    // 6A → 61, 6B → 62, 10A → 101
    const qNumeric =
      q.questionNumber === "6A"
        ? 61
        : q.questionNumber === "6B"
          ? 62
          : q.questionNumber === "10A"
            ? 101
            : Number(q.questionNumber);
    const qPayload = {
      schoolProfileId: Number(schoolProfileId),
      questionNumber: qNumeric,
      systemMarks: q.systemMarks || 0,
      poMarks: q.poMarks || 0,
      atcMarks: q.atcMarks || 0,
      poRemarks: q.poRemarks || "",
      atcRemarks: q.atcRemarks || "",
    };
 
    const existing = existingQuestions.find(
      (eq) => eq.questionNumber === q.questionNumber,
    );
    if (existing) {
      await patchGradingQuestion(existing.id, qPayload);
    } else {
      await saveGradingQuestion(qPayload);
    }
  }
 
  // 3. Update approvalStatus on school profile
  await updateApprovalStatus(schoolProfileId, approvalStatus);
}
 