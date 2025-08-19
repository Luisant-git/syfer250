import "./Table.scss"

const Table = ({ children, className = "", striped = false, hover = false, ...props }) => {
  const tableClass = `
    table 
    ${striped ? "table--striped" : ""} 
    ${hover ? "table--hover" : ""} 
    ${className}
  `.trim()

  return (
    <div className="table-container">
      <table className={tableClass} {...props}>
        {children}
      </table>
    </div>
  )
}

const TableHead = ({ children, className = "", ...props }) => (
  <thead className={`table__head ${className}`} {...props}>
    {children}
  </thead>
)

const TableBody = ({ children, className = "", ...props }) => (
  <tbody className={`table__body ${className}`} {...props}>
    {children}
  </tbody>
)

const TableRow = ({ children, className = "", ...props }) => (
  <tr className={`table__row ${className}`} {...props}>
    {children}
  </tr>
)

const TableHeader = ({ children, className = "", ...props }) => (
  <th className={`table__header ${className}`} {...props}>
    {children}
  </th>
)

const TableCell = ({ children, className = "", ...props }) => (
  <td className={`table__cell ${className}`} {...props}>
    {children}
  </td>
)

Table.Head = TableHead
Table.Body = TableBody
Table.Row = TableRow
Table.Header = TableHeader
Table.Cell = TableCell

export default Table
