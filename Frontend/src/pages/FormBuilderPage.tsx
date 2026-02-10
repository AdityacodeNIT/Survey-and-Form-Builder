import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import type { Field, FieldType, Form, AISuggestion } from "../types";

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiCache, setAiCache] = useState<Record<string, AISuggestion[]>>({});

  useEffect(() => {
    if (isEditMode && id) loadForm(id);
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/forms/${formId}`);
      const form: Form = res.data.data;
      setTitle(form.title);
      setDescription(form.description || "");
      setPurpose(form.purpose || "");
      setFields(form.fields);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load form");
    } finally {
      setIsLoading(false);
    }
  };

  const addField = (type: FieldType) => {
    const field: Field = {
      id: `field_${Date.now()}`,
      type,
      label: "",
      required: false,
      placeholder: "",
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? [""]
          : undefined,
      maxRating: type === "rating" ? 5 : undefined,
      acceptedFileTypes: type === "file" ? ".pdf,.jpg,.png" : undefined,
      maxFileSize: type === "file" ? 10 : undefined,
      order: fields.length,
    };
    setFields([...fields, field]);
    setSelectedFieldId(field.id);
  };

  const updateField = (id: string, updates: Partial<Field>) =>
    setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)));

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const saveForm = async () => {
    // Prevent double submission
    if (isLoading) return;
    
    // Validate first without clearing messages
    if (!title.trim()) {
      setError("Form title is required");
      setSuccess("");
      return;
    }
    if (!fields.length) {
      setError("Add at least one field");
      setSuccess("");
      return;
    }

    // Validate each field
    for (const field of fields) {
      if (!field.label.trim()) {
        setError(`Field label is required for all fields`);
        setSuccess("");
        return;
      }
      if ((field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (!field.options || field.options.length === 0 || field.options.every((opt: string) => !opt.trim()))) {
        setError(`Field "${field.label}" must have at least one valid option`);
        setSuccess("");
        return;
      }
    }

    // Clear messages only after validation passes
    setError("");
    setSuccess("");

    try {
      setIsLoading(true);
      const payload = {
        title,
        description,
        purpose,
        fields: fields.map((f, i) => ({ ...f, order: i })),
      };

      if (isEditMode && id) {
        await api.put(`/forms/${id}`, payload);
        setSuccess("Form updated successfully!");
        setIsLoading(false);
        navigate('/dashboard');
      } else {
        await api.post("/forms", payload);
        setSuccess("Form created successfully!");
        setIsLoading(false);
        navigate('/dashboard');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to save form");
      setIsLoading(false);
    }
  };

  const getAISuggestions = async () => {
    if (!purpose.trim()) return setAiError("Enter purpose first");
    
    // Check cache first
    const cacheKey = purpose.trim().toLowerCase();
    if (aiCache[cacheKey]) {
      setAiSuggestions(aiCache[cacheKey]);
      setSuccess("Loaded suggestions from cache");
      return;
    }

    try {
      setIsLoadingAI(true);
      setAiError('');
      const res = await api.post("/ai/suggestions", { purpose });
      const suggestions = res.data.data;
      
      // Cache the suggestions
      setAiCache(prev => ({ ...prev, [cacheKey]: suggestions }));
      setAiSuggestions(suggestions);
      setSuccess("AI suggestions generated successfully");
    } catch (e: any) {
      setAiError(e.response?.data?.message || "Failed to get AI suggestions");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header Bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-slate-600 hover:text-slate-800 transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Form" : "Create New Form"}
                </h1>
                <p className="text-sm text-gray-500">
                  Build professional forms & surveys with AI assistance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveForm}
                disabled={isLoading}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Form
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg shadow-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-r-lg shadow-sm flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="font-semibold text-lg text-gray-900">Form Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Title *
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                placeholder="e.g., Customer Feedback Survey"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition resize-none"
                placeholder="Brief description of your form..."
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 border border-slate-200">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg"></span>
                AI Purpose (Optional)
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition bg-white"
                placeholder="e.g., Collect customer satisfaction feedback"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Describe the purpose to generate AI-powered field suggestions
              </p>
              
              <button
                type="button"
                onClick={getAISuggestions}
                disabled={isLoadingAI || !purpose.trim()}
                className="w-full mt-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-2.5 rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoadingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="text-lg">✨</span>
                    Generate AI Fields
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">AI Suggestions</h2>
                    <p className="text-xs text-gray-500">{aiSuggestions.length} fields generated</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                {aiSuggestions.map(s => (
                  <div
                    key={s.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all bg-gradient-to-r from-white to-slate-50"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{s.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {s.fieldType}
                          </span>
                          {s.required && (
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newField: Field = {
                            id: `field_${Date.now()}`,
                            type: s.fieldType || 'text',
                            label: s.label || '',
                            placeholder: s.placeholder,
                            required: s.required || false,
                            options: s.options,
                            order: fields.length,
                          };
                          setFields([...fields, newField]);
                          setAiSuggestions(aiSuggestions.filter(suggestion => suggestion.id !== s.id));
                        }}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg shadow-sm flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{aiError}</span>
            </div>
          )}

          {/* Fields */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-900">Form Fields</h2>
                  <p className="text-xs text-gray-500">{fields.length} field{fields.length !== 1 ? 's' : ''} added</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3 font-medium">Add Field Type:</p>
              <div className="flex flex-wrap gap-2">
                {["text","textarea","select","radio","checkbox","date","rating","file"].map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => addField(t as FieldType)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 font-medium">No fields added yet</p>
                <p className="text-sm text-gray-400 mt-1">Click a field type above to get started</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {fields.map((f, i) => (
                  <li
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedFieldId === f.id
                        ? "border-slate-500 bg-slate-50 shadow-md ring-2 ring-slate-200"
                        : "border-gray-200 hover:bg-gray-50 hover:shadow-sm hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-slate-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 block">
                            {f.label || "Untitled Field"}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-medium">
                              {f.type}
                            </span>
                            {f.required && (
                              <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          removeField(f.id);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* RIGHT - Field Settings Panel */}
        <div>
          {selectedField ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-24 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-lg text-gray-900">Field Settings</h2>
              </div>

              {/* Field Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                  value={selectedField.type}
                  onChange={e => {
                    const newType = e.target.value as FieldType;
                    const updates: Partial<Field> = { type: newType };
                    
                    // Add default options for select/radio/checkbox
                    if (newType === 'select' || newType === 'radio' || newType === 'checkbox') {
                      if (!selectedField.options || selectedField.options.length === 0) {
                        updates.options = ['Option 1', 'Option 2'];
                      }
                    } else {
                      updates.options = undefined;
                    }
                    
                    // Add default rating config
                    if (newType === 'rating') {
                      updates.maxRating = 5;
                    } else {
                      updates.maxRating = undefined;
                    }
                    
                    // Add default file config
                    if (newType === 'file') {
                      updates.acceptedFileTypes = '.pdf,.jpg,.png';
                      updates.maxFileSize = 10;
                    } else {
                      updates.acceptedFileTypes = undefined;
                      updates.maxFileSize = undefined;
                    }
                    
                    updateField(selectedField.id, updates);
                  }}
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select (Dropdown)</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="checkbox">Checkboxes</option>
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="file">File Upload</option>
                </select>
              </div>

              {/* Field Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Label *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                  placeholder="Enter field label"
                  value={selectedField.label}
                  onChange={e =>
                    updateField(selectedField.id, { label: e.target.value })
                  }
                />
              </div>

              {/* Placeholder (not for date, rating, file) */}
              {selectedField.type !== 'date' && 
               selectedField.type !== 'rating' && 
               selectedField.type !== 'file' &&
               selectedField.type !== 'radio' &&
               selectedField.type !== 'checkbox' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
                    placeholder="Enter placeholder text"
                    value={selectedField.placeholder || ''}
                    onChange={e =>
                      updateField(selectedField.id, { placeholder: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Required Checkbox */}
              <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={e =>
                    updateField(selectedField.id, {
                      required: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-slate-600 rounded focus:ring-2 focus:ring-slate-500"
                />
                <span className="font-medium text-gray-700">Mark as Required Field</span>
              </label>

              {/* Options for select/radio/checkbox */}
              {(selectedField.type === 'select' || 
                selectedField.type === 'radio' || 
                selectedField.type === 'checkbox') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {selectedField.options?.map((option: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className="flex-1 border rounded-lg px-3 py-2"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={e => {
                            const newOptions = [...(selectedField.options || [])];
                            newOptions[index] = e.target.value;
                            updateField(selectedField.id, { options: newOptions });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = selectedField.options?.filter((_: string, i: number) => i !== index);
                            updateField(selectedField.id, { options: newOptions });
                          }}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...(selectedField.options || []), ''];
                        updateField(selectedField.id, { options: newOptions });
                      }}
                      className="w-full px-3 py-2 border border-dashed rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Rating config */}
              {selectedField.type === 'rating' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="w-full border rounded-lg px-3 py-2"
                    value={selectedField.maxRating || 5}
                    onChange={e =>
                      updateField(selectedField.id, { 
                        maxRating: parseInt(e.target.value) || 5 
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">Set rating scale (1-10)</p>
                </div>
              )}

              {/* File upload config */}
              {selectedField.type === 'file' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accepted File Types
                    </label>
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder=".pdf,.doc,.jpg"
                      value={selectedField.acceptedFileTypes || ''}
                      onChange={e =>
                        updateField(selectedField.id, { 
                          acceptedFileTypes: e.target.value 
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated file extensions
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full border rounded-lg px-3 py-2"
                      value={selectedField.maxFileSize || 10}
                      onChange={e =>
                        updateField(selectedField.id, { 
                          maxFileSize: parseInt(e.target.value) || 10 
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum file size allowed (1-100 MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center sticky top-24">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 font-medium mb-1">No Field Selected</p>
              <p className="text-sm text-gray-400">Click on a field to configure its settings</p>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </>
  );
}
