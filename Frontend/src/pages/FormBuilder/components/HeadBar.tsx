interface Props {
  isEditMode: boolean;
  isLoading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function HeaderBar({ isEditMode, onCancel }: Props) {
  return (
    <div className="bg-white border-b shadow-sm sticky top-16 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-600 hover:text-slate-800 transition-colors flex-shrink-0"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Form" : "Create New Form"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Build professional forms & surveys with AI assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
