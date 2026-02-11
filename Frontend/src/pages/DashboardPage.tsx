import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import type { Form, ApiResponse } from '../types';

const DashboardPage = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadForms();
  }, []); // Empty dependency array is fine here

  const loadForms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<Form[]>>('/forms');
      const formsData = Array.isArray(response.data.data) ? response.data.data : [];
      setForms(formsData);
    } catch (err: any) {
      console.error('Failed to load forms:', err);
      setError(err.response?.data?.message || 'Failed to load forms');
      setForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/forms/new');
  };

  const handleEdit = (formId: string) => {
    navigate(`/forms/${formId}/edit`);
  };

  const handleDelete = async (formId: string, formTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${formTitle}"? This will also delete all responses.`)) {
      return;
    }

    try {
      await api.delete(`/forms/${formId}`);
      // Optimistic update - remove from UI immediately
      setForms(forms.filter(f => f._id !== formId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete form');
      // Reload if delete failed
      loadForms();
    }
  };

  const handleViewAnalytics = (formId: string) => {
    navigate(`/forms/${formId}/analytics`);
  };

  const handleTogglePublish = async (form: Form) => {
    const isPublishing = form.publishStatus !== 'published';
    
    // Optimistic update
    setForms(forms.map(f => 
      f._id === form._id 
        ? { ...f, publishStatus: isPublishing ? 'published' : 'draft' } 
        : f
    ));

    try {
      if (isPublishing) {
        await api.post(`/forms/${form._id}/publish`);
      } else {
        await api.post(`/forms/${form._id}/unpublish`);
      }
      // Reload to get the shareable URL
      await loadForms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update publish status');
      // Revert on error
      loadForms();
    }
  };

  const copyShareableLink = (shareableUrl: string) => {
    const link = `${window.location.origin}/f/${shareableUrl}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleDescription = (formId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(formId)) {
        newSet.delete(formId);
      } else {
        newSet.add(formId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-50">

            <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Forms & Surveys</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
    
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create New Form Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateNew}
            className="btn-primary inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Form
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Forms List */}
        {forms.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No forms yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first form!</p>
            <button onClick={handleCreateNew} className="mt-4 btn-primary">
              Create Form
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
            {forms.map((form) => (
              <div key={form._id} className="card hover:shadow-lg transition-shadow w-full max-w-full overflow-hidden p-2 ">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="md:text-lg text-md font-semibold text-gray-900 mb-1">{form.title}</h3>
                    {form.description && (
                      <p className="md:text-sm  text-xs text-gray-600 line-clamp-2">{form.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      form.publishStatus === 'published'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {form.publishStatus === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>Created: {formatDate(form.createdAt)}</p>
                  <p>Fields: {form.fields?.length || 0}</p>
                </div>

                {form.publishStatus === 'published' && (
                  <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Public Link:</p>
                    {form.shareableUrl ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={`${window.location.origin}/f/${form.shareableUrl}`}
                            readOnly
                            className="flex-1 text-xs px-2 py-1 bg-white border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => copyShareableLink(form.shareableUrl!)}
                            className="text-slate-600 hover:text-slate-700"
                            title="Copy link"
                          >
                            <svg className="h-3 w-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => window.open(`/f/${form.shareableUrl}`, '_blank')}
                          className="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open Form
                        </button>
                      </>
                    ) : (
                      <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                        ⚠️ Unpublish and re-publish this form to generate a shareable link
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(form._id)}
                    className="flex-1 px-3 py-2 bg-slate-600 text-white text-sm rounded hover:bg-slate-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewAnalytics(form._id)}
                    className="flex-1 px-3 py-2 bg-slate-500 text-white text-sm rounded hover:bg-slate-600 transition-colors"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => handleTogglePublish(form)}
                    className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                      form.publishStatus === 'published'
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-slate-700 text-white hover:bg-slate-800'
                    }`}
                  >
                    {form.publishStatus === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(form._id, form.title)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
