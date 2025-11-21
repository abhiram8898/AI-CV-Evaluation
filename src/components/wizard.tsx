import { useState, useEffect } from "react";
import PdfPreview from "./PdfPreview";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  HandThumbDownIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type CriteriaItem = {
  id: number;
  label: string;
  isNegative: boolean;
  feedback?: string;
  score?: string | number;
};

type WizardProps = {
  step: number;
  next: () => void;
  prev: () => void;
  total: number;
  objectUrl: string;
  onComplete: (analysisData: any, editedData: any) => void;
  n8nResponse?: any;
  quit?: () => void; // Add quit function prop
};

// Dummy data matching your provided structure
const dummyData = {
  "Issue Competence": [
    {
      row_number: 3,
      criterium_category: "Issue Competence",
      hard_criterium: "9110 - Professional IM",
      score: 5,
    },
    {
      row_number: 4,
      criterium_category: "Issue Competence",
      hard_criterium: "0400 - Human Resources",
      score: 5,
    },
    {
      row_number: 5,
      criterium_category: "Issue Competence",
      hard_criterium: "0415 - Recruiting",
      score: 5,
    },
    {
      row_number: 6,
      criterium_category: "Issue Competence",
      hard_criterium: "0405 - HR Development",
      score: 5,
    },
    {
      row_number: 7,
      criterium_category: "Issue Competence",
      hard_criterium: "0410 - Labour law",
      score: 5,
    },
  ],
  Function: [
    {
      row_number: 13,
      criterium_category: "Function",
      hard_criterium: "510 HR Director",
      score: 3,
    },
    {
      row_number: 14,
      criterium_category: "Function",
      hard_criterium: "510 HR Director",
      score: 3,
    },
    {
      row_number: 15,
      criterium_category: "Function",
      hard_criterium: "522 Recruiting",
      score: 1,
    },
    {
      row_number: 16,
      criterium_category: "Function",
      hard_criterium: "500 HR Management",
      score: 1,
    },
  ],
  Languages: [
    {
      row_number: 18,
      criterium_category: "Languages",
      hard_criterium: "German",
      score: "Mother tongue",
    },
    {
      row_number: 19,
      criterium_category: "Languages",
      hard_criterium: "English",
      score: "Fluent",
    },
    {
      row_number: 20,
      criterium_category: "Languages",
      hard_criterium: "Spanish",
      score: "Elementary",
    },
  ],
  Industry: [
    {
      row_number: 22,
      criterium_category: "Industry",
      hard_criterium: "F13 - Components for industry",
      score: 3,
    },
    {
      row_number: 23,
      criterium_category: "Industry",
      hard_criterium: "M15 - Manufacture of electronic components and boards",
      score: 3,
    },
    {
      row_number: 24,
      criterium_category: "Industry",
      hard_criterium:
        "G12 - Manufacture of parts and accessories for motor vehicles",
      score: 1,
    },
  ],
  "Education level": [
    {
      row_number: 27,
      criterium_category: "Education level",
      hard_criterium: "Bachelor's degree",
    },
  ],
  "International experience": [
    {
      row_number: 28,
      criterium_category: "International experience",
      hard_criterium: "Turkey",
    },
  ],
};

