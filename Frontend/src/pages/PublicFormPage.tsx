import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  options?: string[];
  maxRating?: number;
  acceptedFileTypes?: string;
  maxFileSize?: number;
}

interface Form {
  _id: string;
  title: string;
  description?: string;
  fields: Field[];
}

type ResponseData = Record<string, any>;

const PublicFormPage = () => {
  const { shareableUrl } = useParams<{ shareableUrl: string }>();

  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<ResponseData>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, { name: string; url: string }>
  >({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    loadForm();
  }, [shareableUrl]);

  const loadForm = async () => {
    try {
      const res = await api.get(`/public/forms/${shareableUrl}`);
      setForm(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev: ResponseData) => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors((prev: Record<string, string>) => {
        const e = { ...prev };
        delete e[fieldId];
        return e;
      });
    }
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    try {
      setUploadingFiles((prev: Record<string, boolean>) => ({ ...prev, [fieldId]: true }));
      const fd = new FormData();
      fd.append('file', file);
      
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      const res = await api.post('/upload', fd);
      
      console.log('Upload response:', res.data);
      
      // Convert relative URL to absolute URL
      const fileUrl = res.data.data.url.startsWith('http') 
        ? res.data.data.url 
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${res.data.data.url}`;
      
      setUploadedFiles((prev: Record<string, { name: string; url: string }>) => ({
        ...prev,
        [fieldId]: {
          name: res.data.data.originalName,
          url: fileUrl,
        },
      }));
      handleFieldChange(fieldId, fileUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response);
      alert(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setUploadingFiles((prev: Record<string, boolean>) => ({ ...prev, [fieldId]: false }));
    }
  };

  const validateForm = () => {
    if (!form) return false;
    const errors: Record<string, string> = {};

    for (const field of form.fields) {
      const v = formData[field.id];
      if (field.required) {
        if (field.type === 'checkbox' && (!Array.isArray(v) || v.length === 0)) {
          errors[field.id] = 'Required';
        } else if (!v) {
          errors[field.id] = 'Required';
        }
      }
    }

    setValidationErrors(errors);
    
    // Scroll to first error if any
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(`field-${firstErrorField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (submitting) return; // Prevent double submission
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.post(`/forms/${form?._id}/responses`, { responseData: formData });
      setSuccess(true);
      setFormData({});
      setUploadedFiles({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-0 outline-none transition-all duration-200 bg-white hover:border-gray-300';

  const renderField = (field: Field) => {
    const value = formData[field.id] || '';
    const hasError = !!validationErrors[field.id];

    return (
      <div
        key={field.id}
        id={`field-${field.id}`}
        onFocus={() => setActiveField(field.id)}
        onBlur={() => setActiveField(null)}
        className={`bg-white border-2 rounded-xl p-6 transition-all duration-300 shadow-sm hover:shadow-md
          ${
            activeField === field.id
              ? 'border-indigo-500 shadow-lg scale-[1.01]'
              : hasError
              ? 'border-red-300'
              : 'border-gray-200'
          }`}
      >
        <label className="block text-base font-semibold text-gray-800 mb-4 text-left">
          {field.label}
          {field.required && <span className="text-red-500 ml-1.5 text-lg">*</span>}
        </label>

        {field.type === 'text' && (
          <input
            className={inputBase}
            value={value}
            placeholder="Your answer"
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            rows={5}
            className={`${inputBase} resize-none`}
            value={value}
            placeholder="Your answer"
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )}

        {field.type === 'select' && (
          <select
            className={inputBase}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          >
            <option value="">Choose an option</option>
            {field.options?.map((o: string) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        )}

        {field.type === 'radio' && (
          <div className="space-y-3">
            {field.options?.map((o: string) => (
              <label key={o} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  checked={value === o}
                  onChange={() => handleFieldChange(field.id, o)}
                  className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-800 font-medium">{o}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && (
          <div className="space-y-3">
            {field.options?.map((o: string) => {
              const checked = Array.isArray(value) && value.includes(o);
              return (
                <label key={o} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const newVal = e.target.checked
                        ? [...(value || []), o]
                        : (value || []).filter((v: string) => v !== o);
                      handleFieldChange(field.id, newVal);
                    }}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-800 font-medium">{o}</span>
                </label>
              );
            })}
          </div>
        )}

        {field.type === 'date' && (
          <input
            type="date"
            className={inputBase}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )}

        {field.type === 'rating' && (
          <div className="flex gap-2">
            {Array.from({ length: field.maxRating || 5 }).map((_: unknown, i: number) => {
              const r = i + 1;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleFieldChange(field.id, r.toString())}
                  className={`h-12 w-12 rounded-xl border-2 text-base font-bold transition-all duration-200 hover:scale-110
                    ${
                      r <= Number(value)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                    }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        )}

        {field.type === 'file' && (
          <div>
            {uploadingFiles[field.id] ? (
              <div className="border-2 border-indigo-400 bg-indigo-50 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <div>
                    <p className="text-base font-semibold text-indigo-900">
                      Uploading file...
                    </p>
                    <p className="text-sm text-indigo-700">
                      Please wait while we process your file
                    </p>
                  </div>
                </div>
              </div>
            ) : uploadedFiles[field.id] ? (
              <div className="border-2 border-green-400 bg-green-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-green-900 truncate">
                        {uploadedFiles[field.id].name}
                      </p>
                      <p className="text-sm text-green-700">
                        File uploaded successfully
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFiles((prev) => {
                        const newFiles = { ...prev };
                        delete newFiles[field.id];
                        return newFiles;
                      });
                      handleFieldChange(field.id, '');
                    }}
                    className="ml-4 text-green-700 hover:text-green-900 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-${field.id}`)?.click()}
                  className="mt-4 w-full px-5 py-3 bg-white border-2 border-green-400 text-green-700 rounded-md hover:bg-green-50 transition-all text-base font-semibold"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept={field.acceptedFileTypes || '*'}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const maxSize = (field.maxFileSize || 10) * 1024 * 1024;
                      if (file.size > maxSize) {
                        alert(`File size exceeds ${field.maxFileSize || 10}MB limit`);
                        e.target.value = '';
                        return;
                      }
                      await handleFileUpload(field.id, file);
                    }
                  }}
                  className="hidden"
                  id={`file-${field.id}`}
                />
                <label
                  htmlFor={`file-${field.id}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50', 'scale-[1.02]');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50', 'scale-[1.02]');
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50', 'scale-[1.02]');
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const maxSize = (field.maxFileSize || 10) * 1024 * 1024;
                      if (file.size > maxSize) {
                        alert(`File size exceeds ${field.maxFileSize || 10}MB limit`);
                        return;
                      }
                      await handleFileUpload(field.id, file);
                    }
                  }}
                  className="flex flex-col items-center justify-center w-full h-40 border-3 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200"
                >
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <svg className="w-12 h-12 mb-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-base text-gray-700 font-semibold">
                      <span className="text-indigo-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      {field.acceptedFileTypes ? `${field.acceptedFileTypes.toUpperCase()}` : 'Any file type'}
                      {field.maxFileSize && ` (Max ${field.maxFileSize}MB)`}
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {hasError && (
          <div className="mt-3 flex items-center gap-2 text-red-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">This question is required</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading form...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
        <div className="bg-white border-2 border-green-200 rounded-2xl p-12 text-center max-w-md w-full shadow-2xl">
          <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Response Submitted!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for your submission. Your response has been recorded successfully.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
            }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="relative bg-white border-b-4 border-purple-300 rounded-2xl p-8 mb-4 shadow-xl border-4 border-indigo-100 overflow-hidden">
          {/* Decorative ring elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg ring-4 ring-indigo-100">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {form?.title}
                </h1>
                {form?.description && (
                  <p className="text-gray-600 text-lg">{form.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-red-500 text-xl font-bold">*</span> 
                  <span className="font-medium">Indicates required field</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {form?.fields
            .sort((a: Field, b: Field) => a.order - b.order)
            .map(renderField)}

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Response
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            Powered by AI Form Builder
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicFormPage;
