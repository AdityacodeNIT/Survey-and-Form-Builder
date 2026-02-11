import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import type { Field, Form } from "../../../types";

const CACHE_KEY_PREFIX = "formBuilder_draft_";

export function useFormLoader(formId?: string) {
  const navigate = useNavigate();
  const isEditMode = !!formId;
  const cacheKey = `${CACHE_KEY_PREFIX}${formId || 'new'}`;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [preventDuplicates, setPreventDuplicates] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load from cache or API
  useEffect(() => {
    if (isEditMode && formId) {
      loadForm(formId);
    } else {
      // Try to load from cache for new forms
      loadFromCache();
    }
  }, [formId, isEditMode]);

  // Auto-save to cache whenever form data changes
  useEffect(() => {
    if (title || description || purpose || fields.length > 0) {
      saveToCache();
    }
  }, [title, description, purpose, preventDuplicates, fields]);

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPurpose(data.purpose || "");
        setPreventDuplicates(data.preventDuplicates || false);
        setFields(data.fields || []);
      }
    } catch (e) {
      console.error("Failed to load from cache:", e);
    }
  };

  const saveToCache = () => {
    try {
      const data = { title, description, purpose, preventDuplicates, fields };
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to cache:", e);
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.error("Failed to clear cache:", e);
    }
  };

  const loadForm = async (formId: string) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/forms/${formId}`);
      const form: Form = res.data.data;

      setTitle(form.title);
      setDescription(form.description || "");
      setPurpose(form.purpose || "");
      setPreventDuplicates(form.preventDuplicates || false);
      setFields(form.fields || []);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load form");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setError("Form title is required");
      return false;
    }

    if (!fields.length) {
      setError("Add at least one field");
      return false;
    }

    for (const field of fields) {
      if (!field.label?.trim()) {
        setError("All fields must have a label");
        return false;
      }

      if (
        (field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") &&
        (!field.options ||
          field.options.length === 0 ||
          field.options.every((opt: string) => !opt.trim()))
      ) {
        setError(`Field "${field.label}" must have valid options`);
        return false;
      }
    }

    return true;
  };

  const saveForm = async () => {
    if (isLoading) return;
    setError("");
    setSuccess("");

    if (!validate()) return;

    try {
      setIsLoading(true);

      const payload = {
        title,
        description,
        purpose,
        preventDuplicates,
        fields: fields.map((f, i) => ({ ...f, order: i })),
      };

      if (isEditMode && formId) {
        await api.put(`/forms/${formId}`, payload);
        setSuccess("Form updated successfully!");
      } else {
        await api.post("/forms", payload);
        setSuccess("Form created successfully!");
      }

      // Clear cache after successful save
      clearCache();
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to save form");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    title,
    description,
    purpose,
    preventDuplicates,
    fields,
    selectedFieldId,
    isLoading,
    error,
    success,

    setTitle,
    setDescription,
    setPurpose,
    setPreventDuplicates,
    setFields,
    setSelectedFieldId,

    saveForm,
    clearCache,
  };
}
