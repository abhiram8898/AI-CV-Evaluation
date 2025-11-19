import { useState } from "react";

const responseMap = {
  Competences: "Issue Competence",
  Functions: "Function",
  Languages: "Languages",
  Industry: "Industry",
  Education: "Education level",
  International: "International experience",
};

// Dummy data for CriteriaList
const dummyCriteriaData = [
  {
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
  },
];

export default function CriteriaList({ criteriaData = dummyCriteriaData }) {
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [feedbackValues, setFeedbackValues] = useState<{
    [key: string]: string;
  }>({});

  if (!criteriaData || criteriaData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No criteria data available
      </div>
    );
  }

  const api = criteriaData[0];

  const handleThumbsDown = (sectionTitle: string, index: number) => {
    const key = `${sectionTitle}-${index}`;
    setShowFeedback((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFeedbackChange = (key: string, value: string) => {
    setFeedbackValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const sendFeedbackToBackend = async (
    sectionTitle: string,
    item: any,
    feedback: string
  ) => {
    try {
      const feedbackData = {
        section: sectionTitle,
        criteria: item.hard_criterium,
        feedback: feedback,
        rowNumber: item.row_number,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending feedback to backend:", feedbackData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Feedback sent successfully (simulated)");
      alert(
        "Feedback submitted successfully! This would be sent to the backend in a real application."
      );

      // Reset feedback input
      const key = `${sectionTitle}-${item.row_number}`;
      setShowFeedback((prev) => ({ ...prev, [key]: false }));
      setFeedbackValues((prev) => ({ ...prev, [key]: "" }));
    } catch (error) {
      console.error("Error sending feedback:", error);
      alert("Error submitting feedback. Please try again.");
    }
  };

  return (
    <div className="criteria-wrapper space-y-6">
      {Object.keys(responseMap).map((sectionTitle) => {
        const apiKey = responseMap[sectionTitle];
        const items = api[apiKey];

        if (!items || items.length === 0) return null;

        return (
          <div
            key={sectionTitle}
            className="criteria-section border border-gray-200 rounded-lg p-4 bg-white"
          >
            <h2 className="criteria-title text-lg font-semibold mb-3 text-gray-800">
              {sectionTitle}
            </h2>

            <ul className="criteria-items space-y-2">
              {items.map((item, index) => {
                const key = `${sectionTitle}-${index}`;
                const showFeedbackInput = showFeedback[key];
                const feedbackValue = feedbackValues[key] || "";

                return (
                  <li
                    key={index}
                    className="criteria-item flex justify-between items-start p-3 border border-gray-100 rounded bg-gray-50"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{item.hard_criterium}</span>
                      {item.score && (
                        <span className="ml-2 text-sm text-gray-500">
                          (Score: {item.score})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-end ml-4">
                      <button
                        className="thumb-button p-2 rounded hover:bg-gray-200 transition-colors"
                        onClick={() => handleThumbsDown(sectionTitle, index)}
                      >
                        👎
                      </button>

                      {showFeedbackInput && (
                        <div className="mt-2 w-64">
                          <textarea
                            value={feedbackValue}
                            onChange={(e) =>
                              handleFeedbackChange(key, e.target.value)
                            }
                            placeholder="Why is this criteria not suitable?"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() =>
                                sendFeedbackToBackend(
                                  sectionTitle,
                                  item,
                                  feedbackValue
                                )
                              }
                              className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => {
                                setShowFeedback((prev) => ({
                                  ...prev,
                                  [key]: false,
                                }));
                                setFeedbackValues((prev) => ({
                                  ...prev,
                                  [key]: "",
                                }));
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
