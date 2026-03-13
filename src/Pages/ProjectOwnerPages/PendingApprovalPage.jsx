import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Clock, AlertCircle, FileText, Building, User, Phone, Shield, ChevronRight, X, RefreshCw } from "lucide-react";

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState(null);
  const estimatedTime = "24-48 hours";

  const verificationSteps = [
    {
      id: 1,
      title: "Document Upload",
      description: "All required documents have been submitted",
      status: "completed",
      icon: FileText,
      completedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Initial Review",
      description: "AI-powered document verification",
      status: "in_progress",
      icon: Shield,
      estimatedTime: "2-4 hours"
    },
    {
      id: 3,
      title: "Manual Verification",
      description: "Human review of submitted documents",
      status: "pending",
      icon: User,
      estimatedTime: "12-24 hours"
    },
    {
      id: 4,
      title: "Final Approval",
      description: "Account activation and dashboard access",
      status: "pending",
      icon: Check,
      estimatedTime: "1-2 hours"
    }
  ];

  useEffect(() => {
    const isAuthed = localStorage.getItem("li_auth") === "true";
    const role = localStorage.getItem("li_role");
    if (!isAuthed) {
      navigate(role === "projectOwner" ? "/project-owner-login" : "/Login");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserId = currentUser?.id ? String(currentUser.id) : "";
    const storageKey = currentUserId ? `verification_data_${currentUserId}` : "verification_data";

    const legacyData = localStorage.getItem("verification_data");
    const savedData = localStorage.getItem(storageKey) || legacyData;
    if (savedData) {
      const data = JSON.parse(savedData);

      if (currentUserId && data?.userId && String(data.userId) !== currentUserId) {
        if (legacyData) localStorage.removeItem("verification_data");
        if (storageKey !== "verification_data") localStorage.removeItem(storageKey);
        navigate('/verification');
        return;
      }
      
      // Check if already approved
      if (localStorage.getItem("li_approved") === "true") {
        navigate("/project-owners-dashboard");
        return;
      }
      
      // Set verification data after checks (deferred to avoid cascading renders)
      const timer = setTimeout(() => {
        setVerificationData(data);
      }, 0);
      
      return () => clearTimeout(timer);
    } else {
      // No verification data found, redirect to verification page
      navigate('/verification');
    }
  }, [navigate]);

  const simulateApproval = () => {
    localStorage.setItem("li_approved", "true");
    navigate("/project-owners-dashboard");
  };

  const simulateLogout = () => {
    localStorage.removeItem("li_auth");
    localStorage.removeItem("li_approved");
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserId = currentUser?.id ? String(currentUser.id) : "";
    if (currentUserId) {
      localStorage.removeItem(`verification_data_${currentUserId}`);
    }
    localStorage.removeItem("verification_data");
    navigate("/Login");
  };

  const getStatusColor = (stepStatus) => {
    switch (stepStatus) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-gray-500 bg-gray-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getStepIcon = (step) => {
    const IconComponent = step.icon;
    return (
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
        <IconComponent className="w-6 h-6" />
      </div>
    );
  };

  const renderVerificationTimeline = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Verification Progress</h3>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Est. {estimatedTime}</span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>

        {verificationSteps.map((step) => (
          <div key={step.id} className="relative flex items-start gap-4 pb-8">
            {/* Step Icon */}
            <div className="relative z-10">
              {getStepIcon(step)}
              {step.status === "in_progress" && (
                <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{step.title}</h4>
                {step.status === "completed" && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {step.status === "in_progress" && (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{step.description}</p>
              
              <div className="flex items-center gap-4 text-xs">
                {step.status === "completed" && step.completedAt && (
                  <span className="text-green-600">
                    Completed at {new Date(step.completedAt).toLocaleTimeString()}
                  </span>
                )}
                {step.status === "in_progress" && step.estimatedTime && (
                  <span className="text-blue-600">
                    Est. {step.estimatedTime}
                  </span>
                )}
                {step.status === "pending" && step.estimatedTime && (
                  <span className="text-gray-500">
                    Est. {step.estimatedTime}
                  </span>
                )}
              </div>

              {step.status === "in_progress" && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubmittedInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Submitted Information</h3>
      
      {/* Company Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building className="w-5 h-5 text-blue-800" />
          <h4 className="font-medium text-gray-800">Company Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Company Name:</span>
            <p className="text-gray-800 font-medium">{verificationData?.companyName || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>
            <p className="text-gray-800 font-medium">{verificationData?.companyLocation || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-500">Company ID:</span>
            <p className="text-gray-800 font-medium">{verificationData?.companyId || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-500">Documents:</span>
            <div className="flex gap-2 mt-1">
              {verificationData?.companyDocument && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  Company Doc ✓
                </span>
              )}
              {verificationData?.taxPayerCard && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  Tax Card ✓
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Owner Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-blue-800" />
          <h4 className="font-medium text-gray-800">Project Owner Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Owner Name:</span>
            <p className="text-gray-800 font-medium">{verificationData?.ownerName || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-500">Phone Number:</span>
            <p className="text-gray-800 font-medium">{verificationData?.phoneNumber || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-500">ID Number:</span>
            <p className="text-gray-800 font-medium">{verificationData?.idNumber || "N/A"}</p>
          </div>
          <div>
            <span className="text-gray-500">Documents:</span>
            <div className="flex gap-2 mt-1">
              {verificationData?.nationalIdFront && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  ID Front ✓
                </span>
              )}
              {verificationData?.nationalIdBack && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  ID Back ✓
                </span>
              )}
              {verificationData?.selfieWithId && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  Selfie ✓
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {verificationData?.submittedAt && (
        <div className="text-sm text-gray-500">
          Submitted on {new Date(verificationData.submittedAt).toLocaleDateString()} at {new Date(verificationData.submittedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );

  if (!verificationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Verification in Progress</h1>
              <p className="text-sm text-gray-600 mt-1">Your account verification is being processed</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Under Review</span>
            </div>
          </div>

          {/* Status Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Verification Status</p>
                <p className="text-xs text-blue-700 mt-1">
                  Your documents are currently being reviewed. This process typically takes 24-48 hours. 
                  You will receive notification once the verification is complete.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {renderVerificationTimeline()}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Submitted Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {renderSubmittedInfo()}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Status
                </button>
                
                <button
                  onClick={simulateApproval}
                  className="w-full bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Simulate Approval (Dev)
                </button>
                
                <Link
                  to="/"
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition text-center block"
                >
                  Go Home
                </Link>
                
                <button
                  onClick={simulateLogout}
                  className="w-full bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Support: +1-234-567-8900</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Email: support@landinvest.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Response time: 2-4 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
