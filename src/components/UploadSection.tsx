import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import PdfPreview from "./PdfPreview";

interface FileMeta {
  name: string;
  size: number;
  sizeText: string;
  ext: string;
  type: string;
  fileId?: string;
  analysisId?: string;
  uploadedAt?: string;
  mode?: "server" | "dummy";
}

type UploadSectionProps = {
  onStart: () => void;
  fileMeta: FileMeta | null;
  objectUrl: string | null;
  handleFile: (file: File) => Promise<any>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploading?: boolean;
  uploadProgress?: number;
  usingDummyMode?: boolean;
};

type ToastType = "success" | "error";

export default function UploadSection({
  onStart,
  fileMeta,
  objectUrl,
  handleFile,
  fileRef,
  uploading = false,
  uploadProgress = 0,
  usingDummyMode = false,
}: Readonly<UploadSectionProps>) {
  const dropRef = useRef<HTMLLabelElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [manualUploading, setManualUploading] = useState(false);

  const onInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setManualUploading(true);
    try {
      const res = await handleFile(f);
      if (res && "error" in res && res.error) {
        toast(res.error, "error");
        if (fileRef.current) {
          fileRef.current.value = "";
        }
      }
    } finally {
      setManualUploading(false);
    }
  };

  const onDrop = async (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      setManualUploading(true);
      try {
        const res = await handleFile(f);
        if (res && "error" in res && res.error) {
          toast(res.error, "error");
        }
      } finally {
        setManualUploading(false);
      }
    }
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  function toast(msg: string, type: ToastType = "success") {
    const n = document.createElement("div");
    n.className = `fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-white font-medium text-sm shadow-lg backdrop-blur-sm border border-white/10 ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    }`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
  }

  const handleStartAnalysis = () => {
    if (!fileMeta) {
      toast("Please upload a file first", "error");
      return;
    }

    if (usingDummyMode) {
      console.log("Starting analysis in dummy mode");
    }

    onStart();
  };

  const isUploading = uploading || manualUploading;

  return (
    <section className="max-w-2xl mx-auto">
      <div className="bg-linear-to-br from-white to-gray-50 rounded-xl p-4 shadow-lg border border-white/80 backdrop-blur-sm">
        {!fileMeta ? (
          <div className="space-y-6">
            {/* Upload Area */}
            <label
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-blue-400 bg-blue-50/30 shadow-lg scale-105"
                  : "hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-md"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              htmlFor="fileInput"
            >
              {isUploading ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg mx-auto">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Uploading...
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {Math.round(uploadProgress)}% complete
                  </p>
                  <div className="w-48 bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Processing your file...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <i className="fa-solid fa-cloud-arrow-up text-white text-lg"></i>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    Upload Your CV
                  </h3>

                  <p className="text-gray-600 mb-1 text-center text-sm">
                    Drop your resume here or click to browse files
                  </p>

                  <p className="text-gray-500 mb-4 text-center text-xs">
                    PDF, DOC or DOCX • Max 10MB
                  </p>

                  <div className="flex gap-3 mb-4 flex-wrap justify-center">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white/80 rounded-full border border-gray-200 text-gray-700 text-xs font-medium">
                      <i className="fa-solid fa-shield-halved text-green-500 text-xs"></i>
                      Secure & Encrypted
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white/80 rounded-full border border-gray-200 text-gray-700 text-xs font-medium">
                      <i className="fa-solid fa-bolt text-green-500 text-xs"></i>
                      Fast Analysis
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white/80 rounded-full border border-gray-200 text-gray-700 text-xs font-medium">
                      <i className="fa-solid fa-lock text-green-500 text-xs"></i>
                      Private & Confidential
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1.5 bg-white/60 rounded-full border border-gray-200 text-gray-500 text-xs">
                    <i className="fa-solid fa-lightbulb text-amber-500 text-xs"></i>
                    We support most common document formats
                  </div>
                </>
              )}

              <input
                ref={fileRef}
                id="fileInput"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={onInputChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {/* Manual Upload Button */}
            <div className="text-center">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-full font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md ${
                  isUploading ? "cursor-not-allowed" : ""
                }`}
              >
                <i className="fa-solid fa-upload text-xs"></i>
                Browse Files
              </button>
              <p className="text-gray-500 text-xs mt-2">
                {isUploading
                  ? "Please wait while we process your file..."
                  : "Or click the button above to select a file"}
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-slide-up">
            {/* Different header based on mode */}
            {usingDummyMode ? (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-triangle-exclamation text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="text-md font-bold text-amber-900">
                    Using Demo Mode
                  </h3>
                  <p className="text-amber-700 text-sm">
                    Server unavailable - showing demo analysis
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-circle-check text-white text-sm"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-900">
                    Ready for AI Analysis!
                  </h3>
                  <p className="text-green-700 text-sm">
                    Your file has been uploaded successfully
                  </p>
                  {fileMeta.fileId && (
                    <p className="text-green-600 text-xs mt-1">
                      File ID: {fileMeta.fileId}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2">
              <div className="flex items-center gap-2">
                <i className="fa-regular fa-file text-red-500 text-base"></i>
                <span className="font-semibold text-gray-900 text-base">
                  {fileMeta.name}
                </span>
              </div>
              <span className="text-gray-600 font-medium text-sm">
                {fileMeta.ext.toUpperCase()} • {fileMeta.sizeText}
              </span>
            </div>

            <PdfPreview objectUrl={objectUrl} label="CV Preview" />

            <div className="text-center mt-4">
              <button
                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-full font-medium text-sm transition-all duration-200 ${
                  isHovered
                    ? "transform -translate-y-0.5 shadow-lg"
                    : "shadow-md"
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleStartAnalysis}
              >
                <i className="fa-solid fa-sparkles text-xs"></i>
                {usingDummyMode ? "Start  Analysis" : "Start AI Analysis"}
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
