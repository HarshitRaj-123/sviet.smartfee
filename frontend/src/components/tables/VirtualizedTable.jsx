import { useVirtual } from 'react-virtual'
import { useRef, useMemo } from 'react'

export function VirtualizedTable({ 
  data = [], 
  columns = [], 
  rowHeight = 40,
  headerHeight = 45,
  height = 400,
  width = '100%',
  onRowClick,
  emptyMessage = 'No data available'
}) {
  const tableRef = useRef(null)
  
  // Memoize the data and columns to prevent unnecessary recalculations
  const tableData = useMemo(() => data, [data])
  const tableColumns = useMemo(() => columns, [columns])
  
  // Configure virtualization
  const rowVirtualizer = useVirtual({
    size: tableData.length,
    parentRef: tableRef,
    estimateSize: () => rowHeight,
    overscan: 10
  })
  
  if (!data.length) {
    return (
      <div className="empty-table-message">
        {emptyMessage}
      </div>
    )
  }
  
  return (
    <div
      ref={tableRef}
      className="virtualized-table-container"
      style={{ 
        height, 
        width, 
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div
        className="virtualized-table-header"
        style={{
          height: headerHeight,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd'
        }}
      >
        {tableColumns.map((column, idx) => (
          <div
            key={column.key || idx}
            className="virtualized-table-header-cell"
            style={{
              flex: column.width || 1,
              padding: '10px',
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {column.header}
          </div>
        ))}
      </div>
      
      <div
        className="virtualized-table-body"
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.index}
            className={`virtualized-table-row ${onRowClick ? 'clickable' : ''}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${rowHeight}px`,
              transform: `translateY(${virtualRow.start}px)`,
              display: 'flex',
              borderBottom: '1px solid #eee',
              background: virtualRow.index % 2 === 0 ? '#ffffff' : '#f9f9f9'
            }}
            onClick={() => onRowClick && onRowClick(tableData[virtualRow.index])}
          >
            {tableColumns.map((column, idx) => (
              <div
                key={column.key || idx}
                className="virtualized-table-cell"
                style={{
                  flex: column.width || 1,
                  padding: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {column.render 
                  ? column.render(tableData[virtualRow.index]) 
                  : tableData[virtualRow.index][column.key]
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}