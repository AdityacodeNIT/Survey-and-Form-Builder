import type { AISuggestion } from "../../../types";

interface Props {
  suggestions: AISuggestion[];
  aiError: string;
  onAdd: (suggestion: AISuggestion) => void;
}

export default function AISuggestions({ suggestions, aiError, onAdd }: Props) {
  if (aiError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg shadow-sm flex items-start gap-3">
        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span>{aiError}</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h2 className="font-semibold text-lg text-gray-900">AI Suggestions</h2>
            <p className="text-xs text-gray-500">{suggestions.length} fields generated</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {suggestions.map(s => (
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
                onClick={() => onAdd(s)}
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
  );
}
