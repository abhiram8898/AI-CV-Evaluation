import { useState } from "react";
import Wizard from "./components/wizard";
import Completion from "./components/completion";
import useFileUpload from "./hooks/useFileUpload";
import useWizard from "./hooks/useWizard";
import UploadSection from "./components/UploadSection";
import Header from "./components/Header";

// Define types for the analysis data
interface AnalysisData {
  extractedData?: {
    personalInfo?: any;
    workExperience?: any[];
    education?: any[];
    skills?: string[];
  };
  suggestedCriteria?: {
    industries?: string[];
    jobFunctions?: string[];
    competences?: string[];
    languages?: string[];
    international?: string[];
    education?: string[];
  };
  confidenceScores?: {
    personalInfo?: number;
    workExperience?: number;
    education?: number;
    skills?: number;
  };
  source?: string;
  analyzedAt?: string;
}

interface FileMeta {
  name: string;
  size: number;
  sizeText: string;
  ext: string;
  type: string;
  fileId?: string;
  analysisId?: string;
  uploadedAt?: string;
  n8nResponse?: AnalysisData;
  mode?: "server" | "dummy";
}

export default function App() {
  const {
    fileMeta,
    objectUrl,
    handleFile,
    fileRef,
    reset,
    setObjectUrl,
    setFileMeta,
    usingDummyMode: uploadDummyMode,
  } = useFileUpload();

  const {
    step,
    next,
    prev,
    goTo,
    reset: resetWizard,
    total,
    completeAnalysis,
    saving,
    usingDummyMode: wizardDummyMode,
  } = useWizard(
    7,
    fileMeta?.fileId,
    fileMeta?.analysisId,
    (fileMeta as any)?.n8nResponse
  );

  const [showWizard, setShowWizard] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionMode, setCompletionMode] = useState<"server" | "dummy">(
    "server"
  );

  function startAnalysis() {
    if (!fileMeta || !objectUrl) {
      showToast("Please upload a file first", "error");
      return;
    }
    setShowWizard(true);
    setShowCompletion(false);
    setTimeout(() => goTo(2), 800);
  }

  function quitWizard() {
    setShowWizard(false);
    resetWizard();
    setObjectUrl(null);
    setFileMeta(null);
  }

  async function handleComplete(
    analysisData: AnalysisData,
    editedData: Record<number, any[]>
  ) {
    // Send both datasets to backend
    const result = await completeAnalysis(analysisData, editedData);

    if (result.success) {
      // Ensure result.mode is narrowed to the allowed union type
      setCompletionMode(result.mode === "dummy" ? "dummy" : "server");
      complete();
    } else {
      showToast(result.error || "Failed to save analysis", "error");
    }
  }

  function complete() {
    setShowWizard(false);
    setShowCompletion(true);
    showToast(
      completionMode === "server"
        ? "Analysis completed and saved successfully!"
        : "Analysis completed in demo mode (server unavailable)",
      completionMode === "server" ? "success" : "warning"
    );
  }

  function uploadNew() {
    setShowCompletion(false);
    reset();
    resetWizard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) {
    const n = document.createElement("div");
    const bgColor =
      type === "success"
        ? "bg-green-600 border-green-500"
        : type === "warning"
        ? "bg-amber-500 border-amber-400"
        : "bg-red-600 border-red-500";

    n.className = `fixed top-20 right-6 z-50 px-4 py-3 rounded-lg text-white font-medium text-sm shadow-lg border transition-all duration-400 transform translate-x-full opacity-0 ${bgColor}`;
    n.textContent = message;
    document.body.appendChild(n);

    setTimeout(() => {
      n.classList.remove("translate-x-full", "opacity-0");
      n.classList.add("translate-x-0", "opacity-100");
    }, 100);

    setTimeout(() => {
      n.classList.remove("translate-x-0", "opacity-100");
      n.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => n.remove(), 400);
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative">
      <Header />
      <main className="relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI CV Analysis
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Upload a CV and walk through a clean, step-by-step analysis. Quit
              anytime or start over with a new upload.
            </p>

            {/* Stats or features */}
            <div className="flex justify-center gap-8 mt-6 text-sm">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <div className="text-blue-600">Analysis Steps</div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <div className="text-blue-600">Secure & Private</div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <div className="text-blue-600">AI Powered Insights</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {!showWizard && !showCompletion && (
            <UploadSection
              onStart={startAnalysis}
              fileMeta={fileMeta}
              objectUrl={objectUrl}
              handleFile={handleFile}
              fileRef={fileRef}
              usingDummyMode={uploadDummyMode}
            />
          )}

          {showWizard && objectUrl && (
            <Wizard
              step={step}
              next={next}
              prev={prev}
              total={total}
              objectUrl={objectUrl}
              onQuit={quitWizard}
              onComplete={handleComplete}
              fileId={fileMeta?.fileId}
              analysisId={fileMeta?.analysisId}
              n8nResponse={(fileMeta as any)?.n8nResponse}
              saving={saving}
              usingDummyMode={wizardDummyMode || uploadDummyMode}
            />
          )}

          {showCompletion && <Completion onUploadNew={uploadNew} />}
        </div>
      </main>
    </div>
  );
}
