import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function Table<T extends { _id: string }>({ data, columns, onEdit, onDelete }: TableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th
                style={{
                  padding: '12px 24px',
                  textAlign: 'right',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Thao tác
              </th>
            )}
          </tr>
        </thead>
        <tbody style={{ background: 'white' }}>
          {data.map((item) => (
            <tr
              key={item._id}
              style={{ borderBottom: '1px solid #e5e7eb' }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td
                  style={{
                    padding: '16px 24px',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          color: '#2563eb',
                          background: 'transparent',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = '#1d4ed8';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = '#2563eb';
                        }}
                      >
                        Sửa
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        style={{
                          color: '#dc2626',
                          background: 'transparent',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = '#b91c1c';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = '#dc2626';
                        }}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
          Không có dữ liệu
        </div>
      )}
    </div>
  );
}
