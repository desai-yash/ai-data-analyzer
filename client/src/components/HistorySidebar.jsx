import { Link } from 'react-router-dom';
import { Clock3 } from 'lucide-react';

function HistorySidebar({ analyses = [] }) {
  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Clock3 size={18} className="text-ocean" aria-hidden="true" />
        <h2 className="font-semibold text-ink">Recent Analyses</h2>
      </div>
      <div className="space-y-2">
        {analyses.length === 0 && <p className="text-sm text-stone-600">No saved analyses yet.</p>}
        {analyses.slice(0, 8).map((analysis) => (
          <Link
            key={analysis._id}
            to={`/history/${analysis._id}`}
            className="block rounded-md border border-stone-200 p-3 text-sm hover:bg-stone-50"
          >
            <p className="line-clamp-2 font-medium text-ink">{analysis.question}</p>
            <p className="mt-1 truncate text-xs text-stone-500">
              {analysis.datasetId?.fileName || 'Dataset'}
            </p>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default HistorySidebar;
