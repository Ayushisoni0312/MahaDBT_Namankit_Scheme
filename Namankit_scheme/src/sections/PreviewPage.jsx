// ============================================================
//  src/sections/PreviewPage.jsx
//  Opens in new tab from FinalSubmit Review button.
//  Reads data from sessionStorage (set by FinalSubmit).
//  Design matches reference site exactly.
// ============================================================
import React from "react";

export default function PreviewPage() {
  const data = JSON.parse(sessionStorage.getItem("schoolReviewData") || "{}");

  const sb  = data.schoolBasic    || {};
  const ld  = data.landDetails    || {};
  const hd  = data.hostelDetails  || {};
  const dd  = data.diningDetails  || {};
  const lab = data.labDetails     || {};
  const lib = data.libraryDetails || {};
  const td  = data.teacherDetails || [];
  const ec  = data.extraCurriculum|| {};
  const sp  = data.sportsDetails  || {};
  const md  = data.medicalDetails || {};
  const fm  = data.feeMaster      || [];
  const bd  = data.bankDetails    || {};

  // Safe value getter
  const v = (obj, field) => {
    if (!obj) return "";
    const val = obj[field];
    if (val === null || val === undefined || val === "") return "";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  // ── Styles matching reference exactly ──
  const page = {
    padding: "20px",
    maxWidth: "1300px",
    margin: "0 auto",
    backgroundColor: "#fff",
    fontFamily: "Arial, sans-serif",
    fontSize: "13px",
    color: "#333",
  };

  const sectionContainer = {
    border: "1px solid #dee2e6",
    marginBottom: "20px",
  };

  // keep backward compat alias
  const section = sectionContainer;

  const sectionTitle = {
    textAlign: "center",
    fontWeight: "600",
    fontSize: "15px",
    padding: "10px",
    borderBottom: "1px solid #dee2e6",
    backgroundColor: "#fff",
  };

  const tbl = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const lbl = {
    padding: "8px 12px",
    border: "1px solid #dee2e6",
    backgroundColor: "#f9f9f9",
    color: "#333",
    width: "25%",
    fontWeight: "400",
  };

  // val is also a function name — use valStyle for the style object
  const valStyle = {
    padding: "8px 12px",
    border: "1px solid #dee2e6",
    backgroundColor: "#fff",
    width: "25%",
  };

  // keep val as alias so existing style={val} still works
  const val = valStyle;

  const thStyle = {
    padding: "8px 12px",
    border: "1px solid #dee2e6",
    backgroundColor: "#f9f9f9",
    fontWeight: "600",
    textAlign: "center",
  };

  const tdStyle = {
    padding: "8px 12px",
    border: "1px solid #dee2e6",
    backgroundColor: "#fff",
    textAlign: "left",
  };

  return (
    <div style={page}>
      {/* Print button */}
      <button
        onClick={() => window.print()}
        style={{ padding: "6px 16px", background: "#17a2b8", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", marginBottom: "16px", fontSize: "13px" }}
      >
        Print
      </button>

      {/* ── School Basic Details ── */}
      <div style={section}>
        <div style={sectionTitle}>School Basic Details</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>School Photo</td>
              <td style={{ ...val, colSpan: 3 }} colSpan="3">
                {sb.uploadSchoolPhoto?.fileURL
                  ? <img src={sb.uploadSchoolPhoto.fileURL} alt="School" style={{ maxHeight: 80 }} />
                  : "No Photo Uploaded"}
              </td>
            </tr>
            <tr>
              <td style={lbl}>Trustee Name :</td>
              <td style={val}>{v(sb,"trusteeName")}</td>
              <td style={lbl}>School Name :</td>
              <td style={val}>{v(sb,"schoolName")}</td>
            </tr>
            <tr>
              <td style={lbl}>Address :</td>
              <td style={val}>{v(sb,"address")}</td>
              <td style={lbl}>MobileNo :</td>
              <td style={val}>{v(sb,"mobileNumberTrustee")}</td>
            </tr>
            <tr>
              <td style={lbl}>EmailID :</td>
              <td style={val}>{v(sb,"emailId")}</td>
              <td style={lbl}>POName :</td>
              <td style={val}>{v(sb,"poName")}</td>
            </tr>
            <tr>
              <td style={lbl}>DistrictName :</td>
              <td style={val}>{v(sb,"districtId")}</td>
              <td style={lbl}>TalukaName :</td>
              <td style={val}>{v(sb,"talukaId")}</td>
            </tr>
            <tr>
              <td style={lbl}>VillageName :</td>
              <td style={val}>{v(sb,"villageId")}</td>
              <td style={lbl}>UDISE :</td>
              <td style={val}>{v(sb,"udiseCode")}</td>
            </tr>
            <tr>
              <td style={lbl}>School Selection Year :</td>
              <td style={val}>{v(sb,"schoolSelectionYear")}</td>
              <td style={lbl}>School Registration No :</td>
              <td style={val}>{v(sb,"schoolRegistrationNo")}</td>
            </tr>
            <tr>
              <td style={lbl}>School Board :</td>
              <td style={val}>{v(sb,"schoolBoardId")}</td>
              <td style={lbl}>Total Number Of SSC Batches Completed :</td>
              <td style={val}>{v(sb,"totalNoOfSscBatchesCompleted")}</td>
            </tr>
            <tr>
              <td style={lbl}>Year Of Establishment :</td>
              <td style={val}>{v(sb,"yearOfEstablishment")}</td>
              <td style={lbl}>School Falls Under Which Area :</td>
              <td style={val}>{v(sb,"schoolFallsUnderWhichAreaId")}</td>
            </tr>
            <tr>
              <td style={lbl}>School Website Available :</td>
              <td style={val}>{v(sb,"schoolWebsiteAvailable")}</td>
              <td style={lbl}>Website Link :</td>
              <td style={val}>{v(sb,"websiteLink")}</td>
            </tr>
            <tr>
              <td style={lbl}>Number of Toilets On Each Floor In School Building :</td>
              <td style={val} colSpan="3">{v(sb,"noOfToiletsOnEachFloorInSchlBuilding")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Land Details ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Land Details</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>School Land Photo</td>
              <td style={val} colSpan="3">
                {ld.uploadSchoolLandPhoto?.fileURL
                  ? <img src={ld.uploadSchoolLandPhoto.fileURL} alt="Land" style={{ maxHeight: 80 }} />
                  : ""}
              </td>
            </tr>
            <tr>
              <td style={lbl}>Ownership :</td>
              <td style={val}>{v(ld,"ownershipId")}</td>
              <td style={lbl}>Total Area(In Acres)[Building + Playground + Hostel etc] :</td>
              <td style={val}>{v(ld,"totalAreainAcres")}</td>
            </tr>
            <tr>
              <td style={lbl}>School Compound Wall :</td>
              <td style={val}>{v(ld,"schoolCompoundWall")}</td>
              <td style={lbl}>Playground :</td>
              <td style={val}>{v(ld,"playground")}</td>
            </tr>
            <tr>
              <td style={lbl}>Playground Area(In Acres) :</td>
              <td style={val}>{v(ld,"playgroundAreainAcres")}</td>
              <td style={lbl}>Swimming Tank :</td>
              <td style={val}>{v(ld,"swimmingTank")}</td>
            </tr>
            <tr>
              <td style={lbl}>Running Track :</td>
              <td style={val}>{v(ld,"runningTrack")}</td>
              <td style={lbl}>Basket ball Ground :</td>
              <td style={val}>{v(ld,"basketBallGround")}</td>
            </tr>
            <tr>
              <td style={lbl}>Kho-Kho,Kabaddi:</td>
              <td style={val}>{v(ld,"khokhoKabbadiGround")}</td>
              <td style={lbl}>Others:</td>
              <td style={val}>{v(ld,"othersSports")}</td>
            </tr>
            <tr>
              <td style={lbl}>Quality Of Sport Facilities / Infrastructure available:</td>
              <td style={val} colSpan="3">{v(ld,"qualityOfSportFacilitiesInfrastrcAvaId")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Hostel Details ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Hostel Details</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>Hostel Photo</td>
              <td style={val} colSpan="3">
                {hd.uploadHostelPhoto?.fileURL
                  ? <img src={hd.uploadHostelPhoto.fileURL} alt="Hostel" style={{ maxHeight: 80 }} />
                  : ""}
              </td>
            </tr>
            <tr>
              <td style={lbl}>Total Number of Students studying from class 1st to 4th :</td>
              <td style={val}>{v(hd,"totalNoOfStdntsStudyngCls1To4")}</td>
              <td style={lbl}>Total Number of Female caretakers for Students studying in 1st to 4th standard :</td>
              <td style={val}>{v(hd,"totalNoOfFemaleCaretaker1To4")}</td>
            </tr>
            <tr>
              <td style={lbl}>Availability Of incinerators :</td>
              <td style={val}>{v(hd,"availibilityOfIncinerators")}</td>
              <td style={lbl}>Availability Of washing Machine for students use :</td>
              <td style={val}>{v(hd,"availibilityOfWashingMchneForStdnt")}</td>
            </tr>
            <tr>
              <td style={lbl}>Availability Of Separate Hostel Building:</td>
              <td style={val}>{v(hd,"availibilityOfSeparateHstlBuildng")}</td>
              <td style={lbl}>Area In Sq.Ft:</td>
              <td style={val}>{v(hd,"areaInSqft")}</td>
            </tr>
            <tr>
              <td style={lbl}>Availability Of Light,Fan & Bedding Facility In Hostel:</td>
              <td style={val}>{v(hd,"availabilityOfLghtFansBeddng")}</td>
              <td style={lbl}>Availabilty of Hot water:</td>
              <td style={val}>{v(hd,"availibilityOfHotWater")}</td>
            </tr>
            <tr>
              <td style={lbl}>Total Number of Boys Hostels :</td>
              <td style={val}>{v(hd,"ttlNoOfBoysHstl")}</td>
              <td style={lbl}>Total Capacity of Boys Hostels :</td>
              <td style={val}>{v(hd,"ttlCapacityOfBoysHstl")}</td>
            </tr>
            <tr>
              <td style={lbl}>Total Number of Girls Hostels :</td>
              <td style={val}>{v(hd,"ttlNoOfGirlsHstl")}</td>
              <td style={lbl}>Total Capacity of Girls Hostels :</td>
              <td style={val}>{v(hd,"ttlCapacityOfGirlsHstl")}</td>
            </tr>
            <tr>
              <td style={lbl}>Grand Total (Number of Hostels) :</td>
              <td style={val}>{v(hd,"grndTtlnoOfHstl")}</td>
              <td style={lbl}>Grand Total (Capacity of Hostel) :</td>
              <td style={val}>{v(hd,"grndTtlcapacityOfHstl")}</td>
            </tr>
            <tr>
              <td style={lbl}>Total No. Of Residential Students:</td>
              <td style={val}>{v(hd,"totalNoOfResidentialStudents")}</td>
              <td style={lbl}>Expected Bathrooms:</td>
              <td style={val}>{v(hd,"expectedBathrooms")}</td>
            </tr>
            <tr>
              <td style={lbl}>Expected Washrooms:</td>
              <td style={val}>{v(hd,"expectedWashrooms")}</td>
              <td style={lbl}>Actual Bathroom:</td>
              <td style={val}>{v(hd,"actualBathrooms")}</td>
            </tr>
            <tr>
              <td style={lbl}>Actual Washrooms:</td>
              <td style={val} colSpan="3">{v(hd,"actualWashrooms")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Dining Facilities Details ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Dining Facilities Details</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>Dining Hall Photo</td>
              <td style={val} colSpan="3">
                {dd.uploadDinningHallPhoto?.fileURL
                  ? <img src={dd.uploadDinningHallPhoto.fileURL} alt="Dining" style={{ maxHeight: 80 }} />
                  : ""}
                {dd.uploadMenu?.fileURL && (
                  <button
                    onClick={() => window.open(dd.uploadMenu.fileURL, "_blank")}
                    style={{ marginLeft: 16, padding: "6px 16px", background: "#17a2b8", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}
                  >
                    View Uploaded Menu
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <td style={lbl}>Separate Dining Hall for Boys and Girls:</td>
              <td style={val}>{v(dd,"separateDinningHallForBoysAndGirls")}</td>
              <td style={lbl}>Dining Hall Area in Sq.ft:</td>
              <td style={val}>{v(dd,"dinningHallInAreaInSqft")}</td>
            </tr>
            <tr>
              <td style={lbl}>Dining Table:</td>
              <td style={val}>{v(dd,"dinningTable")}</td>
              <td style={lbl}>Food Served As Per Menu:</td>
              <td style={val}>{v(dd,"foodServedAsPerMenu")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Lab Details ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Lab Details</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>Lab Photo</td>
              <td style={val} colSpan="3">
                {lab.uploadLapPhoto?.fileURL
                  ? <img src={lab.uploadLapPhoto.fileURL} alt="Lab" style={{ maxHeight: 80 }} />
                  : ""}
              </td>
            </tr>
            <tr>
              <td style={lbl}>Number of Digital Classroom in the school</td>
              <td style={val}>{v(lab,"numberOfDigitalClassroomInSchool")}</td>
              <td style={lbl}></td>
              <td style={val}></td>
            </tr>
            <tr>
              <td style={lbl}>Well Equipped Computer Lab (Computers,Printers,Scanners,etc):</td>
              <td style={val}>{v(lab,"wellEquipmentCompLab")}</td>
              <td style={lbl}>No of Computers in Working Condition (With Printers,Scanners, Internet,etc):</td>
              <td style={val}>{v(lab,"noOfCompInWorkingCondition")}</td>
            </tr>
            <tr>
              <td style={lbl}>No of Computers in Working Condition:</td>
              <td style={val}>{v(lab,"noOfCompInWrkngCond")}</td>
              <td style={lbl}>Availability of Chemistry Laboratory with Lab Assistant:</td>
              <td style={val}>{v(lab,"availabilityOfChemistryLabWithLabAsst")}</td>
            </tr>
            <tr>
              <td style={lbl}>Area of Chemistry Laboratory (Min 150 Sq ft):</td>
              <td style={val}>{v(lab,"areaOfChemistryLabmin150Sqft")}</td>
              <td style={lbl}>Chemistry lab Available Area Sq ft:</td>
              <td style={val}>{v(lab,"chemistryLabAvailableAreaSqft")}</td>
            </tr>
            <tr>
              <td style={lbl}>Availability of Biology Laboratory with Lab Assistant:</td>
              <td style={val}>{v(lab,"availabilityOfBiologyLabWithLabAsst")}</td>
              <td style={lbl}>Area of Biology Laboratory (Min 150 Sq ft):</td>
              <td style={val}>{v(lab,"areaOfBiologyLabmin150Sqft")}</td>
            </tr>
            <tr>
              <td style={lbl}>Biology lab Available Area Sq ft:</td>
              <td style={val}>{v(lab,"biologyLabAvailableAreaSqft")}</td>
              <td style={lbl}>Availability of Physics Laboratory with Lab Assistant:</td>
              <td style={val}>{v(lab,"availabilityOfPhysicsLabWithLabAsst")}</td>
            </tr>
            <tr>
              <td style={lbl}>Area of Physics Laboratory (Min 150 Sq ft):</td>
              <td style={val}>{v(lab,"areaOfPhysicsLabmin150Sqft")}</td>
              <td style={lbl}>Physics lab Available Area Sq ft:</td>
              <td style={val}>{v(lab,"physicsLabAvailableAreaSqft")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Library Details ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Library Details</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>Library Photo</td>
              <td style={val} colSpan="3">
                {lib.uploadLibraryPhoto?.fileURL
                  ? <img src={lib.uploadLibraryPhoto.fileURL} alt="Library" style={{ maxHeight: 80 }} />
                  : ""}
              </td>
            </tr>
            <tr>
              <td style={lbl}>Separate Library:</td>
              <td style={val}>{v(lib,"separateLibrary")}</td>
              <td style={lbl}>Area(Min 200 Ft with Furniture):</td>
              <td style={val}>{v(lib,"areamin200FtWithFurniture")}</td>
            </tr>
            <tr>
              <td style={lbl}>Actual Area:</td>
              <td style={val}>{v(lib,"actualArea")}</td>
              <td style={lbl}>No of Books:</td>
              <td style={val}>{v(lib,"noOfBooks")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Teachers Details ── */}
      {td.length > 0 && (
        <div style={{ ...section, marginTop: "20px" }}>
          <div style={sectionTitle}>Teachers Details</div>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={thStyle}>Teacher Name</th>
                <th style={thStyle}>Qualifications</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Medium of Education till std. 10th</th>
                <th style={thStyle}>Medium of Education for Degree</th>
                <th style={thStyle}>Medium for B.ed/D.ed/B.P.ed/B.ed Physical</th>
                <th style={thStyle}>Gender</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Experience</th>
                <th style={thStyle}>Is Sports B.P.ed</th>
              </tr>
            </thead>
            <tbody>
              {td.map((t, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{t.name || ""}</td>
                  <td style={tdStyle}>{t.highestQualification || ""}</td>
                  <td style={tdStyle}>{t.subject1Id || ""}</td>
                  <td style={tdStyle}>{t.mediumOfEducationTillStd10thId || ""}</td>
                  <td style={tdStyle}>{t.mediumOfEducationForDegreeId || ""}</td>
                  <td style={tdStyle}>{t.mediumForEducationForBedDedBPedBedPhyId || ""}</td>
                  <td style={tdStyle}>{t.genderId === 1 ? "M" : t.genderId === 2 ? "F" : "O"}</td>
                  <td style={tdStyle}>{t.teacherDetailStatus ? "Residential" : "Non Residential"}</td>
                  <td style={tdStyle}>{t.yearOfExperience ?? ""}</td>
                  <td style={tdStyle}>{t.isSportsBPed ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Extra Curriculum Activities ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Extra Curriculum Activities</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>NCC:</td>
              <td style={val}>{v(ec,"nccsanctioned")}</td>
              <td style={lbl}>Scout/Guide:</td>
              <td style={val}>{v(ec,"scoutguide")}</td>
            </tr>
            <tr>
              <td style={lbl}>NSS:</td>
              <td style={val}>{v(ec,"nSS")}</td>
              <td style={lbl}>Other:</td>
              <td style={val}>{v(ec,"otherCurriculumActivity")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Sports Facilities ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Sports Facilities</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>Number Of Physical Education (PT) teacher available:</td>
              <td style={val}>{v(sp,"noOfPhysicalEducationPTTeacherAvailable")}</td>
              <td style={lbl}>Number Of sports Played On PlayGround</td>
              <td style={val}>{v(sp,"numberOfSportsPlayedOnPlayground")}</td>
            </tr>
            <tr>
              <td style={lbl}>Details Of sports Played On PlayGround :</td>
              <td style={val} colSpan="3">{v(sp,"detailsOfSportsPlayedOnPlayground")}</td>
            </tr>
            <tr>
              <td style={lbl}>Availabilty of qualified Sport's Teachers as per students' count:</td>
              <td style={val}>{v(sp,"availOfQualifiedSportsTeacherAsPerStuCnt")}</td>
              <td style={lbl}>Availabilty of qualified Music, Dance,Crafts & Arts/Drawing Teachers as per students' count:</td>
              <td style={val}>{v(sp,"availOfQualifiedSportsTeacherAsPerStuCnt")}</td>
            </tr>
            <tr>
              <td style={lbl}>Availabilty of separate Auditorium:</td>
              <td style={val}>{v(sp,"availabilityOfSeparateAuditorium")}</td>
              <td style={lbl}>Auditorium Area(sq ft):</td>
              <td style={val}>{v(sp,"auditoriumAreasqFt")}</td>
            </tr>
            <tr>
              <td style={lbl}>School Magazine:</td>
              <td style={val}>{v(sp,"schoolMagazine")}</td>
              <td style={lbl}></td>
              <td style={val}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Medical Facilities ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>Medical Facilities</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>Availability of Medical/Sick Room:</td>
              <td style={val}>{v(md,"availabilitOfMedicalSickRoom")}</td>
              <td style={lbl}>Availability of Doctors in School:</td>
              <td style={val}>{v(md,"availabilityOfDoctorsInSchoolId")}</td>
            </tr>
            <tr>
              <td style={lbl}>Number of Doctors:</td>
              <td style={val}>{v(md,"numberOfDoctors")}</td>
              <td style={lbl}>Number of Nurse:</td>
              <td style={val}>{v(md,"numberOfNurse")}</td>
            </tr>
            <tr>
              <td style={lbl}>Number of Ambulance:</td>
              <td style={val} colSpan="3">{v(md,"numberOfAmbulance")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Profile Fee Master ── */}
      {fm.length > 0 && (
        <div style={{ ...section, marginTop: "20px" }}>
          <div style={sectionTitle}>Profile Fee Master</div>
          <table style={tbl}>
            <thead>
              <tr>
                <th style={thStyle}>Fees Item</th>
                <th style={thStyle}>Item Fees TDD</th>
                <th style={thStyle}>Item Fees General</th>
                <th style={thStyle}>Fees Per Student ST</th>
                <th style={thStyle}>Fees Per Student General</th>
              </tr>
            </thead>
            <tbody>
              {fm.map((f, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{f.feesItemId ?? ""}</td>
                  <td style={tdStyle}>{f.itemFeesTDD ?? ""}</td>
                  <td style={tdStyle}>{f.itemFeesGeneral ?? ""}</td>
                  <td style={tdStyle}>{f.feesPerStudentST ?? ""}</td>
                  <td style={tdStyle}>{f.feesPerStudentGeneral ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── School Bank Details ── */}
      <div style={{ ...section, marginTop: "20px" }}>
        <div style={sectionTitle}>School Bank Details</div>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={lbl}>Bank Name:</td>
              <td style={val}>{v(bd,"bankName")}</td>
              <td style={lbl}>Bank Branch Name:</td>
              <td style={val}>{v(bd,"bankBranchName")}</td>
            </tr>
            <tr>
              <td style={lbl}>Bank IFSC Code:</td>
              <td style={val}>{v(bd,"bankIFSCCode")}</td>
              <td style={lbl}>Bank Account No:</td>
              <td style={val}>{v(bd,"bankAccountNo")}</td>
            </tr>
            <tr>
              <td style={lbl}>Bank Branch Address:</td>
              <td style={val} colSpan="3">{v(bd,"bankBranchAddress")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Print button at bottom */}
      <div style={{ textAlign: "center", marginTop: "30px", paddingBottom: "40px" }}>
        <button
          onClick={() => window.print()}
          style={{ padding: "8px 20px", cursor: "pointer", border: "1px solid #ccc", marginRight: 10, borderRadius: 4 }}
        >
          Print Summary
        </button>
      </div>
    </div>
  );
}