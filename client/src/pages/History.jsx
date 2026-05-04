import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteAnalysis, getAnalysis, getHistory } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function History() {
  const { analysisId } = useParams();
  const { user, loading } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  const authUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/auth/google`
    : 'http://localhost:5000/api/auth/google';

  const loadHistory = async () => {
    setLoadingHistory(true);
    setError('');

    try {
      const items = await getHistory();
      setAnalyses(items);
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Unable to load history.';
      setError(message);
      toast.error(message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (!user || !analysisId) {
      setSelectedAnalysis(null);
      return;
    }

    getAnalysis(analysisId)
      .then(setSelectedAnalysis)
      .catch((requestError) => {
        const message = requestError.response?.data?.message || 'Unable to load analysis.';
        setError(message);
        toast.error(message);
      });
  }, [analysisId, user]);

  const remove = async (id) => {
    try {
      await deleteAnalysis(id);
      setAnalyses((items) => items.filter((analysis) => analysis._id !== id));
      if (selectedAnalysis?._id === id) setSelectedAnalysis(null);
      toast.success('Analysis deleted');
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Unable to delete analysis.');
    }
  };

  if (loading) {
    return (
      <section className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Loading…</h1>
        <p className="mt-2 text-sm text-stone-600">Checking your session status.</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Login required</h1>
        <p className="mt-2 text-sm text-stone-600">Sign in to view and manage your saved analyses.</p>
        <a
          href={authUrl}
          className="mt-6 inline-flex rounded-md bg-ocean px-5 py-3 text-sm font-semibold text-white hover:bg-ocean-700"
        >
          Login with Google
        </a>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 p-5">
        <h1 className="text-2xl font-semibold text-ink">Saved Analyses</h1>
        <p className="mt-1 text-sm text-stone-600">Review previous questions and AI responses.</p>
      </div>
      {error && <div className="m-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {selectedAnalysis && (
        <article className="m-5 rounded-lg border border-teal-100 bg-teal-50 p-5">
          <h2 className="font-semibold text-ink">{selectedAnalysis.question}</h2>
          <p className="mt-1 text-xs text-stone-500">
            {selectedAnalysis.datasetId?.originalName || selectedAnalysis.datasetId?.fileName || 'Dataset'}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700">
            {selectedAnalysis.aiResponse}
          </p>
        </article>
      )}
      {loadingHistory ? (
        <p className="p-5 text-sm text-stone-600">Loading...</p>
      ) : (
        <div className="divide-y divide-stone-200">
          {analyses.length === 0 && <p className="p-5 text-sm text-stone-600">No analyses saved.</p>}
          {analyses.map((analysis) => (
            <article key={analysis._id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-ink">{analysis.question}</h2>
                  <p className="mt-1 text-xs text-stone-500">
                    {analysis.datasetId?.originalName || analysis.datasetId?.fileName || 'Dataset'} -{' '}
                    {new Date(analysis.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stone-300 text-stone-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => remove(analysis._id)}
                  aria-label="Delete analysis"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                {analysis.aiResponse}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default History;
