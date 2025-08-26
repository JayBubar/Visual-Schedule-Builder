import React, { useState, useMemo } from 'react';
import UnifiedDataService from '../../services/unifiedDataService';
import { StandardLogEntry } from '../../types';
import { styles } from './StandardsReport.styles';

interface ReportRow {
  standard: string;
  source: string;
  count: number;
  lastCovered: string;
}

const StandardsReport: React.FC = () => {
  const [filter, setFilter] = useState('month'); // 'week' or 'month'
  const dailyLogs = useMemo(() => UnifiedDataService.getDailyLogs(), []);

  const reportData = useMemo(() => {
    const today = new Date();
    const processedData: { [key: string]: ReportRow } = {};

    for (const dateKey in dailyLogs) {
      const logDate = new Date(dateKey);
      
      let include = false;
      if (filter === 'month') {
        if (logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear()) {
          include = true;
        }
      } else if (filter === 'week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        if (logDate >= weekStart) {
          include = true;
        }
      }
      
      if (include) {
        const log = dailyLogs[dateKey];
        log.standardsCovered.forEach((entry: StandardLogEntry) => {
            const rowKey = `${entry.standard}-${entry.source}`;
            if (!processedData[rowKey]) {
                processedData[rowKey] = { ...entry, count: 0, lastCovered: '1970-01-01' };
            }
            processedData[rowKey].count += 1;
            if (dateKey > processedData[rowKey].lastCovered) {
                processedData[rowKey].lastCovered = dateKey;
            }
        });
      }
    }
    return Object.values(processedData).sort((a, b) => a.standard.localeCompare(b.standard));
  }, [dailyLogs, filter]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>Standards Coverage</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
        </select>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Standard Code</th>
            <th style={styles.th}>Lesson/Step</th>
            <th style={styles.th}>Times Covered</th>
            <th style={styles.th}>Last Covered</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map(row => (
            <tr key={`${row.standard}-${row.source}`}>
                <td style={styles.td}>{row.standard}</td>
                <td style={styles.td}>{row.source}</td>
                <td style={styles.td}>{row.count}</td>
                <td style={styles.td}>{new Date(row.lastCovered).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandardsReport;