const GenericTable = ({ columns, data, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="thead-dark">
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{row[col.field]}</td>
              ))}
              <td>
                <button
                  className="btn btn-warning btn-sm mr-2"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;
