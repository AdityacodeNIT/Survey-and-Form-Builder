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
    // Convert relative URL to absolute
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {analytics.formTitle}
              </h1>
              <p className="text-gray-600">Form Analytics & Responses</p>
            </div>

            <button
              onClick={exportToExcel}
              disabled={exporting || responses.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-2">Total Responses</p>
              <p className="text-5xl font-bold">{analytics.responseCount}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-6">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Field Statistics */}
        {analytics.fieldStatistics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Question Insights</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {analytics.fieldStatistics.map(field => (
                <div key={field.fieldId} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{field.label}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {field.type} • {field.responseCount} responses
                  </p>

                  {field.distribution && (
                    <div className="space-y-3">
                      {Object.entries(field.distribution).map(([option, count]) => (
                        <div key={option}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{option}</span>
                            <span className="text-gray-600">
                              {count} ({field.distributionPercentages?.[option]}%)
                            </span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                              style={{ width: `${field.distributionPercentages?.[option]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {field.responses && field.responses.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Sample Responses:</p>
                      <ul className="space-y-1">
                        {field.responses.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-sm text-gray-600 pl-4 border-l-2 border-purple-300">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Responses</h2>

          {responses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No responses yet</p>
              <p className="text-gray-400 text-sm mt-2">Responses will appear here once users submit the form</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div key={response._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 text-purple-700 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Response #{index + 1}</p>
                        <p className="text-sm text-gray-500">{formatDate(response.submittedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(response.responseData).map(([fieldId, value]) => {
                      const field = analytics.fieldStatistics.find(f => f.fieldId === fieldId);
                      const label = field?.label || fieldId;
                      const isFile = isFileUrl(value);

                      return (
                        <div key={fieldId} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                          {isFile ? (
                            <a
                              href={getFullUrl(String(value))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View File
                            </a>
                          ) : Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-2">
                              {value.map((v, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                  {String(v)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-900 font-medium">{String(value)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
