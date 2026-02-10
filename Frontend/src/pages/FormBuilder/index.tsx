import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import HeaderBar from "./components/HeadBar";
import Alerts from "./components/Alerts";
import FormDetails from "./components/FormDetails";
import AISuggestions from "./components/AISugestions";
import FieldToolbar from "./components/FeildToolbar";
import FieldGrid from "./components/FeildGrid";
import FieldSettingsPanel from "./components/FeildSetingsPanel";
import { useFormLoader } from "./hooks/useFormLoader";
import { useAIFields } from "./hooks/useAIFeilds";
import type { Field, FieldType } from "../../types";

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const {
    title, setTitle,
    description, setDescription,
    purpose, setPurpose,
    fields, setFields,
    selectedFieldId, setSelectedFieldId,
    isLoading, error, success,
    saveForm,
    clearCache
  } = useFormLoader(id);

  const {
    aiSuggestions,
    isLoadingAI,
    aiError,
    getAISuggestions,
    consumeSuggestion
  } = useAIFields(purpose, fields, setFields);

  const addField = (type: FieldType) => {
    const field: Field = {
      id: `field_${Date.now()}`,
      type,
      label: "",
      required: false,
      placeholder: "",
      options: type === "select" || type === "radio" || type === "checkbox" ? [""] : undefined,
      maxRating: type === "rating" ? 5 : undefined,
      acceptedFileTypes: type === "file" ? ".pdf,.jpg,.png" : undefined,
      maxFileSize: type === "file" ? 10 : undefined,
      order: fields.length,
    };
    setFields([...fields, field]);
    setSelectedFieldId(field.id);
    
    // Scroll to the new field after a short delay
    setTimeout(() => {
      const element = document.getElementById(`field-${field.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleFieldSelect = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    
    // On mobile, scroll the field into view
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const element = document.getElementById(`field-${fieldId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <HeaderBar
          isEditMode={isEditMode}
          isLoading={isLoading}
          onCancel={() => navigate("/dashboard")}
          onSave={saveForm}
        />

        <Alerts error={error} success={success} />

        <div className="max-w-7xl mx-auto px-6 py-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-2">
              <FormDetails
                title={title}
                description={description}
                purpose={purpose}
                setTitle={setTitle}
                setDescription={setDescription}
                setPurpose={setPurpose}
                onGenerateAI={getAISuggestions}
                isLoadingAI={isLoadingAI}
              />

              <AISuggestions
                suggestions={aiSuggestions}
                aiError={aiError}
                onAdd={consumeSuggestion}
              />

              <FieldToolbar 
                onAddField={addField}
                fields={fields}
              />

              <FieldGrid
                fields={fields}
                selectedFieldId={selectedFieldId}
                setSelectedFieldId={handleFieldSelect}
                removeField={removeField}
                setFields={setFields}
              />

              {/* Save Button at Bottom */}
              {fields.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Ready to save?</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {fields.length} field{fields.length !== 1 ? 's' : ''} added • {title || 'Untitled Form'}
                      </p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Draft auto-saved
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Clear draft and start over?')) {
                            clearCache();
                            window.location.reload();
                          }
                        }}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                      >
                        Clear Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveForm}
                        disabled={isLoading}
                        className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {isEditMode ? 'Update Form' : 'Save Form'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:block hidden">
              <FieldSettingsPanel
                field={selectedField}
                updateField={updateField}
              />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Floating Settings Panel */}
        {selectedField && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-300 shadow-2xl z-40 max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Edit Field</h3>
              <button
                onClick={() => setSelectedFieldId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FieldSettingsPanel
                field={selectedField}
                updateField={updateField}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
