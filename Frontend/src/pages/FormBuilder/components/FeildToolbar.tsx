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
        <p className="text-sm text-gray-600 mb-3 font-medium">Drag & Drop or Click to Add:</p>
        <div className="flex flex-wrap gap-2">
          {["text", "email", "textarea", "select", "radio", "checkbox", "date", "rating", "file"].map(t => (
            <button
              type="button"
              key={t}
              draggable
              onDragStart={(e) => handleDragStart(e, t as FieldType)}
              onClick={() => onAddField(t as FieldType)}
              className="group px-4 py-2.5 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 border border-slate-200 hover:border-slate-300 cursor-grab active:cursor-grabbing"
            >
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-blue-100 text-black">
  
          <p className="text-gray-500 font-medium">No fields added yet</p>
        </div>
      )}
    </div>
  );
}
