import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const COLORS = ['#0f766e', '#65a30d', '#f59e0b', '#2563eb', '#be123c', '#7c3aed'];

const isNumeric = (value) => value !== '' && value !== null && !Number.isNaN(Number(value));

function ChartPanel({ chartSuggestion, rows = [] }) {
  const keys = rows[0] ? Object.keys(rows[0]) : [];
  const numericKey = keys.find((key) => rows.some((row) => isNumeric(row[key])));
  const xAxis =
    chartSuggestion?.xAxis && keys.includes(chartSuggestion.xAxis) ? chartSuggestion.xAxis : keys[0];
  const yAxis =
    chartSuggestion?.yAxis && keys.includes(chartSuggestion.yAxis) ? chartSuggestion.yAxis : numericKey;
  const type = chartSuggestion?.type || 'bar';
  const chartData = rows.map((row) => ({
    ...row,
    [yAxis]: Number(row[yAxis])
  }));

  const hasChartData = rows.length > 0 && xAxis && yAxis;

  const renderChart = () => {
    if (type === 'line') {
      return (
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey={yAxis} stroke="#0f766e" strokeWidth={2} dot={false} />
        </LineChart>
      );
    }

    if (type === 'pie') {
      return (
        <PieChart>
          <Tooltip />
          <Pie data={chartData} dataKey={yAxis} nameKey={xAxis} outerRadius={110} label>
            {chartData.map((row, index) => (
              <Cell key={`${row[xAxis]}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    }

    if (type === 'scatter') {
      return (
        <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey={xAxis} name={xAxis} tick={{ fontSize: 12 }} />
          <YAxis dataKey={yAxis} name={yAxis} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={chartData} fill="#0f766e" />
        </ScatterChart>
      );
    }

    return (
      <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={yAxis} fill="#0f766e" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  };

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-ink">Suggested Chart</h2>
        {chartSuggestion?.reason && (
          <p className="mt-1 text-sm text-stone-600">{chartSuggestion.reason}</p>
        )}
      </div>
      {!hasChartData ? (
        <p className="text-sm text-stone-600">A chart will appear when numeric data is available.</p>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default ChartPanel;
