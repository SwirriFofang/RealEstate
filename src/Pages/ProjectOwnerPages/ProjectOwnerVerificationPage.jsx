import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Check, X, AlertCircle, User, Building, CreditCard, Camera, FileText, Phone, MapPin, Shield } from "lucide-react";

const ProjectOwnerVerificationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    // Company Information
    companyName: "",
    companyLocation: "",
    companyId: "",
    companyDocument: null,
    taxPayerCard: null,
    
    // Project Owner Information
    ownerName: "",
    phoneNumber: "",
    phoneNumberBody: "",
    nationalIdFront: null,
    nationalIdBack: null,
    idNumber: "",
    selfieWithId: null,
    
    // Progress tracking
    completedSteps: [],
    submittedAt: null,
    status: "in_progress"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selfieVideoRef = useRef(null);
  const selfieCanvasRef = useRef(null);
  const [selfieStream, setSelfieStream] = useState(null);
  const [selfieCameraOpen, setSelfieCameraOpen] = useState(false);
  const [selfieCameraError, setSelfieCameraError] = useState("");

  const totalSteps = 2; // Company Info & Project Owner Info

  useEffect(() => {
    const isAuthed = localStorage.getItem("li_auth") === "true";
    const role = localStorage.getItem("li_role");
    if (!isAuthed) {
      navigate("/project-owner-login");
      return;
    }

    if (role !== "projectOwner") {
      navigate("/");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserId = currentUser?.id ? String(currentUser.id) : "";
    const storageKey = currentUserId ? `verification_data_${currentUserId}` : "verification_data";

    // Check if already submitted
    const legacyData = localStorage.getItem("verification_data");
    const savedData = localStorage.getItem(storageKey) || legacyData;
    if (savedData) {
      const data = JSON.parse(savedData);
      if (currentUserId && data?.userId && String(data.userId) !== currentUserId) {
        if (legacyData) localStorage.removeItem("verification_data");
        if (storageKey !== "verification_data") localStorage.removeItem(storageKey);
        setCurrentStep(1);
        return;
      }
      if (data.status === "submitted") {
        navigate("/pending-approval");
      } else {
        setVerificationData({
          ...data,
          phoneNumber: data.phoneNumber || "",
          phoneNumberBody: data.phoneNumber ? data.phoneNumber.replace(/^\+237\s*/, '') : ""
        });
      }
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (selfieStream) {
        selfieStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [selfieStream]);

  const stopSelfieCamera = () => {
    if (selfieStream) {
      selfieStream.getTracks().forEach((t) => t.stop());
    }
    setSelfieStream(null);
    setSelfieCameraOpen(false);
  };

  const startSelfieCamera = async () => {
    try {
      setSelfieCameraError("");

      if (!navigator?.mediaDevices?.getUserMedia) {
        setSelfieCameraError("Camera is not supported on this device/browser");
        return;
      }

      if (selfieStream) {
        selfieStream.getTracks().forEach((t) => t.stop());
        setSelfieStream(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      setSelfieStream(stream);
      setSelfieCameraOpen(true);

      if (selfieVideoRef.current) {
        selfieVideoRef.current.srcObject = stream;
        await selfieVideoRef.current.play();
      }
    } catch (e) {
      setSelfieCameraError(e?.message || "Failed to access camera");
      stopSelfieCamera();
    }
  };

  const captureSelfie = async () => {
    try {
      if (!selfieVideoRef.current || !selfieCanvasRef.current) return;

      const video = selfieVideoRef.current;
      const canvas = selfieCanvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, width, height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) {
        setSelfieCameraError("Failed to capture photo");
        return;
      }

      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      handleFileUpload("selfieWithId", file);
      stopSelfieCamera();
    } catch (e) {
      setSelfieCameraError(e?.message || "Failed to capture photo");
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Company Information Validation
      if (!verificationData.companyName.trim()) {
        newErrors.companyName = "Company name is required";
      }
      if (!verificationData.companyLocation.trim()) {
        newErrors.companyLocation = "Company location is required";
      }
      if (!verificationData.companyId.trim()) {
        newErrors.companyId = "Company ID is required";
      }
      if (!verificationData.companyDocument) {
        newErrors.companyDocument = "Company document is required";
      }
      if (!verificationData.taxPayerCard) {
        newErrors.taxPayerCard = "Tax payer card is required";
      }
    } else if (step === 2) {
      // Project Owner Information Validation
      if (!verificationData.ownerName.trim()) {
        newErrors.ownerName = "Owner name is required";
      }
      if (!verificationData.phoneNumberBody.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^\d{9}$/.test(verificationData.phoneNumberBody)) {
        newErrors.phoneNumber = "Phone number must be 9 digits after +237";
      }
      if (!verificationData.idNumber.trim()) {
        newErrors.idNumber = "ID number is required";
      }
      if (!verificationData.nationalIdFront) {
        newErrors.nationalIdFront = "Front of ID card is required";
      }
      if (!verificationData.nationalIdBack) {
        newErrors.nationalIdBack = "Back of ID card is required";
      }
      if (!verificationData.selfieWithId) {
        newErrors.selfieWithId = "Selfie with ID is required";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        setVerificationData(prev => ({
          ...prev,
          completedSteps: [...prev.completedSteps, currentStep]
        }));
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (fieldName, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, [fieldName]: "File size must be less than 5MB" }));
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [fieldName]: "Only JPEG, PNG, or PDF files are allowed" }));
        return;
      }
      
      setVerificationData(prev => ({ ...prev, [fieldName]: file }));
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      const currentUserId = currentUser?.id ? String(currentUser.id) : "";
      const storageKey = currentUserId ? `verification_data_${currentUserId}` : "verification_data";
      
      const finalData = {
        ...verificationData,
        userId: currentUserId || undefined,
        phoneNumber: `+237 ${verificationData.phoneNumberBody}`,
        completedSteps: [...verificationData.completedSteps, currentStep],
        submittedAt: new Date().toISOString(),
        status: "submitted"
      };
      
      localStorage.setItem(storageKey, JSON.stringify(finalData));
      navigate("/pending-approval");
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Failed to submit verification. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === currentStep
                    ? "bg-blue-800 text-white"
                    : verificationData.completedSteps.includes(step)
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {verificationData.completedSteps.includes(step) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step
                )}
              </div>
              {step < 2 && (
                <div
                  className={`w-24 h-1 mx-2 transition-colors ${
                    verificationData.completedSteps.includes(step)
                      ? "bg-blue-200"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Company Information</span>
          <span>Project Owner Information</span>
        </div>
      </div>
    );
  };

  const renderCompanyInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-6 h-6 text-blue-800" />
        <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name of Company <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={verificationData.companyName}
          onChange={(e) => setVerificationData(prev => ({ ...prev, companyName: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-800 ${
            errors.companyName ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter company name"
        />

        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location of Company <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={verificationData.companyLocation}
            onChange={(e) => setVerificationData(prev => ({ ...prev, companyLocation: e.target.value }))}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-800 ${
              errors.companyLocation ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter company address"
          />

        </div>
        {errors.companyLocation && (
          <p className="mt-1 text-sm text-red-600">{errors.companyLocation}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company's ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={verificationData.companyId}
          onChange={(e) => setVerificationData(prev => ({ ...prev, companyId: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-800 ${
            errors.companyId ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter company registration ID"
        />

        {errors.companyId && (
          <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Company's Document of Existence <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-800 transition-colors">

          <input
            type="file"
            id="companyDocument"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload("companyDocument", e.target.files[0])}
          />
          <label htmlFor="companyDocument" className="cursor-pointer">
            {verificationData.companyDocument ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-8 h-8 text-blue-800" />
                <span className="text-sm text-gray-700">{verificationData.companyDocument.name}</span>
              </div>
            ) : (

              <div>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>
            )}
          </label>
        </div>
        {errors.companyDocument && (
          <p className="mt-1 text-sm text-red-600">{errors.companyDocument}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tax Payer Card <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-800 transition-colors">

          <input
            type="file"
            id="taxPayerCard"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload("taxPayerCard", e.target.files[0])}
          />
          <label htmlFor="taxPayerCard" className="cursor-pointer">
            {verificationData.taxPayerCard ? (
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-8 h-8 text-blue-800" />
                <span className="text-sm text-gray-700">{verificationData.taxPayerCard.name}</span>
              </div>
            ) : (

              <div>
                <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>
            )}
          </label>
        </div>
        {errors.taxPayerCard && (
          <p className="mt-1 text-sm text-red-600">{errors.taxPayerCard}</p>
        )}
      </div>
    </div>
  );

  const renderProjectOwnerInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6 text-blue-800" />
        <h2 className="text-xl font-semibold text-gray-800">Project Owner Information</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name of Project Owner <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={verificationData.ownerName}
          onChange={(e) => setVerificationData(prev => ({ ...prev, ownerName: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-800 ${
            errors.ownerName ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your full name"
        />

        {errors.ownerName && (
          <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value="+237"
            disabled
            readOnly
            className="absolute left-0 top-2 w-16 px-3 py-2 border rounded-l-lg border-r-0 bg-gray-100 text-gray-600"
          />
          <input
            type="tel"
            value={verificationData.phoneNumberBody}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              setVerificationData(prev => ({
                ...prev,
                phoneNumberBody: digits,
                phoneNumber: `+237 ${digits}`
              }));
            }}
            className={`w-full pl-20 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-800 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="6 XX XX XX XX"
          />

        </div>
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={verificationData.idNumber}
          onChange={(e) => setVerificationData(prev => ({ ...prev, idNumber: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-800 ${
            errors.idNumber ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter national ID number"
        />

        {errors.idNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Front of National ID Card <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-800 transition-colors">

            <input
              type="file"
              id="nationalIdFront"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload("nationalIdFront", e.target.files[0])}
            />
            <label htmlFor="nationalIdFront" className="cursor-pointer">
              {verificationData.nationalIdFront ? (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-blue-800" />
                  <span className="text-sm text-gray-700">{verificationData.nationalIdFront.name}</span>
                </div>
              ) : (

                <div>
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload front side</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
          {errors.nationalIdFront && (
            <p className="mt-1 text-sm text-red-600">{errors.nationalIdFront}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Back of National ID Card <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-800 transition-colors">

            <input
              type="file"
              id="nationalIdBack"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload("nationalIdBack", e.target.files[0])}
            />
            <label htmlFor="nationalIdBack" className="cursor-pointer">
              {verificationData.nationalIdBack ? (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-blue-800" />
                  <span className="text-sm text-gray-700">{verificationData.nationalIdBack.name}</span>
                </div>
              ) : (

                <div>
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload back side</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
          {errors.nationalIdBack && (
            <p className="mt-1 text-sm text-red-600">{errors.nationalIdBack}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selfie with ID Card <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">(Hold ID card beside your face in the photo)</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-800 transition-colors">

          {selfieCameraOpen ? (
            <div className="space-y-3">
              <video ref={selfieVideoRef} className="w-full rounded-lg" playsInline muted />
              <canvas ref={selfieCanvasRef} className="hidden" />
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={captureSelfie}
                  className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={stopSelfieCamera}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {selfieCameraError && (
                <p className="text-sm text-red-600">{selfieCameraError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {verificationData.selfieWithId ? (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-blue-800" />
                  <span className="text-sm text-gray-700">{verificationData.selfieWithId.name}</span>
                </div>
              ) : (
                <div>
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Take selfie with ID</p>
                  <p className="text-xs text-gray-500 mt-1">Camera capture required</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startSelfieCamera}
                  className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Open Camera
                </button>
                {verificationData.selfieWithId && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationData((prev) => ({ ...prev, selfieWithId: null }));
                      setErrors((prev) => ({ ...prev, selfieWithId: undefined }));
                      setSelfieCameraError("");
                      startSelfieCamera();
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Retake
                  </button>
                )}
              </div>

              {selfieCameraError && (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">{selfieCameraError}</p>
                  <input
                    type="file"
                    id="selfieWithId"
                    className="block w-full text-sm"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("selfieWithId", e.target.files[0])}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        {errors.selfieWithId && (
          <p className="mt-1 text-sm text-red-600">{errors.selfieWithId}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Verification Guidelines:</p>
            <ul className="text-xs space-y-1">
              <li>• Ensure all documents are clear and readable</li>
              <li>• ID card must be valid and not expired</li>
              <li>• Selfie must clearly show your face and ID card</li>
              <li>• All information must match your official documents</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Project Owner Verification</h1>
                <p className="text-sm text-gray-600 mt-1">Complete all steps to verify your account</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-800" />
                <span className="text-sm font-medium text-blue-800">Secure Verification</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 py-6">
            {renderProgressBar()}
          </div>

          {/* Form Content */}
          <div className="px-8 pb-6">
            {currentStep === 1 && renderCompanyInfo()}
            {currentStep === 2 && renderProjectOwnerInfo()}
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 border-t border-gray-100">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              <div className="flex gap-3">
                {currentStep === totalSteps ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Verification"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next Step
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="px-8 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectOwnerVerificationPage;