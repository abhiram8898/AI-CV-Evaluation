// hooks/useWizard.ts
import { useState, useCallback } from "react";

interface SaveAnalysisResponse {
  success: boolean;
  analysisId?: string;
  message?: string;
  error?: string;
  data?: any;
  mode?: "dummy" | "server" | string;
}

export default function useWizard(
  total = 7,
  fileId?: string,
  analysisId?: string
) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [usingDummyMode, setUsingDummyMode] = useState(false);

  // Backend endpoints
  const NODE_BACKEND_URL = "http://localhost:3001";
  const SAVE_ANALYSIS_ENDPOINT = `${NODE_BACKEND_URL}/api/save-analysis`;

  const saveAnalysisToBackend = useCallback(
    async (
      analysisData: any,
      editedData: Record<number, any[]>
    ): Promise<SaveAnalysisResponse> => {
      setSaving(true);

      try {
        console.log("Saving analysis to backend:", {
          analysisId,
          fileId,
          analysisDataKeys: Object.keys(analysisData),
          editedDataSteps: Object.keys(editedData).length,
        });

        // Prepare the data in the required JSON format
        const requestData = {
          analysed: analysisData, // Original analysis data
          edited: editedData, // User edited data
          fileId,
          analysisId,
          savedAt: new Date().toISOString(),
        };

        console.log("Sending data to backend:", requestData);

        const response = await fetch(SAVE_ANALYSIS_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`Save failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setUsingDummyMode(false);
          console.log("Analysis saved successfully:", result.data);
          return result;
        } else {
          throw new Error(result.message || "Save analysis failed");
        }
      } catch (error) {
        console.log(
          "Failed to save analysis to backend, using dummy mode:",
          error
        );
        setUsingDummyMode(true);

        // Fallback to dummy mode - return success but mark as dummy
        return {
          success: true,
          message: "Analysis completed in demo mode (server unavailable)",
          mode: "dummy",
        };
      } finally {
        setSaving(false);
      }
    },
    [fileId, analysisId, SAVE_ANALYSIS_ENDPOINT]
  );

  const completeAnalysis = useCallback(
    async (analysisData: any, editedData: Record<number, any[]>) => {
      // Always try to save to backend first
      const saveResult = await saveAnalysisToBackend(analysisData, editedData);

      // Return the result with mode information
      return {
        ...saveResult,
        mode: usingDummyMode ? "dummy" : "server",
      };
    },
    [saveAnalysisToBackend, usingDummyMode]
  );

  // Simple navigation functions without auto-save
  const next = useCallback(() => {
    setStep((s) => Math.min(total, s + 1));
  }, [total]);

  const prev = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const goTo = useCallback(
    (n: number) => {
      if (n >= 1 && n <= total) setStep(n);
    },
    [total]
  );

  const reset = useCallback(() => {
    setStep(1);
    setUsingDummyMode(false);
    setSaving(false);
  }, []);

  const quit = useCallback(() => {
    setStep(1);
    setUsingDummyMode(false);
    setSaving(false);
  }, []);

  return {
    step,
    next,
    prev,
    goTo,
    reset,
    quit,
    completeAnalysis,
    saving,
    usingDummyMode,
    total,
  };
}
