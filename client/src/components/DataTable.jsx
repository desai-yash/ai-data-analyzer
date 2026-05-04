function DataTable({ dataset }) {
  const columns = dataset?.columns || [];
  const columnNames = columns.map((column) => column.name || column);
  const rows = dataset?.preview || [];

  if (!dataset) {
    return (
      <section className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600">
        No dataset selected.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-stone-200 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">{dataset.fileName}</h2>
          <p className="text-sm text-stone-600">
            {dataset.rowCount} rows, {columnNames.length} columns
          </p>
        </div>
      </div>
      <div className="max-h-[460px] overflow-auto">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="sticky top-0 bg-stone-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.name || column}
                  className="whitespace-nowrap px-4 py-3 font-semibold text-stone-700"
                >
                  <span>{column.name || column}</span>
                  {column.type && (
                    <span className="ml-2 text-xs font-normal text-stone-500">{column.type}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 bg-white">
            {rows.map((row, index) => (
              <tr key={`${index}-${JSON.stringify(row).slice(0, 20)}`}>
                {columnNames.map((column) => (
                  <td key={column} className="max-w-64 truncate px-4 py-3 text-stone-700">
                    {String(row[column] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DataTable;
