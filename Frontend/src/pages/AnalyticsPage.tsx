import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../services/api';
import type { ApiResponse } from '../types';

interface FieldStatistic {
  fieldId: string;
  label: string;
  type: string;
  responseCount: number;
  distribution?: Record<string, number>;
  distributionPercentages?: Record<string, number>;
  responses?: any[];
}

interface AnalyticsData {
  formId: string;
  formTitle: string;
  responseCount: number;
  fieldStatistics: FieldStatistic[];
}

interface ResponseRecord {
  _id: string;
  formId: string;
  responseData: Record<string, any>;
  submittedAt: string;
}

const AnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const responsesPerPage = 10;

  // Calculate pagination
  const indexOfLastResponse = currentPage * responsesPerPage;
  const indexOfFirstResponse = indexOfLastResponse - responsesPerPage;
  const currentResponses = responses.slice(indexOfFirstResponse, indexOfLastResponse);
  const totalPages = Math.ceil(responses.length / responsesPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (id) {
      loadAnalytics();
      loadResponses();
    }
  }, [id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<AnalyticsData>>(
        `/forms/${id}/analytics`
      );
      setAnalytics(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async () => {
    const res = await api.get<ApiResponse<ResponseRecord[]>>(
      `/forms/${id}/responses`
    );
    setResponses(res.data.data);
  };

  const exportToExcel = () => {
    if (!analytics || responses.length === 0) return;

    setExporting(true);

    const rows = responses.map(r => {
      const row: Record<string, any> = {
        SubmittedAt: new Date(r.submittedAt).toLocaleString(),
      };

      analytics.fieldStatistics.forEach(field => {
        let value = r.responseData[field.fieldId];
        if (Array.isArray(value)) value = value.join(', ');
        row[field.label] = value ?? '';
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(file, `${analytics.formTitle.replace(/\s+/g, '_')}_responses.xlsx`);
    setExporting(false);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFileUrl = (value: any): boolean => {
    return typeof value === 'string' && 
      (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/uploads/'));
  };

  const getFullUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200 border-t-slate-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-slate-700 font-semibold text-lg">Loading analytics...</p>
          <p className="text-slate-500 text-sm mt-1">Crunching the numbers</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md border border-red-100">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Something went wrong</h2>
          <p className="text-gray-600 mb-8 text-center">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors"
          >
            <div className="bg-slate-100 group-hover:bg-slate-200 rounded-lg p-2 mr-3 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to Dashboard
          </button>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-3">
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-2 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {analytics.formTitle}
                  </h1>
                  <p className="text-slate-600 text-lg">Form Analytics & Response Insights</p>
                </div>
              </div>
            </div>

            <button
              onClick={exportToExcel}
              disabled={exporting || responses.length === 0}
              className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-slate-200 text-sm font-medium mb-2 uppercase tracking-wide">Total Responses</p>
              <p className="text-5xl font-bold mb-1">{analytics.responseCount}</p>
              <p className="text-slate-300 text-sm">Submissions received</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-blue-100 text-sm font-medium mb-2 uppercase tracking-wide">Questions</p>
              <p className="text-5xl font-bold mb-1">{analytics.fieldStatistics.length}</p>
              <p className="text-blue-200 text-sm">Fields in form</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-emerald-100 text-sm font-medium mb-2 uppercase tracking-wide">Completion Rate</p>
              <p className="text-5xl font-bold mb-1">
                {analytics.responseCount > 0 ? '100' : '0'}%
              </p>
              <p className="text-emerald-200 text-sm">All fields answered</p>
            </div>
          </div>
        </div>

        {/* Field Statistics */}
        {analytics.fieldStatistics.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-600 rounded-lg p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Question Insights</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {analytics.fieldStatistics.map(field => (
                <div key={field.fieldId} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{field.label}</h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold uppercase">
                          {field.type}
                        </span>
                        <span className="text-sm text-slate-600 font-medium">
                          {field.responseCount} responses
                        </span>
                      </div>
                    </div>
                  </div>

                  {field.distribution && (
                    <div className="space-y-4 mt-6">
                      {Object.entries(field.distribution).map(([option, count]) => (
                        <div key={option}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-gray-800">{option}</span>
                            <span className="text-slate-600 font-medium">
                              {count} <span className="text-slate-400">({field.distributionPercentages?.[option]}%)</span>
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-500"
                              style={{ width: `${field.distributionPercentages?.[option]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {field.responses && field.responses.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Sample Responses:</p>
                      <ul className="space-y-2">
                        {field.responses.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-sm text-slate-600 pl-4 py-2 border-l-3 border-slate-300 bg-slate-50 rounded-r">
                            {String(r)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Responses */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-slate-600 rounded-lg p-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">All Responses</h2>
          </div>

          {responses.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-600 text-xl font-semibold">No responses yet</p>
              <p className="text-slate-400 text-sm mt-2">Responses will appear here once users submit the form</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {currentResponses.map((response, index) => {
                  const actualIndex = indexOfFirstResponse + index;
                  return (
                    <div key={response._id} className="border-2 border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                            {actualIndex + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">Response #{actualIndex + 1}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDate(response.submittedAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {Object.entries(response.responseData).map(([fieldId, value]) => {
                          const field = analytics.fieldStatistics.find(f => f.fieldId === fieldId);
                          const label = field?.label || fieldId;
                          const isFile = isFileUrl(value);

                          return (
                            <div key={fieldId} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                              <p className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wide">{label}</p>
                              {isFile ? (
                                <a
                                  href={getFullUrl(String(value))}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                  </svg>
                                  View File
                                </a>
                              ) : Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-2">
                                  {value.map((v, i) => (
                                    <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200">
                                      {String(v)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-900 font-semibold text-lg">{String(value)}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-slate-200 pt-8">
                  <div className="text-sm text-slate-600 font-medium">
                    Showing <span className="font-bold text-slate-900">{indexOfFirstResponse + 1}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastResponse, responses.length)}</span> of <span className="font-bold text-slate-900">{responses.length}</span> responses
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-5 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                currentPage === page
                                  ? 'bg-slate-600 text-white shadow-lg scale-110'
                                  : 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 text-slate-400 font-bold">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-5 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
