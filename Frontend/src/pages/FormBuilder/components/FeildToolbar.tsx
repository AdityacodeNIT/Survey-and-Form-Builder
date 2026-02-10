import type { FieldType, Field } from "../../../types";

interface Props {
  onAddField: (type: FieldType) => void;
  fields: Field[];
}

export default function FieldToolbar({ onAddField, fields }: Props) {
  return (
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
          {["text", "textarea", "select", "radio", "checkbox", "date", "rating", "file"].map(t => (
            <button
              type="button"
              key={t}
              onClick={() => onAddField(t as FieldType)}
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

      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No fields added yet</p>
          <p className="text-sm text-gray-400 mt-1">Click a field type above to get started</p>
        </div>
      )}
    </div>
  );
}
