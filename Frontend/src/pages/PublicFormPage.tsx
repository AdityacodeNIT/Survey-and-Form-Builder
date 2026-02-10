import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { Form, Field, ResponseData } from '../types';

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
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const e = { ...prev };
        delete e[fieldId];
        return e;
      });
    }
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    try {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: true }));
      const fd = new FormData();
      fd.append('file', file);
      
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      const res = await api.post('/upload', fd);
      
      console.log('Upload response:', res.data);
      
      // Convert relative URL to absolute URL
      const fileUrl = res.data.data.url.startsWith('http') 
        ? res.data.data.url 
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${res.data.data.url}`;
      
      setUploadedFiles(prev => ({
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
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }));
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
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.post(`/forms/${form?._id}/responses`, { responseData: formData });
      setSuccess(true);
      setFormData({});
      setUploadedFiles({});
    } catch {
      setError('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Google-Forms-style progress
  const requiredFields = form?.fields.filter(f => f.required) || [];
  const completedRequired = requiredFields.filter(f => {
    const v = formData[f.id];
    if (f.type === 'checkbox') return Array.isArray(v) && v.length > 0;
    return v;
  }).length;
  const progress =
    requiredFields.length === 0
      ? 100
      : Math.round((completedRequired / requiredFields.length) * 100);

  const inputBase =
    'w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition';

  const renderField = (field: Field) => {
    const value = formData[field.id] || '';
    const hasError = !!validationErrors[field.id];

    return (
      <div
        key={field.id}
        onFocus={() => setActiveField(field.id)}
        className={`bg-white border rounded-xl p-6 mb-6 transition
          ${
            activeField === field.id
              ? 'border-indigo-500 ring-2 ring-indigo-100'
              : 'border-gray-200'
          }`}
      >
        <label className="block text-sm font-medium text-gray-900 mb-3">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === 'text' && (
          <input
            className={inputBase}
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            rows={4}
            className={`${inputBase} resize-none`}
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
          />
        )}

        {field.type === 'select' && (
          <select
            className={inputBase}
            value={value}
            onChange={e => handleFieldChange(field.id, e.target.value)}
          >
            <option value="">Select</option>
            {field.options?.map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        )}

        {field.type === 'radio' && (
          <div className="space-y-3">
            {field.options?.map(o => (
              <label key={o} className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={value === o}
                  onChange={() => handleFieldChange(field.id, o)}
                  className="h-4 w-4 text-indigo-600"
                />
                <span className="text-gray-700">{o}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && (
          <div className="space-y-3">
            {field.options?.map(o => {
              const checked = Array.isArray(value) && value.includes(o);
              return (
                <label key={o} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => {
                      const newVal = e.target.checked
                        ? [...(value || []), o]
                        : (value || []).filter((v: string) => v !== o);
                      handleFieldChange(field.id, newVal);
                    }}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="text-gray-700">{o}</span>
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
            onChange={e => handleFieldChange(field.id, e.target.value)}
          />
        )}

        {field.type === 'rating' && (
          <div className="flex gap-3">
            {Array.from({ length: field.maxRating || 5 }).map((_, i) => {
              const r = i + 1;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleFieldChange(field.id, r.toString())}
                  className={`h-9 w-9 rounded-full border text-sm font-medium
                    ${
                      r <= Number(value)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 text-gray-600'
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
              // Uploading state
              <div className="border-2 border-indigo-300 bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      Uploading file...
                    </p>
                    <p className="text-xs text-indigo-700">
                      Please wait
                    </p>
                  </div>
                </div>
              </div>
            ) : uploadedFiles[field.id] ? (
              // File uploaded - show success state
              <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 truncate">
                        {uploadedFiles[field.id].name}
                      </p>
                      <p className="text-xs text-green-700">
                        File uploaded successfully
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFiles(prev => {
                        const newFiles = { ...prev };
                        delete newFiles[field.id];
                        return newFiles;
                      });
                      handleFieldChange(field.id, '');
                    }}
                    className="ml-4 text-green-700 hover:text-green-900"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-${field.id}`)?.click()}
                  className="mt-3 w-full px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                >
                  Change File
                </button>
              </div>
            ) : (
              // No file uploaded - show upload area
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
                    e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
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
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-1 text-sm text-gray-700 font-medium">
                      <span className="text-indigo-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
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
          <p className="mt-2 text-sm text-red-600">
            This question is required
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading form…
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Response recorded</h2>
          <p className="text-gray-600 mb-4">
            Your response has been submitted successfully.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="  max-w-3xl mx-auto">
        {/* Header */}
        <div className=" bg-white border rounded-xl p-8 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {form?.title}
          </h1>
          {form?.description && (
            <p className="mt-2 text-gray-600">{form.description}</p>
          )}
          <p className="mt-3 text-sm text-gray-500">
            <span className="text-red-500">*</span> Required
          </p>

   
        
        </div>

            <div className="h-2 bg-indigo-600 rounded-b-xl mb-6" />

        <form onSubmit={handleSubmit}>
          {form?.fields
            .sort((a, b) => a.order - b.order)
            .map(renderField)}

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="bg-white border rounded-xl p-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Powered by AI Form Builder
        </p>
      </div>
    </div>
  );
};

export default PublicFormPage;
