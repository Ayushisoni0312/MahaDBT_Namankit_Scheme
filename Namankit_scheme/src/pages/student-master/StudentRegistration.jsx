import React, { useEffect, useRef, useState } from "react";

import Footer from "../../sections/Footer";

import Header from "../../components/Header";

import PageHeader from "../../components/PageHeader";

import { submitStudentRegistration } from "../../api/StudentRegistration";

import { validateStudentRegistration } from "../../utils/validate";

import { Alert, SelectInput } from "../../components/FormFields";

import { getStates, getDistricts, getTalukas, getVillages, getPoNames } from "../../api/liferay";



export default function StudentRegistration() {

    const [previewUrl, setPreviewUrl] = useState(null);

    const [capturedUrl, setCapturedUrl] = useState(null);

    const [cameraOn, setCameraOn] = useState(false);

    const videoRef = useRef(null);

    const streamRef = useRef(null);

    const previewObjectUrl = useRef(null);

    const capturedObjectUrl = useRef(null);

    const [photoFile, setPhotoFile] = useState(null);

    const [form, setForm] = useState({

        isActive: true,

        isDropout: false,

    });

    const [errors, setErrors] = useState({});

    const [alert, setAlert] = useState(null);

    const [states, setStates] = useState([]);

    const [districts, setDistricts] = useState([]);

    const [talukas, setTalukas] = useState([]);

    const [villages, setVillages] = useState([]);

    const [poNames, setPoNames] = useState([]);



    const admissionYearOptions = (() => {

        const start = 2004;

        const end = 2026;

        const opts = [];

        for (let y = end; y >= start; y--) {

            opts.push(`${y}-${y + 1}`);

        }

        return opts;

    })();



    useEffect(() => {

        const handlePaste = (e) => {

            if (!e.clipboardData) return;

            const items = Array.from(e.clipboardData.items || []);

            for (const item of items) {

                if (item.type && item.type.startsWith("image")) {

                    const file = item.getAsFile();

                    if (file) setImageFile(file);

                    break;

                }

            }

        };



        window.addEventListener("paste", handlePaste);

        return () => window.removeEventListener("paste", handlePaste);

    }, []);



    useEffect(() => {

        // try to start camera on mount (browser may require permission/user gesture)

        startCamera();

        return () => {

            stopCamera();

            revokePreviewObjectUrl();

            revokeCapturedObjectUrl();

        };

    }, []);



    const revokePreviewObjectUrl = () => {

        if (previewObjectUrl.current) {

            URL.revokeObjectURL(previewObjectUrl.current);

            previewObjectUrl.current = null;

        }

    };



    const revokeCapturedObjectUrl = () => {

        if (capturedObjectUrl.current) {

            URL.revokeObjectURL(capturedObjectUrl.current);

            capturedObjectUrl.current = null;

        }

    };



    const setImageFile = (file) => {

        revokePreviewObjectUrl();

        const url = URL.createObjectURL(file);

        previewObjectUrl.current = url;

        setPreviewUrl(url);

        setPhotoFile(file);

    };



    const setCapturedFile = (file) => {

        revokeCapturedObjectUrl();

        const url = URL.createObjectURL(file);

        capturedObjectUrl.current = url;

        setCapturedUrl(url);

        setPhotoFile(file);

    };



    const onFileChange = (e) => {

        const f = e.target.files && e.target.files[0];

        if (f) setImageFile(f);

    };



    const onDrop = (e) => {

        e.preventDefault();

        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];

        if (f && f.type && f.type.startsWith("image")) setImageFile(f);

    };



    const onDragOver = (e) => e.preventDefault();



    const startCamera = async () => {

        try {

            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });

            streamRef.current = s;

            if (videoRef.current) videoRef.current.srcObject = s;

            setCameraOn(true);

        } catch (err) {

            console.error("Camera error", err);

            setAlert({ type: "error", message: "Unable to access camera: " + (err.message || err) });

        }

    };



    const stopCamera = () => {

        if (streamRef.current) {

            streamRef.current.getTracks().forEach((t) => t.stop());

            streamRef.current = null;

        }

        setCameraOn(false);

    };



    const captureFromCamera = () => {

        if (!videoRef.current) return;

        const v = videoRef.current;

        const canvas = document.createElement("canvas");

        canvas.width = v.videoWidth || 640;

        canvas.height = v.videoHeight || 480;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {

            if (blob) {

                const file = new File([blob], "capture.png", { type: "image/png" });

                setCapturedFile(file);

                setPhotoFile(file);

            }

        }, "image/png");

    };



    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((s) => ({ ...s, [name]: value }));

    };



    const onStateChange = (e) => {

        const val = e.target.value;

        setForm((p) => ({ ...p, state: val, district: "", taluka: "", village: "", concernedPO: "" }));

    };



    const onDistrictChange = (e) => {

        const val = e.target.value;

        setForm((p) => ({ ...p, district: val, taluka: "", village: "", concernedPO: "" }));

    };



    const onTalukaChange = (e) => {

        const val = e.target.value;

        setForm((p) => ({ ...p, taluka: val, village: "", concernedPO: "" }));

    };



    const onVillageChange = (e) => {

        const val = e.target.value;

        setForm((p) => ({ ...p, village: val, concernedPO: "" }));

    };



    const handleCheckbox = (e) => {

        const { name, checked } = e.target;

        setForm((s) => ({ ...s, [name]: checked }));

    };



    const handleSave = async () => {

        const errs = validateStudentRegistration(form);

        setErrors(errs);

        if (Object.keys(errs).length > 0) {

            setAlert({ type: "error", message: "Please fill mandatory fields before saving." });

            window.scrollTo({ top: 0, behavior: "smooth" });

            return;

        }



        try {

            setAlert(null);

            const payloadForm = { ...form, studentsPhoto: photoFile };

            await submitStudentRegistration({ form: payloadForm });

            setAlert({ type: "success", message: "Student registration saved successfully." });

            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err) {

            console.error(err);

            setAlert({ type: "error", message: "Failed to save — " + (err.message || "Please try again.") });

        }

    };



    useEffect(() => {

        getStates().then(setStates).catch(() => setStates([]));

    }, []);



    useEffect(() => {

        console.log('States....', states)

    }, [states])



    useEffect(() => {

        //if (!form.state) { setDistricts([]); return; }

        //console.log('Selected state..in form..', form.state);

        if (states.length > 0) {

            let state = states?.find(item => item.label === "MAHARASHTRA");

            form.state = state;

            console.log('selected state....', state)

            getDistricts(state.value).then(setDistricts).catch(() => setDistricts([]));

        }

    }, [states]);



    useEffect(() => {

        if (!form.district) { setTalukas([]); return; }

        getTalukas(form.district).then(setTalukas).catch(() => setTalukas([]));

    }, [form.district]);



    useEffect(() => {

        if (!form.taluka) { setVillages([]); return; }

        getVillages(form.taluka).then(setVillages).catch(() => setVillages([]));

    }, [form.taluka]);



    useEffect(() => {

        if (!form.village) { setPoNames([]); return; }

        setPoNames(states)

        // getPoNames(form.village).then(setPoNames).catch(() => setPoNames([]));

    }, [form.village]);



    return (

        <div style={{ fontFamily: "var(--font-main)", background: "rgb(240, 244, 245)" }}>

            <Header />

            {/* <PageHeader title="Student Registration" /> */}

            <div style={{ padding: 0 }}>

                <div style={{ display: "flex", flexDirection: 'column', alignItems: "flex-start", marginBottom: '5px', gap: 12 }}>

                    <div

                        style={{

                            borderRadius: 6,

                            background: "#edf5fb",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            color: "#1a7a8a",

                            fontSize: 22,

                        }}

                    >

                        📘<h5 style={{ margin: 0, color: "#1a2a5e", fontWeight: '400' }}>

                            STUDENT REGISTRATION

                        </h5>

                    </div>

                    <div style={{ display: 'flex', width: '100%', flexDirection: 'column', justifyContent: 'center', marginTop: -12 }}>

                        <div style={{ display: 'flex', alignSelf: 'center', height: 1, width: '99%', background: 'gray', marginBottom: 1.5, }}></div>

                        <div style={{ display: 'flex', alignSelf: 'center', height: 1, width: '99%', background: 'gray' }}></div>

                    </div>



                </div>

            </div>



            <div style={{ padding: 0, marginTop: 15 }}>

                <div style={{ maxWidth: "100%", margin: "0 auto", backgroundColor: 'rgb(240, 244, 245)', padding: 10 }}>

                    {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                    <div

                        style={{ border: "1px solid #a7a3a3", borderRadius: 4, padding: 18, backgroundColor: 'rgb(240, 244, 245)' }}

                    >

                        <h5 style={{ margin: 0, color: "#333" }}>Student Details</h5>



                        <div

                            style={{

                                marginTop: 1,

                                paddingTop: 1,

                                borderTop: "1px solid #f0f0f0",

                            }}

                        >

                            <div style={{ display: "block", gap: 24 }}>

                                {/* Top: Photo area */}

                                <div style={{ width: "100%" }}>

                                    <div

                                        style={{

                                            color: "#e53935",

                                            fontWeight: 700,

                                            marginBottom: 6,

                                            fontSize: 12

                                        }}

                                    >

                                        Note: School :Approval Pending

                                    </div>

                                    <h6

                                        style={{ color: "#17a2b8", marginTop: 4, marginBottom: 6 }}

                                    >

                                        Applicant Photo

                                    </h6>

                                    <div

                                        style={{

                                            height: 1,

                                            background: '#f4a261',



                                            marginBottom: 12,

                                        }}

                                    />



                                    <div

                                        style={{

                                            background: "#fafafa",

                                            padding: 14,

                                            borderRadius: 4,

                                        }}

                                    >

                                        <div

                                            style={{

                                                display: "flex",

                                                justifyContent: "flex-start",

                                                alignItems: 'center',

                                                gap: 18,

                                            }}

                                        >

                                            <div style={{ flex: "0 0 220px" }}>

                                                <div

                                                    style={{

                                                        fontSize: 13,

                                                        color: "#333",

                                                        marginBottom: 8,

                                                    }}

                                                >

                                                    Student's Photo{" "}

                                                    <span style={{ color: "#e53935" }}>*</span>

                                                </div>



                                                <div

                                                    style={{ display: "flex", justifyContent: "center" }}

                                                >

                                                    <div

                                                        style={{

                                                            border: "4px solid  #CCC",

                                                            padding: 6,

                                                            background: "#fff",

                                                        }}

                                                    >

                                                        <div

                                                            style={{

                                                                width: 220,

                                                                height: 180,

                                                                display: "flex",

                                                                alignItems: "center",

                                                                justifyContent: "center",

                                                                overflow: "hidden",

                                                                backgroundColor: " #FFFFFF",

                                                            }}

                                                        >

                                                            {/* Camera video placed below if active */}

                                                            {cameraOn ? (

                                                                <div style={{ marginTop: 14 }}>

                                                                    <video

                                                                        ref={videoRef}

                                                                        autoPlay

                                                                        muted

                                                                        playsInline

                                                                        style={{

                                                                            width: 360,

                                                                            borderRadius: 6,

                                                                            background: "#000",

                                                                        }}

                                                                    />

                                                                </div>

                                                            ) : (

                                                                <div style={{ color: "#bbb" }}>No photo</div>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>



                                                <div

                                                    style={{

                                                        marginTop: 12,

                                                        display: "flex",

                                                        gap: 8,

                                                        alignItems: "center",

                                                    }}

                                                >

                                                    <button

                                                        onClick={captureFromCamera}

                                                        style={{

                                                            background: "#1b5e71",

                                                            color: "#fff",

                                                            border: "none",

                                                            padding: "8px 12px",

                                                            borderRadius: 4,

                                                            cursor: "pointer",

                                                        }}

                                                    >

                                                        Capture

                                                    </button>

                                                    {/* <label

                                                        style={{

                                                            background: "#fff",

                                                            border: "1px solid #ccc",

                                                            padding: "6px 10px",

                                                            borderRadius: 4,

                                                            cursor: "pointer",

                                                        }}

                                                    >

                                                        Choose File

                                                        <input

                                                            type="file"

                                                            accept="image/*"

                                                            onChange={onFileChange}

                                                            style={{ display: "none" }}

                                                        />

                                                    </label> */}

                                                </div>



                                                <div

                                                    style={{ marginTop: 10, color: "#444", fontSize: 13 }}

                                                >

                                                    Unique Number Generated

                                                </div>

                                            </div>



                                            <div

                                                style={{



                                                    display: "flex",

                                                    alignItems: "center",

                                                    justifyContent: "center",

                                                }}

                                            >

                                                {capturedUrl ? (

                                                    <div

                                                        style={{

                                                            width: 220,

                                                            height: 180,

                                                            display: "flex",

                                                            alignItems: "center",

                                                            justifyContent: "center",

                                                            marginTop: "-50px"

                                                        }}

                                                    >

                                                        <img

                                                            src={capturedUrl}

                                                            alt="Captured"

                                                            style={{

                                                                width: "100%",

                                                                height: "100%",

                                                                objectFit: "cover",

                                                            }}

                                                        />

                                                    </div>

                                                ) : (

                                                    <div style={{ width: 220, height: 180 }} />

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>



                            {/* Student Name section full width */}

                            <div style={{ marginTop: 20 }}>

                                <div

                                    style={{ color: "#17a2b8", fontWeight: 700, marginBottom: 8 }}

                                >

                                    Student Name

                                </div>

                                <div

                                    style={{

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr",

                                        gap: 12,

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13, color: "#333" }}>

                                            First Name <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="firstName"

                                            value={form.firstName || ""}

                                            onChange={handleChange}

                                        />

                                        {errors.firstName && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.firstName}</div>

                                        )}

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13, color: "#333" }}>

                                            Middle Name

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="middleName"

                                            value={form.middleName || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13, color: "#333" }}>

                                            Last Name <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="lastName"

                                            value={form.lastName || ""}

                                            onChange={handleChange}

                                        />

                                        {errors.lastName && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.lastName}</div>

                                        )}

                                    </div>

                                </div>



                                <div

                                    style={{

                                        marginTop: 14,

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr 1fr",

                                        gap: 12,

                                        alignItems: "end",

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13 }}>

                                            Gender <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <div style={{ marginTop: 6 }}>

                                            <label style={{ marginRight: 8 }}>

                                                <input type="radio" name="gender" value="Male" checked={form.gender === "Male"} onChange={handleChange} /> Male

                                            </label>

                                            <label style={{ marginRight: 8 }}>

                                                <input type="radio" name="gender" value="Female" checked={form.gender === "Female"} onChange={handleChange} /> Female

                                            </label>

                                            <label>

                                                <input type="radio" name="gender" value="Transgender" checked={form.gender === "Transgender"} onChange={handleChange} /> Transgender

                                            </label>

                                        </div>

                                        {errors.gender && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.gender}</div>

                                        )}

                                    </div>



                                    <div>

                                        <label style={{ fontSize: 13 }}>

                                            Birth Date <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                                color: form.birthDate ? "#000" : "#888",

                                            }}

                                            type="date"

                                            name="birthDate"

                                            value={form.birthDate || ""}

                                            onChange={handleChange}

                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}

                                            placeholder="DD-MM-YYYY"

                                        />

                                        {errors.birthDate && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.birthDate}</div>

                                        )}

                                    </div>



                                    <div>

                                        <label style={{ fontSize: 13 }}>

                                            Current Class <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <SelectInput

                                            value={form.currentClass || ""}

                                            onChange={(v) => setForm(s => ({ ...s, currentClass: v }))}

                                            options={Array.from({ length: 12 }, (_, i) => i + 1)}

                                            placeholder="-- Select --"

                                        />

                                        {errors.currentClass && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.currentClass}</div>

                                        )}

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13 }}>

                                            Current Admission Date <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            type="date"

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                                color: form.currentAdmissionDate ? "#000" : "#888",

                                            }}

                                            name="currentAdmissionDate"

                                            value={form.currentAdmissionDate || ""}

                                            onChange={handleChange}

                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}

                                            placeholder="DD-MM-YYYY"

                                        />

                                        {errors.currentAdmissionDate && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.currentAdmissionDate}</div>

                                        )}

                                    </div>

                                </div>

                            </div>



                            {/* Father/Guardian & Address section (second screenshot) */}

                            <div

                                style={{

                                    marginTop: 26,

                                    paddingTop: 18,

                                    borderTop: "1px solid #f0f0f0",

                                }}

                            >

                                <div

                                    style={{

                                        color: "#17a2b8",

                                        fontWeight: 700,

                                        marginBottom: 10,

                                    }}

                                >

                                    Father/Guardian Name

                                </div>

                                <div

                                    style={{

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr",

                                        gap: 12,

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13 }}>

                                            First Name <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="fatherFirstName"

                                            value={form.fatherFirstName || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13 }}>Middle Name</label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="fatherMiddleName"

                                            value={form.fatherMiddleName || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13 }}>

                                            Last Name <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="fatherLastName"

                                            value={form.fatherLastName || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                </div>



                                <div style={{ marginTop: 14 }}>

                                    <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                        Mother's Name <span style={{ color: "#e53935" }}>*</span>

                                    </label>

                                    <input

                                        style={{

                                            width: "100%",

                                            padding: 8,

                                            border: "1px solid #ddd",

                                            borderRadius: 4,

                                        }}

                                        name="mothersName"

                                        value={form.mothersName || ""}

                                        onChange={handleChange}

                                    />

                                    {errors.mothersName && (

                                        <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.mothersName}</div>

                                    )}

                                </div>



                                <div style={{ marginTop: 14 }}>

                                    <label style={{ fontSize: 13 }}>

                                        Home Address <span style={{ color: "#e53935" }}>*</span>

                                    </label>

                                    <textarea

                                        rows={2}

                                        style={{

                                            width: "100%",

                                            padding: 8,

                                            marginTop: 6,

                                            border: "1px solid #ddd",

                                            borderRadius: 4,

                                        }}

                                        name="homeAddress"

                                        value={form.homeAddress || ""}

                                        onChange={handleChange}

                                    />

                                    {errors.homeAddress && (

                                        <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.homeAddress}</div>

                                    )}

                                </div>



                                {/* <div style={{ marginTop: 12 }}>

                                    <label style={{ fontSize: 13, marginRight: 10 }}>

                                        State

                                    </label>

                                    <select

                                        style={{

                                            width: 300,

                                            padding: 8,

                                            marginTop: 6,

                                            border: "1px solid #ddd",

                                            borderRadius: 4,

                                        }}

                                        name="state"

                                        value={form.state || ""}

                                        onChange={onStateChange}

                                    >

                                        <option value="">-- Select --</option>

                                        {states.map((s) => (

                                            <option key={s.value} value={s.value}>{s.label}</option>

                                        ))}

                                    </select>

                                </div> */}



                                <div

                                    style={{

                                        marginTop: 12,

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr",

                                        gap: 12,

                                        alignItems: "end",

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                            District <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <SelectInput

                                            value={form.district || ""}

                                            onChange={(v) => setForm(p => ({ ...p, district: v, taluka: "", village: "", concernedPO: "" }))}

                                            options={districts}

                                            placeholder="-- Select --"

                                            disabled={!form.state}

                                        />

                                        {errors.district && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.district}</div>

                                        )}

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                            Taluka <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <SelectInput

                                            value={form.taluka || ""}

                                            onChange={(v) => setForm(p => ({ ...p, taluka: v, village: "", concernedPO: "" }))}

                                            options={talukas}

                                            placeholder="--Select--"

                                            disabled={!form.district}

                                        />

                                        {errors.taluka && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.taluka}</div>

                                        )}

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                            Pincode <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="pincode"

                                            value={form.pincode || ""}

                                            onChange={handleChange}

                                        />

                                        {errors.pincode && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.pincode}</div>

                                        )}

                                    </div>

                                </div>



                                <div

                                    style={{

                                        marginTop: 12,

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr",

                                        gap: 12,

                                        alignItems: "end",

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                            Village <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <SelectInput

                                            value={form.village || ""}

                                            onChange={(v) => setForm(p => ({ ...p, village: v, concernedPO: "" }))}

                                            options={villages}

                                            placeholder="--Select--"

                                            disabled={!form.taluka}

                                        />

                                        {errors.village && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.village}</div>

                                        )}

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Email Id</label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="emailId"

                                            value={form.emailId || ""}

                                            onChange={handleChange}

                                        />

                                        {errors.emailId && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.emailId}</div>

                                        )}

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Mobile Number</label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="mobileNumber"

                                            value={form.mobileNumber || ""}

                                            onChange={handleChange}

                                        />

                                        {errors.mobileNumber && (

                                            <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.mobileNumber}</div>

                                        )}

                                    </div>

                                </div>



                                <div

                                    style={{

                                        marginTop: 12,

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr",

                                        gap: 12,

                                        alignItems: "end",

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                            Concerned PO <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <SelectInput

                                            value={form.concernedPO || ""}

                                            onChange={(v) => setForm(s => ({ ...s, concernedPO: v }))}

                                            options={poNames}

                                            placeholder="-- Select --"

                                            disabled={!form.village}

                                        />

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                            Family Income <span style={{ color: "#e53935" }}>*</span>

                                        </label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="familyIncome"

                                            value={form.familyIncome || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>

                                        <label style={{ marginRight: 16, fontSize: 13 }}>

                                            <input type="checkbox" name="isDropout" checked={!!form.isDropout} onChange={handleCheckbox} /> Dropout

                                        </label>

                                        <label style={{ fontSize: 13 }}>

                                            <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleCheckbox} /> Active

                                        </label>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* Biometric Details section (third screenshot) */}

                        <div

                            style={{

                                marginTop: 28,

                                paddingTop: 18,

                                borderTop: "1px solid #f0f0f0",

                            }}

                        >

                            <h4 style={{ margin: 0 }}>Biometric Details</h4>

                            <div style={{ color: "#e53935", marginTop: 8, fontWeight: 700 }}>

                                Note : Please validate entered Aadhaar No. and finger prints before saving details

                                Steps for UID verification :-

                            </div>

                            <div

                                style={{

                                    background: "#fff8e1",

                                    padding: "10px 12px",

                                    marginTop: 10,

                                    borderRadius: 3,

                                }}

                            >

                                For Capturing finger print and verifying press 'Capture' button

                            </div>



                            <div style={{ marginTop: 12 }}>

                                <label style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>

                                    Aadhaar Number(UID) <span style={{ color: "#e53935" }}>*</span>

                                </label>

                                <input

                                    style={{

                                        width: "100%",

                                        maxWidth: 300,

                                        padding: 8,

                                        border: "1px solid #ddd",

                                        borderRadius: 4,

                                    }}

                                    name="aadharNumberUID"

                                    value={form.aadharNumberUID || ""}

                                    onChange={handleChange}

                                />

                                {errors.aadharNumberUID && (

                                    <div style={{ color: "#cc0000", fontSize: 12, marginTop: 6 }}>{errors.aadharNumberUID}</div>

                                )}

                            </div>



                            <div

                                style={{

                                    marginTop: 12,

                                    backgroundColor: " #dff0d8",

                                    padding: 12,

                                    borderRadius: 4,

                                    display: "flex",



                                }}

                            >

                                <p

                                    style={{

                                        color: "#3c763d",



                                        borderColor: "#d6e9c6",

                                        fontSize: "0.85em",

                                        width: "50%",

                                        padding: "5px 10px",

                                        marginBottom: "10px",

                                        border: "1px solid transparent",

                                        borderRadius: "4px",

                                        justifyContent: 'start'

                                    }}

                                >Click here to capture Right Hand FingerPrint & to verify UID</p>

                                <button

                                    style={{

                                        background: "#1b5e71",

                                        color: "#fff",

                                        border: "none",

                                        padding: "8px 16px",

                                        borderRadius: 6,

                                    }}

                                >

                                    Capture

                                </button>

                            </div>



                            <div style={{ marginTop: 18 }}>

                                <button

                                    onClick={handleSave}

                                    style={{

                                        background: "#28a745",

                                        color: "#fff",

                                        border: "none",

                                        padding: "8px 14px",

                                        borderRadius: 4,

                                    }}

                                >

                                    Save

                                </button>

                            </div>



                            <div

                                style={{

                                    marginTop: 20,

                                    paddingTop: 16,

                                    borderTop: "1px solid #f0f0f0",

                                }}

                            >

                                <div

                                    style={{

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr",

                                        gap: 12,

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13 }}>Unique Number</label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="uniqueNumber"

                                            value={form.uniqueNumber || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13 }}>Student Name</label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="studentName"

                                            value={form.studentName || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13 }}>PO Name</label>

                                        <input

                                            style={{

                                                width: "100%",

                                                padding: 8,

                                                marginTop: 6,

                                                border: "1px solid #ddd",

                                                borderRadius: 4,

                                            }}

                                            name="pOName"

                                            value={form.pOName || ""}

                                            onChange={handleChange}

                                        />

                                    </div>

                                </div>



                                <div

                                    style={{

                                        marginTop: 12,

                                        display: "grid",

                                        gridTemplateColumns: "1fr 1fr 1fr",

                                        gap: 12,

                                    }}

                                >

                                    <div>

                                        <label style={{ fontSize: 13 }}>Admission Date</label>

                                        <SelectInput

                                            value={form.admissionDate || ""}

                                            onChange={(v) => setForm(s => ({ ...s, admissionDate: v }))}

                                            options={admissionYearOptions}

                                            placeholder="-- Select --"

                                        />

                                    </div>

                                    <div>

                                        <label style={{ fontSize: 13 }}>Old Admission Date</label>

                                        <SelectInput

                                            value={form.oldAdmissionDate || ""}

                                            onChange={(v) => setForm(s => ({ ...s, oldAdmissionDate: v }))}

                                            options={admissionYearOptions}

                                            placeholder="-- Select --"

                                        />

                                    </div>

                                    <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-start', alignItems: 'flex-end' }}>

                                        <button

                                            style={{

                                                background: "#28a745",

                                                color: "#fff",

                                                border: "none",

                                                padding: "8px 16px",

                                                borderRadius: 4,

                                                minWidth: 100,

                                            }}

                                        >

                                            Search

                                        </button>

                                        <button

                                            style={{

                                                background: "#28a745",

                                                color: "#fff",

                                                border: "none",

                                                padding: "8px 16px",

                                                borderRadius: 4,

                                                minWidth: 100,

                                            }}

                                        >

                                            Export to Excel

                                        </button>

                                    </div>

                                </div>



                            </div>



                            <div

                                style={{

                                    marginTop: 22,

                                    borderTop: "1px solid #eee",

                                    paddingTop: 12,

                                }}

                            >

                                <h5 style={{ margin: 0 }}>Filled Details</h5>

                            </div>

                        </div>

                    </div>

                </div>

            </div>



        </div>

    );

}