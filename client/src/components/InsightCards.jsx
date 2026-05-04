import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';

const SectionList = ({ title, items, icon: Icon, iconClass }) => {
  if (!items?.length) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item} className="rounded-md border border-stone-200 bg-stone-50 p-3">
            <div className="flex gap-3">
              <Icon className={`mt-0.5 shrink-0 ${iconClass}`} size={18} aria-hidden="true" />
              <p className="text-sm leading-6 text-stone-700">{item}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

function InsightCards({ insights = [], anomalies = [], recommendations = [], loading }) {
  const hasContent = insights.length || anomalies.length || recommendations.length;

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="text-sun" size={20} aria-hidden="true" />
        <h2 className="text-lg font-semibold text-ink">AI Insights</h2>
      </div>
      {loading && <p className="text-sm text-stone-600">AI is reading the summary...</p>}
      {!loading && !hasContent && (
        <p className="text-sm text-stone-600">Generate insights after uploading a dataset.</p>
      )}
      <div className="grid gap-5">
        <SectionList title="Insights" items={insights} icon={Lightbulb} iconClass="text-leaf" />
        <SectionList title="Anomalies" items={anomalies} icon={AlertTriangle} iconClass="text-sun" />
        <SectionList
          title="Recommendations"
          items={recommendations}
          icon={CheckCircle2}
          iconClass="text-ocean"
        />
      </div>
    </section>
  );
}

export default InsightCards;
