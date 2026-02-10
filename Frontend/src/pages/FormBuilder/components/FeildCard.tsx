import type { Field } from "../../../types";

interface Props {
  field: Field;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export default function FieldCard({
  field,
  index,
  isSelected,
  onSelect,
  onRemove,
}: Props) {
  return (
    <div
      id={`field-${field.id}`}
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all bg-white ${
        isSelected
          ? "border-slate-500 ring-2 ring-slate-200"
          : "border-gray-200 hover:border-slate-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
          {/* Drag Handle */}
          <div className="drag-handle cursor-move text-gray-400 select-none">
            ⋮⋮
          </div>

          <div className="w-8 h-8 bg-slate-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>

          <div className="flex-1">
            <span className="font-medium text-gray-900 block">
              {field.label || "Untitled Field"}
            </span>

            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">
                {field.type}
              </span>

              {field.required && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
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
            onRemove();
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-lg"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
