export default function Table({ headers, rows }) {
  return (
    <table className="block max-w-sm overflow-x-scroll md:table md:min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              {header}
            </th>
          ))}
          <th className="px-6 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
