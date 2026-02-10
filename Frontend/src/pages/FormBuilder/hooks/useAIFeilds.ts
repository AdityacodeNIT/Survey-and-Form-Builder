// FormBuilderPage/hooks/useAIFields.ts
import { useState } from "react";
import api from "../../../services/api";
import type { AISuggestion, Field } from "../../../types";

export function useAIFields(
  purpose: string,
  fields: Field[],
  setFields: (f: Field[]) => void
) {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [cache, setCache] = useState<Record<string, AISuggestion[]>>({});

  const getAISuggestions = async () => {
    if (!purpose.trim()) {
      setAiError("Enter purpose first");
      return;
    }

    const key = purpose.trim().toLowerCase();

    if (cache[key]) {
      setAiSuggestions(cache[key]);
      return;
    }

    try {
      setIsLoadingAI(true);
      setAiError("");

      const res = await api.post("/ai/suggestions", { purpose });
      const suggestions: AISuggestion[] = res.data.data;

      setCache(prev => ({ ...prev, [key]: suggestions }));
      setAiSuggestions(suggestions);
    } catch (e: any) {
      setAiError(e.response?.data?.message || "Failed to get AI suggestions");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const consumeSuggestion = (suggestion: AISuggestion) => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      type: suggestion.fieldType || "text",
      label: suggestion.label || "",
      placeholder: suggestion.placeholder,
      required: suggestion.required || false,
      options: suggestion.options,
      order: fields.length,
    };

    setFields([...fields, newField]);
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  return {
    aiSuggestions,
    isLoadingAI,
    aiError,
    getAISuggestions,
    consumeSuggestion,
  };
}
