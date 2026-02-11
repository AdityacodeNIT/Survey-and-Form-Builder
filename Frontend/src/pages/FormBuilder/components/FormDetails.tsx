interface Props {
  title: string;
  description: string;
  purpose: string;
  preventDuplicates: boolean;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setPurpose: (v: string) => void;
  setPreventDuplicates: (v: boolean) => void;
  onGenerateAI: () => void;
  isLoadingAI: boolean;
}

export default function FormDetails(props: Props) {
  const {
    title, description, purpose, preventDuplicates,
    setTitle, setDescription, setPurpose, setPreventDuplicates,
    onGenerateAI, isLoadingAI
  } = props;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="font-semibold text-base sm:text-md text-gray-900">Form Details</h2>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Form Title *
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition"
          placeholder="e.g., Customer Feedback Survey"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition resize-none"
          placeholder="Brief description of your form..."
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {/* Prevent Duplicates Toggle */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="preventDuplicates"
            checked={preventDuplicates}
            onChange={e => setPreventDuplicates(e.target.checked)}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor="preventDuplicates" className="block text-sm font-semibold text-gray-900 cursor-pointer">
              Prevent Duplicate Submissions by Email
            </label>
            <p className="text-xs text-gray-600 mt-1 leading-tight">
              When enabled, each email address can only submit this form once. This requires at least one email field in your form.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 border border-slate-200">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
         
          AI Purpose (Optional)
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition bg-white"
          placeholder="e.g., Collect customer satisfaction feedback"
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Describe the purpose to generate AI-powered field suggestions
        </p>
        
        <button
          type="button"
          onClick={onGenerateAI}
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
  );
}


