import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FileUpload from '../components/FileUpload.jsx';
import { uploadDataset } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const authUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/auth/google`
    : 'http://localhost:5000/api/auth/google';

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');

    try {
      const dataset = await uploadDataset(file);
      toast.success('Dataset uploaded');

      if (dataset._id) {
        navigate(`/dashboard?datasetId=${dataset._id}`);
      } else {
        navigate('/dashboard', { state: { dataset } });
      }
    } catch (uploadError) {
      const message = uploadError.response?.data?.message || 'Upload failed. Check the server.';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-stone-600">Checking login status...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <FileUpload onUpload={handleUpload} loading={uploading} />
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-ink">Analyze spreadsheet data with AI</h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          Upload operational, sales, finance, or research data and move directly into preview,
          AI-generated observations, chart suggestions, and follow-up questions.
        </p>
        <dl className="mt-6 grid gap-4">
          <div>
            <dt className="text-sm font-semibold text-ink">Supported formats</dt>
            <dd className="text-sm text-stone-600">CSV, XLS, XLSX</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink">Stored outputs</dt>
            <dd className="text-sm text-stone-600">Dataset metadata, previews, questions, and responses</dd>
          </div>
        </dl>
        {!user ? (
          <div className="mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
            You can continue without logging in, but uploads and analysis results will not be saved.
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
            Logged in users can save datasets and continue history across sessions.
          </div>
        )}
        {!user && (
          <a
            href={authUrl}
            className="mt-6 inline-flex rounded-md bg-ocean px-5 py-3 text-sm font-semibold text-white hover:bg-ocean-700"
          >
            Login with Google to save work
          </a>
        )}
        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
