import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChartPanel from '../components/ChartPanel.jsx';
import ChatWithData from '../components/ChatWithData.jsx';
import DataTable from '../components/DataTable.jsx';
import HistorySidebar from '../components/HistorySidebar.jsx';
import InsightCards from '../components/InsightCards.jsx';
import { generateInsights, getDataset, getHistory } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function Dashboard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { datasetId: datasetIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('datasetId') || datasetIdParam;
  const initialDataset = location.state?.dataset || null;
  const [dataset, setDataset] = useState(initialDataset);
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [chartSuggestion, setChartSuggestion] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [error, setError] = useState('');

  const authUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/auth/google`
    : 'http://localhost:5000/api/auth/google';

  useEffect(() => {
    if (!user) return;

    getHistory().then(setHistory).catch(() => setHistory([]));
  }, [user]);

  useEffect(() => {
    if (dataset || !datasetId) return;

    setLoadingDataset(true);
    setError('');
    getDataset(datasetId)
      .then(setDataset)
      .catch((requestError) => {
        const message = requestError.response?.data?.message || 'Unable to load dataset.';
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoadingDataset(false));
  }, [datasetId, user]);

  const runInsights = async () => {
    if (!datasetId && !dataset?.rawSummary) return;

    setLoadingInsights(true);
    setError('');

    try {
      const result = await generateInsights({
        datasetId,
        rawSummary: dataset?.rawSummary
      });
      setInsights(result.insights || []);
      setAnomalies(result.anomalies || []);
      setRecommendations(result.recommendations || []);
      setChartSuggestion(result.chartSuggestion || result.analysis?.chartSuggestion || null);
      if (user) {
        const items = await getHistory();
        setHistory(items);
      }
      toast.success('Insights generated');
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Unable to generate insights.';
      setError(message);
      toast.error(message);
    } finally {
      setLoadingInsights(false);
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

  if (!datasetId && !dataset) {
    return (
      <section className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">No dataset selected</h1>
        <p className="mt-2 text-sm text-stone-600">Upload a file to open the analysis dashboard.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {!user && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900 shadow-sm">
            You are not logged in. Upload and analysis will work, but results are not saved to your account.
          </div>
        )}
        <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Analysis Dashboard</h1>
            <p className="text-sm text-stone-600">
              {loadingDataset ? 'Loading dataset...' : dataset?.fileName || 'Dataset preview'}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white disabled:bg-stone-300"
            disabled={!dataset || loadingInsights}
            onClick={runInsights}
          >
            {loadingInsights ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <DataTable dataset={dataset} />
        <div className="grid gap-6 xl:grid-cols-2">
          <InsightCards
            insights={insights}
            anomalies={anomalies}
            recommendations={recommendations}
            loading={loadingInsights}
          />
          <ChartPanel chartSuggestion={chartSuggestion} rows={dataset?.preview || []} />
        </div>
        <ChatWithData datasetId={datasetId} rawSummary={dataset?.rawSummary} />
      </div>
      <HistorySidebar analyses={history} />
    </div>
  );
}

export default Dashboard;
