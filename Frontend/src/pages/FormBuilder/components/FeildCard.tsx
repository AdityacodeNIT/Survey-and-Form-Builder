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
      className={`p-2 sm:p-4 rounded-lg border-2 cursor-pointer transition-all bg-white ${
        isSelected
          ? "border-slate-500 ring-2 ring-slate-200"
          : "border-gray-200 hover:border-slate-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <div className="drag-handle cursor-move text-gray-400 select-none text-xs sm:text-base flex-shrink-0">
            ⋮⋮
          </div>

          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 block text-xs sm:text-base truncate">
              {field.label || "Untitled Field"}
            </span>

            <div className="flex gap-1 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
              <span className="text-[10px] sm:text-xs bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium whitespace-nowrap">
                {field.type}
              </span>

              {field.required && (
                <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium whitespace-nowrap">
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
          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px] sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex-shrink-0 whitespace-nowrap"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
