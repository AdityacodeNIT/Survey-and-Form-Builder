import type { Field, FieldType } from "../../../types";

interface Props {
  field?: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
}

export default function FieldSettingsPanel({ field, updateField }: Props) {
  if (!field) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center sticky top-32">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-gray-500 font-medium mb-1">No Field Selected</p>
        <p className="text-sm text-gray-400">Click on a field to configure its settings</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto space-y-5">
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
          value={field.type}
          onChange={e => {
            const newType = e.target.value as FieldType;
            const updates: Partial<Field> = { type: newType };
            
            if (newType === 'select' || newType === 'radio' || newType === 'checkbox') {
              if (!field.options || field.options.length === 0) {
                updates.options = ['Option 1', 'Option 2'];
              }
            } else {
              updates.options = undefined;
            }
            
            if (newType === 'rating') {
              updates.maxRating = 5;
            } else {
              updates.maxRating = undefined;
            }
            
            if (newType === 'file') {
              updates.acceptedFileTypes = '.pdf,.jpg,.png';
              updates.maxFileSize = 10;
            } else {
              updates.acceptedFileTypes = undefined;
              updates.maxFileSize = undefined;
            }
            
            updateField(field.id, updates);
          }}
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
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
          value={field.label}
          onChange={e => updateField(field.id, { label: e.target.value })}
        />
      </div>

      {/* Placeholder */}
      {field.type !== 'date' && 
       field.type !== 'rating' && 
       field.type !== 'file' &&
       field.type !== 'radio' &&
       field.type !== 'checkbox' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Placeholder
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
            placeholder="Enter placeholder text"
            value={field.placeholder || ''}
            onChange={e => updateField(field.id, { placeholder: e.target.value })}
          />
        </div>
      )}

      {/* Required Checkbox */}
      <label className="flex items-center gap-3 text-sm cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
        <input
          type="checkbox"
          checked={field.required}
          onChange={e => updateField(field.id, { required: e.target.checked })}
          className="w-5 h-5 text-slate-600 rounded focus:ring-2 focus:ring-slate-500"
        />
        <span className="font-medium text-gray-700">Mark as Required Field</span>
      </label>

      {/* Options for select/radio/checkbox */}
      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={e => {
                    const newOptions = [...(field.options || [])];
                    newOptions[index] = e.target.value;
                    updateField(field.id, { options: newOptions });
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = field.options?.filter((_: string, i: number) => i !== index);
                    updateField(field.id, { options: newOptions });
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
                const newOptions = [...(field.options || []), ''];
                updateField(field.id, { options: newOptions });
              }}
              className="w-full px-3 py-2 border border-dashed rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      {/* Rating config */}
      {field.type === 'rating' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Rating
          </label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full border rounded-lg px-3 py-2"
            value={field.maxRating || 5}
            onChange={e => updateField(field.id, { maxRating: parseInt(e.target.value) || 5 })}
          />
          <p className="text-xs text-gray-500 mt-1">Set rating scale (1-10)</p>
        </div>
      )}

      {/* File upload config */}
      {field.type === 'file' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accepted File Types
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder=".pdf,.doc,.jpg"
              value={field.acceptedFileTypes || ''}
              onChange={e => updateField(field.id, { acceptedFileTypes: e.target.value })}
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
              value={field.maxFileSize || 10}
              onChange={e => updateField(field.id, { maxFileSize: parseInt(e.target.value) || 10 })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size allowed (1-100 MB)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