export default function Wizard({
  step,
  next,
  prev,
  total,
  objectUrl,
  onComplete,
  n8nResponse,
  quit, // Destructure quit function
}: Readonly<WizardProps>) {
  const [criteriaData, setCriteriaData] = useState<any>({});
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Map UI step → API keys
  const apiMap: Record<number, string> = {
    2: "Industry",
    3: "Function",
    4: "Issue Competence",
    5: "Languages",
    6: "International experience",
    7: "Education level",
  };

  /* -----------------------------
      STEP TITLES & DESCRIPTIONS
  ------------------------------*/
  const stepConfig = {
    1: {
      title: "Document Upload",
      description: "Upload your CV document to begin analysis",
    },
    2: {
      title: "Industry Experience",
      description: "Review and validate industry experience criteria",
    },
    3: {
      title: "Functional Expertise",
      description: "Evaluate functional roles and responsibilities",
    },
    4: {
      title: "Core Competences",
      description: "Assess key competencies and skills",
    },
    5: {
      title: "Language Proficiency",
      description: "Verify language skills and proficiency levels",
    },
    6: {
      title: "International Experience",
      description: "Review international exposure and experience",
    },
    7: {
      title: "Education Background",
      description: "Validate educational qualifications and degrees",
    },
  };

  /* -----------------------------
      INITIALIZE DATA FROM DUMMY DATA
  ------------------------------*/
  useEffect(() => {
    const format = (arr: any[]) =>
      arr?.map((item, index) => ({
        id: item.row_number ?? index + 1,
        label: item.hard_criterium,
        isNegative: false,
        feedback: "",
        score: item.score,
      })) || [];

    // Use dummy data if no n8nResponse
    const data = n8nResponse?.[0] || dummyData;

    setCriteriaData({
      2: format(data["Industry"]),
      3: format(data["Function"]),
      4: format(data["Issue Competence"]),
      5: format(data["Languages"]),
      6: format(data["International experience"]),
      7: format(data["Education level"]),
    });

    setAnalysisData(data);
  }, [n8nResponse]);

  /* -----------------------------
      GET ITEMS BY STEP
  ------------------------------*/
  const getStepCriteria = (stepNum: number) => criteriaData[stepNum] || [];

  /* -----------------------------
      MARK NEGATIVE (thumbs down) & SHOW FEEDBACK
  ------------------------------*/
  const handleMarkNegative = (stepNum: number, id: number) => {
    const key = `${stepNum}-${id}`;

    setCriteriaData((prev: any) => ({
      ...prev,
      [stepNum]: prev[stepNum].map((item: CriteriaItem) =>
        item.id === id ? { ...item, isNegative: !item.isNegative } : item
      ),
    }));

    // Toggle feedback input
    setShowFeedback((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /* -----------------------------
      UPDATE FEEDBACK
  ------------------------------*/
  const handleFeedbackChange = (
    stepNum: number,
    id: number,
    feedback: string
  ) => {
    setCriteriaData((prev: any) => ({
      ...prev,
      [stepNum]: prev[stepNum].map((item: CriteriaItem) =>
        item.id === id ? { ...item, feedback } : item
      ),
    }));
  };

  /* -----------------------------
      QUIT ANALYSIS
  ------------------------------*/
  const handleQuit = () => {
    setShowQuitConfirm(true);
  };

  const confirmQuit = () => {
    if (quit) {
      quit();
    }
    setShowQuitConfirm(false);
  };

  const cancelQuit = () => {
    setShowQuitConfirm(false);
  };

  /* -----------------------------
      COMPLETE - SIMULATE BACKEND CALL
  ------------------------------*/
  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Prepare data for backend (simulated)
      const feedbackData = {
        analysisData: analysisData,
        userFeedback: criteriaData,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending feedback to backend:", feedbackData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Feedback sent successfully (simulated)");

      onComplete(analysisData, criteriaData);
    } catch (error) {
      console.error("Error sending feedback:", error);
      onComplete(analysisData, criteriaData);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -----------------------------
      PROGRESS CALCULATION
  ------------------------------*/
  const progress = ((step - 1) / (total - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-8xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {stepConfig[step as keyof typeof stepConfig].title}
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">
                    Step {step}/{total}
                  </span>
                </div>
                {/* Quit Button */}
                {quit && (
                  <button
                    onClick={handleQuit}
                    className="flex items-center cursor-pointer space-x-2 px-3 py-1.5 bg-red-500 hover:bg-white/30 text-white rounded-lg transition-colors"
                    title="Exit analysis"
                  >
                    <XMarkIcon className="w-4 h-4 " />
                    <span className="text-sm">Exit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {step > 1 ? (
              <div className="grid lg:grid-cols-5 gap-4">
                {/* PDF Preview */}
                <aside className="lg:col-span-3">
                  <div className="sticky top-6">
                    <PdfPreview objectUrl={objectUrl} label="Uploaded CV" />
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900">
                            Review Guidelines
                          </h4>
                          <p className="text-xs text-blue-700 mt-1">
                            Click the thumbs down icon to provide feedback on
                            criteria that need adjustment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Criteria List */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Criteria Review
                    </h3>
                    <p className="text-sm text-gray-600">
                      Validate the extracted criteria. Mark items that need
                      correction.
                    </p>
                  </div>

                  {getStepCriteria(step).length > 0 ? (
                    <div className="space-y-3">
                      {getStepCriteria(step).map((item: CriteriaItem) => {
                        const feedbackKey = `${step}-${item.id}`;

                        return (
                          <div
                            key={item.id}
                            className={`border rounded-lg transition-all duration-200 ${
                              item.isNegative
                                ? "border-red-200 bg-red-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-start space-x-3">
                                    {item.isNegative ? (
                                      <HandThumbDownIcon className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                                    ) : (
                                      <CheckIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                    )}
                                    <div>
                                      <span
                                        className={`font-medium ${
                                          item.isNegative
                                            ? "text-red-800"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {item.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    handleMarkNegative(step, item.id)
                                  }
                                  className={`ml-4 p-2 rounded-lg transition-colors ${
                                    item.isNegative
                                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500"
                                  }`}
                                  title="Mark as incorrect"
                                >
                                  <HandThumbDownIcon className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Feedback Input */}
                              {showFeedback[feedbackKey] && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Feedback
                                    <span className="text-red-500 ml-1">*</span>
                                  </label>
                                  <textarea
                                    value={item.feedback || ""}
                                    onChange={(e) =>
                                      handleFeedbackChange(
                                        step,
                                        item.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Please provide specific feedback on why this criteria needs adjustment..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                    rows={3}
                                  />
                                  <p className="text-xs text-gray-500 mt-2">
                                    Your feedback will help improve the analysis
                                    accuracy.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <HandThumbDownIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Data Available
                      </h3>
                      <p className="text-gray-500">
                        No criteria found for this section.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Step 1 - Upload View */
              <div className="text-center py-12">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <CheckIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Document Ready for Analysis
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your CV has been successfully uploaded. Click "Next" to begin
                  reviewing the extracted criteria.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={step === 1}
                  onClick={prev}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                {/* Quit Button in Footer for mobile */}
                {quit && (
                  <button
                    onClick={handleQuit}
                    className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors lg:hidden"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span>Exit Analysis</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {step === total && (
                  <span className="text-sm text-gray-500">Review complete</span>
                )}
                <button
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={step === total ? handleComplete : next}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : step === total ? (
                    <>
                      <span>Complete Analysis</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRightIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <XMarkIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Exit Analysis?
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit the analysis? Your progress will be
              lost and you'll need to start over.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelQuit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Exit Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
