import React, { useState, useMemo } from 'react';
import type { SymptomEntry, AdherenceEntry } from '../types';

interface ChartDataPoint {
  date: Date;
  value: number;
}

interface HistoryChartProps {
  entries: (SymptomEntry | AdherenceEntry)[];
  title: string;
  color: string;
  fixedYScale?: { min: number; max: number };
}

const HistoryChart: React.FC<HistoryChartProps> = ({ entries, title, color, fixedYScale }) => {
  const [activePoint, setActivePoint] = useState<ChartDataPoint | null>(null);

  const chartData: ChartDataPoint[] = useMemo(() => entries
    .map(entry => ({
      date: new Date(entry.date + 'T00:00:00'), // Ensure date is parsed consistently
      value: 'severity' in entry ? entry.severity : entry.rating,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-14), [entries]); // Show last 14 entries

  if (chartData.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm text-gray-500 dark:text-gray-400">
        Pas assez de données pour afficher un graphique.
      </div>
    );
  }

  const width = 300;
  const height = 150;
  const padding = 25;

  const minX = chartData[0].date.getTime();
  const maxX = chartData[chartData.length - 1].date.getTime();
  
  const { minY, maxY, yTicks } = useMemo(() => {
    if (fixedYScale) {
        const ticks = [];
        for (let i = fixedYScale.min; i <= fixedYScale.max; i++) {
            ticks.push(i);
        }
        return { minY: fixedYScale.min, maxY: fixedYScale.max, yTicks: ticks };
    }
    const values = chartData.map(p => p.value);
    const dataMinY = Math.min(...values);
    const dataMaxY = Math.max(...values);

    const yPadding = (dataMaxY - dataMinY) * 0.15 || 1;
    let newMinY = Math.max(0, dataMinY - yPadding);
    let newMaxY = dataMaxY + yPadding;
    
    if (newMinY === newMaxY) {
      newMinY = Math.max(0, newMinY - 1);
      newMaxY += 1;
    }

    const yTicksCount = 5;
    const ticks = Array.from({ length: yTicksCount }, (_, i) => {
        const value = newMinY + (i / (yTicksCount - 1)) * (newMaxY - newMinY);
        if (newMaxY - newMinY < 10) return parseFloat(value.toPrecision(2));
        return Math.round(value);
    });
    return { minY: newMinY, maxY: newMaxY, yTicks: ticks };
  }, [chartData, fixedYScale]);


  const getX = (date: Date) => {
    if (maxX - minX === 0) return padding;
    return ((date.getTime() - minX) / (maxX - minX)) * (width - padding * 2) + padding;
  };
  
  const getY = (value: number) => {
    if (maxY - minY === 0) return height / 2;
    return height - (((value - minY) / (maxY - minY)) * (height - padding * 2) + padding);
  };

  const pathData = chartData
    .map(point => `${getX(point.date)},${getY(point.value)}`)
    .join(' ');
  
  const areaPathData = `${getX(chartData[0].date)},${height - padding} ${pathData} ${getX(chartData[chartData.length - 1].date)},${height - padding}`;
  
  const formatDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;
  const formatDateFull = (date: Date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const uniqueId = `gradient-${color.replace('#', '')}`;

  return (
    <div className="mb-6 relative">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
          <title id="chart-title">{title}</title>
          <defs>
            <linearGradient id={uniqueId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Y Axis Labels and Grid Lines */}
          {yTicks.map(val => (
            <g key={`y-axis-${val}`}>
                <text x={padding - 10} y={getY(val) + 3} fontSize="8" fill="currentColor" className="text-gray-500 dark:text-gray-400 text-right" textAnchor="end">{val}</text>
                <line x1={padding} x2={width - padding} y1={getY(val)} y2={getY(val)} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" className="text-gray-200 dark:text-gray-600"/>
            </g>
          ))}
          
          {/* X Axis Labels */}
          {chartData.map((point, index) => {
            if (chartData.length <= 7 || index === 0 || index % Math.floor(chartData.length / 5) === 0 || index === chartData.length -1) {
              return (
                <text key={`x-axis-${index}`} x={getX(point.date)} y={height - 5} textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-500 dark:text-gray-400">
                  {formatDate(point.date)}
                </text>
              )
            }
            return null;
          })}
          
          <polygon
            fill={`url(#${uniqueId})`}
            points={areaPathData}
          />

          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={pathData}
          />
          
          {chartData.map((point, index) => (
            <g key={`point-group-${index}`} className="cursor-pointer">
                <circle
                    key={`point-interactive-${index}`}
                    cx={getX(point.date)}
                    cy={getY(point.value)}
                    r="8"
                    fill="transparent"
                    onMouseEnter={() => setActivePoint(point)}
                    onMouseLeave={() => setActivePoint(null)}
                    aria-label={`Date: ${formatDateFull(point.date)}, Valeur: ${point.value}`}
                />
                <circle
                    key={`point-${index}`}
                    cx={getX(point.date)}
                    cy={getY(point.value)}
                    r={activePoint?.date.getTime() === point.date.getTime() ? 5 : 3}
                    fill={color}
                    stroke="currentColor"
                    strokeWidth={activePoint?.date.getTime() === point.date.getTime() ? 2 : 0}
                    className="transition-all duration-150 text-white dark:text-gray-800"
                    style={{ pointerEvents: 'none' }}
                />
            </g>
          ))}

          {activePoint && (
            <g transform={`translate(${getX(activePoint.date)}, ${getY(activePoint.value)})`} style={{ pointerEvents: 'none' }}>
                <filter id="tooltip-shadow" x="-0.5" y="-0.5" width="2" height="2">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
                </filter>
                <g style={{filter: 'url(#tooltip-shadow)'}}>
                    <rect x="-30" y="-45" width="60" height="32" rx="5" fill="currentColor" className="text-gray-800 dark:text-black" />
                    <text x="0" y="-32" textAnchor="middle" fill="white" fontSize="9">
                        {`${formatDateFull(activePoint.date)}`}
                    </text>
                    <text x="0" y="-19" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                        {`${activePoint.value}`}
                    </text>
                </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default HistoryChart;
