import type { FieldType, Field } from "../../../types";

interface Props {
  onAddField: (type: FieldType) => void;
  fields: Field[];
}

export default function FieldToolbar({ onAddField, fields }: Props) {
  const handleDragStart = (e: React.DragEvent, fieldType: FieldType) => {
    e.dataTransfer.setData('fieldType', fieldType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-base sm:text-lg text-gray-900">Form Fields</h2>
            <p className="text-xs text-gray-500">{fields.length} field{fields.length !== 1 ? 's' : ''} added</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs sm:text-sm text-gray-600 mb-3 font-medium">Drag & Drop or Click to Add:</p>
        <div className="flex flex-wrap gap-2 -mx-1 px-1">
          {["text", "email", "textarea", "select", "radio", "checkbox", "date", "rating", "file"].map(t => (
            <button
              type="button"
              key={t}
              draggable
              onDragStart={(e) => handleDragStart(e, t as FieldType)}
              onClick={() => onAddField(t as FieldType)}
              className="group px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 shadow-sm hover:shadow-md active:scale-95 border border-slate-200 hover:border-slate-300 cursor-grab active:cursor-grabbing whitespace-nowrap"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="truncate">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-200 rounded-lg bg-slate-50">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium text-sm sm:text-base">No fields added yet</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Drag a field type here or click to add</p>
        </div>
      )}
    </div>
  );
}

