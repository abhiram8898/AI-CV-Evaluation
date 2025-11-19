import { useState } from "react";
import Wizard from "./components/wizard";
import Completion from "./components/completion";
import useFileUpload from "./hooks/useFileUpload";
import useWizard from "./hooks/useWizard";
import UploadSection from "./components/UploadSection";
import Header from "./components/header";

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
  } = useWizard(7, fileMeta?.fileId, fileMeta?.analysisId);

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
              onComplete={handleComplete}
              n8nResponse={(fileMeta as any)?.n8nResponse}
            />
          )}

          {showCompletion && <Completion onUploadNew={uploadNew} />}
        </div>
      </main>
    </div>
  );
}
