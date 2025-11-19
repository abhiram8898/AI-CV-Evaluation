import { useState, useEffect } from "react";
import CriteriaList, { type CriteriaItem } from "./CriteriaList";
import PdfPreview from "./PdfPreview";

type WizardProps = {
  step: number;
  next: () => void;
  prev: () => void;
  total: number;
  objectUrl: string;
  onQuit: () => void;
  onComplete: (
    analysisData: any,
    editedData: Record<number, CriteriaItem[]>
  ) => void;
  fileId?: string;
  analysisId?: string;
  n8nResponse?: any;
  saving?: boolean;
  usingDummyMode?: boolean;
};

// Mock analysis data structure (fallback)
const mockAnalysisData = {
  extractedData: {
    personalInfo: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
    },
    workExperience: [
      {
        company: "Tech Corp",
        position: "Senior Developer",
        duration: "2020-2023",
      },
    ],
    education: [
      {
        institution: "University of Technology",
        degree: "Bachelor of Science",
        year: "2020",
      },
    ],
    skills: ["JavaScript", "React", "Node.js", "TypeScript"],
  },
  suggestedCriteria: {
    industries: ["N10 – Business economy (B2B services)"],
    jobFunctions: ["110 CEO"],
    competences: ["0120 – Top line growth"],
    languages: ["English"],
    international: ["Italy"],
    education: ["Master's degree"],
  },
  confidenceScores: {
    personalInfo: 0.95,
    workExperience: 0.87,
    education: 0.92,
    skills: 0.78,
  },
};

export default function Wizard({
  step,
  next,
  prev,
  total,
  objectUrl,
  onQuit,
  onComplete,
  fileId,
  analysisId,
  n8nResponse,
  saving = false,
  usingDummyMode = false,
}: Readonly<WizardProps>) {
  const [criteriaData, setCriteriaData] = useState<
    Record<number, CriteriaItem[]>
  >({});
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isHovered, setIsHovered] = useState({
    prev: false,
    next: false,
    quit: false,
  });

  // Initialize with analysis data when component mounts
  useEffect(() => {
    // Use actual n8n response or mock data
    const initialAnalysisData = n8nResponse || mockAnalysisData;
    setAnalysisData(initialAnalysisData);

    // Initialize criteria data based on analysis
    const initialCriteriaData: Record<number, CriteriaItem[]> = {
      2: initialAnalysisData.suggestedCriteria?.industries?.map(
        (industry: string, index: number) => ({
          id: index + 1,
          label: industry,
          rating: 3,
        })
      ) || [
        { id: 1, label: "N10 – Business economy (B2B services)", rating: 3 },
      ],

      3: initialAnalysisData.suggestedCriteria?.jobFunctions?.map(
        (func: string, index: number) => ({
          id: index + 1,
          label: func,
          rating: 4,
        })
      ) || [{ id: 2, label: "110 CEO", rating: 4 }],

      4: initialAnalysisData.suggestedCriteria?.competences?.map(
        (competence: string, index: number) => ({
          id: index + 1,
          label: competence,
        })
      ) || [{ id: 3, label: "0120 – Top line growth" }],

      5: initialAnalysisData.suggestedCriteria?.languages?.map(
        (language: string, index: number) => ({
          id: index + 1,
          label: language,
          rating: 5,
        })
      ) || [{ id: 4, label: "English", rating: 5 }],

      6: initialAnalysisData.suggestedCriteria?.international?.map(
        (country: string, index: number) => ({
          id: index + 1,
          label: country,
        })
      ) || [{ id: 5, label: "Italy" }],

      7: initialAnalysisData.suggestedCriteria?.education?.map(
        (edu: string, index: number) => ({
          id: index + 1,
          label: edu,
        })
      ) || [{ id: 6, label: "Master's degree" }],
    };

    setCriteriaData(initialCriteriaData);
  }, [n8nResponse]);

  const handleAddCriteria = (stepNumber: number, label: string) => {
    const newId = Date.now();
    const newItem: CriteriaItem = {
      id: newId,
      label,
      ...(stepNumber === 2 || stepNumber === 3 || stepNumber === 5
        ? { rating: 3 }
        : {}),
    };

    const updatedData = {
      ...criteriaData,
      [stepNumber]: [...(criteriaData[stepNumber] || []), newItem],
    };

    setCriteriaData(updatedData);
  };

  const handleRemoveCriteria = (stepNumber: number, id: number) => {
    const updatedData = {
      ...criteriaData,
      [stepNumber]: criteriaData[stepNumber].filter((item) => item.id !== id),
    };

    setCriteriaData(updatedData);
  };

  const handleUpdateRating = (
    stepNumber: number,
    id: number,
    rating: number
  ) => {
    const updatedData = {
      ...criteriaData,
      [stepNumber]: criteriaData[stepNumber].map((item) =>
        item.id === id ? { ...item, rating } : item
      ),
    };

    setCriteriaData(updatedData);
  };

  const getStepCriteria = (stepNumber: number): CriteriaItem[] => {
    return criteriaData[stepNumber] || [];
  };

  const stepConfig = [
    {
      title: "Upload",
      icon: "fa-upload",
      description: "Analyzing your CV and extracting key information",
    },
    {
      title: "Industry",
      icon: "fa-industry",
      description: "Review and edit industry expertise",
      needsRating: true,
      selectOptions: [
        "N20 – Renewable Energy",
        "G15 – Software Development",
        "F25 – Healthcare Technology",
        "M30 – Financial Services",
      ],
    },
    {
      title: "Functions",
      icon: "fa-briefcase",
      description: "Define job roles and responsibilities",
      needsRating: true,
      selectOptions: [
        "220 Chief Technology Officer",
        "330 Marketing Director",
        "440 Operations Manager",
        "550 HR Director",
      ],
    },
    {
      title: "Competences",
      icon: "fa-cogs",
      description: "Specify key competencies and skills",
      selectOptions: [
        "0450 – Automation & Robotics",
        "0850 – Risk Management",
        "1200 – Digital Transformation",
        "1560 – Project Management",
      ],
    },
    {
      title: "Languages",
      icon: "fa-language",
      description: "Add language proficiencies",
      needsRating: true,
      selectOptions: [
        "Spanish",
        "French",
        "Italian",
        "German",
        "Chinese",
        "Japanese",
      ],
    },
    {
      title: "International",
      icon: "fa-globe",
      description: "International work experience",
      selectOptions: [
        "United Kingdom",
        "United States",
        "Japan",
        "Germany",
        "Australia",
        "Singapore",
      ],
    },
    {
      title: "Education",
      icon: "fa-graduation-cap",
      description: "Educational background and qualifications",
      selectOptions: [
        "PhD",
        "Associate degree",
        "Bachelor's degree",
        "Professional Certification",
        "Diploma",
      ],
    },
  ];

  const isAnalysisComplete = step > 1;

  const handleNext = () => {
    next();
  };

  const handlePrev = () => {
    prev();
  };

  const handleComplete = () => {
    const hasData = Object.values(criteriaData).some(
      (items) => items.length > 0
    );

    if (!hasData) {
      alert(
        "Please add at least one criteria item before completing the analysis."
      );
      return;
    }

    console.log("Finalizing analysis:", {
      analysisData,
      editedData: criteriaData,
      fileId,
      analysisId,
      mode: usingDummyMode ? "dummy" : "server",
    });

    // Send both analysis data and edited data to parent
    onComplete(analysisData, criteriaData);
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-xl border border-white/10 relative min-h-96">
      {/* Mode indicator */}

      <button
        className={`absolute cursor-pointer right-4 top-4 px-3 py-1.5 bg-red-500 border border-black/20 text-white rounded text-xs font-medium transition-all duration-200 ${
          isHovered.quit ? "bg-red-700 text-black" : ""
        }`}
        onMouseEnter={() => setIsHovered((prev) => ({ ...prev, quit: true }))}
        onMouseLeave={() => setIsHovered((prev) => ({ ...prev, quit: false }))}
        onClick={onQuit}
      >
        <i className="fa-solid fa-xmark mr-1 text-xs"></i> Quit
      </button>

      <div className="text-center mb-4">
        <div className="flex justify-center gap-2 flex-wrap">
          {stepConfig.map((config, index) => (
            <div
              key={index + 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                step === index + 1
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-md"
                  : step > index + 1
                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400"
                  : "bg-black/5  text-black/60 border-black/20"
              }`}
            >
              <i className={`fa-solid ${config.icon} text-xs`}></i>
              {config.title}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div
          className={`grid gap-4 min-h-64 ${
            isAnalysisComplete ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {isAnalysisComplete && (
            <aside className="bg-black/5 rounded-lg p-4 border border-black/10">
              <PdfPreview objectUrl={objectUrl} label="Uploaded CV Preview" />
            </aside>
          )}

          <div className={isAnalysisComplete ? "md:col-span-2" : ""}>
            {/* Step 1: Analyzing CV */}
            {step === 1 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-2 animate-spin" />
                <h3 className="text-lg font-semibold text-black mb-2">
                  Analyzing your CV…
                </h3>
                <p className="text-black/70 text-sm mb-2">
                  Extracting key information from your resume and preparing
                  analysis criteria.
                </p>
                <div className="text-black/70 text-xs mb-2">Extracting:</div>
                <div className="flex justify-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 text-black/80 text-sm">
                    <i className="fa-solid fa-check text-green-400 text-xs"></i>
                    Personal Info
                  </span>
                  <span className="flex items-center gap-1 text-black/80 text-sm">
                    <i className="fa-solid fa-spinner text-blue-400 text-xs"></i>
                    Work Experience
                  </span>
                  <span className="flex items-center gap-1 text-black/80 text-sm">
                    <i className="fa-solid fa-spinner text-blue-400 text-xs"></i>
                    Education
                  </span>
                  <span className="flex items-center gap-1 text-black/80 text-sm">
                    <i className="fa-solid fa-spinner text-blue-400 text-xs"></i>
                    Skills
                  </span>
                </div>
              </div>
            )}

            {/* Steps 2-7: Criteria Editing */}
            {stepConfig.slice(1).map((config, index) => {
              const stepNumber = index + 2;
              return (
                <div
                  key={stepNumber}
                  className={step === stepNumber ? "block" : "hidden"}
                >
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-black">
                      {config.title}
                    </h3>
                    <p className="text-black/70 text-sm">
                      {config.description}
                    </p>
                  </div>

                  <CriteriaList
                    title={config.title}
                    items={getStepCriteria(stepNumber)}
                    selectOptions={config.selectOptions || []}
                    needsRating={config.needsRating}
                    onAddItem={(label) => handleAddCriteria(stepNumber, label)}
                    onRemoveItem={(id) => handleRemoveCriteria(stepNumber, id)}
                    onUpdateRating={(id, rating) =>
                      handleUpdateRating(stepNumber, id, rating)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-white/10">
        <button
          className={`flex items-center gap-1 px-4 py-1 rounded text-sm font-medium transition-all duration-200 ${
            step === 1
              ? "bg-black/5 text-black/40 cursor-not-allowed"
              : "bg-black/10 text-black/80 border border-white/20 hover:bg-white/15 hover:text-black"
          }`}
          onClick={handlePrev}
          disabled={step === 1}
          onMouseEnter={() => setIsHovered((prev) => ({ ...prev, prev: true }))}
          onMouseLeave={() =>
            setIsHovered((prev) => ({ ...prev, prev: false }))
          }
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          Previous
        </button>

        <div className="text-center text-black/70">
          <div className="text-sm font-medium">
            Step {step} of {total}
          </div>
          {step > 1 && (
            <div className="text-xs mt-0.5">{stepConfig[step - 1].title}</div>
          )}
        </div>

        <button
          className={`flex items-center gap-1 px-4 py-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded text-sm font-medium transition-all duration-200 ${
            isHovered.next
              ? "transform -translate-y-0.5 shadow-lg"
              : "shadow-md"
          } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          onMouseEnter={() => setIsHovered((prev) => ({ ...prev, next: true }))}
          onMouseLeave={() =>
            setIsHovered((prev) => ({ ...prev, next: false }))
          }
          onClick={step === total ? handleComplete : handleNext}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin mr-1"></div>
              Saving...
            </>
          ) : step === total ? (
            <>
              <i className="fa-solid fa-check text-xs"></i>
              Complete
            </>
          ) : (
            <>
              {step === 1 ? "Start Review" : "Next"}
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
