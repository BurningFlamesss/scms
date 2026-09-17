import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Segmented } from '../Segmented';
import { Eyebrow, WidgetCaption } from '../Text';
import { color, font } from '../tokens';
import { nebResults, seeResults } from '#/content/extras';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/**
 * B6.2 - Board results. A chart for the shape of it, and a real data table
 * beneath as the accessible equivalent rather than an afterthought.
 */
export function ResultsChart({ dbResults }: { dbResults?: any[] }) {
  const [board, setBoard] = useState<'see' | 'neb'>('see');
  
  const activeFallback = board === 'see' ? seeResults : nebResults;
  
  // Use DB data if provided, fallback to static imports
  const rows = useMemo(() => {
    let source = activeFallback;
    if (dbResults && dbResults.length > 0) {
      source = dbResults.filter(r => r.board.toLowerCase() === board);
    }
    return [...source].sort((a,b) => Number(b.year) - Number(a.year));
  }, [dbResults, board, activeFallback]);

  const data = useMemo(
    () => ({
      labels: rows.map((r) => r.year),
      datasets: [
        {
          label: 'Second division',
          data: rows.map((r) => r.secondDivision),
          backgroundColor: color.gray300,
          borderWidth: 0,
        },
        {
          label: 'First division',
          data: rows.map((r) => r.firstDivision),
          backgroundColor: color.yellow,
          borderWidth: 0,
        },
        {
          label: 'Distinction',
          data: rows.map((r) => r.distinction),
          backgroundColor: color.red,
          borderWidth: 0,
        }
      ],
    }),
    [rows],
  );

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: color.gray600, font: { family: font.label, size: 11 } },
        border: { color: color.gray300 },
      },
      y: {
        stacked: true,
        grid: { color: color.gray100 },
        ticks: { color: color.gray600, font: { family: font.label, size: 11 } },
        border: { display: false },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        reverse: true,
        labels: {
          color: color.gray600,
          font: { family: font.label, size: 11 },
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        backgroundColor: color.black,
        titleFont: { family: font.label, size: 11 },
        bodyFont: { family: font.body, size: 13 },
        padding: 12,
        cornerRadius: 12,
      },
    },
  };

  return (
    <div className='flex flex-col gap-8' data-testid='results-chart'>
      <div className='flex flex-col gap-2'>
        <Eyebrow>Board results</Eyebrow>
        <WidgetCaption>Division splits over the last five sessions.</WidgetCaption>
      </div>

      <Segmented
        label='Board'
        value={board}
        onChange={setBoard}
        testId='results-board'
        options={[
          { value: 'see', label: 'SEE · Grade 10' },
          { value: 'neb', label: 'NEB · Grade 12' },
        ]}
      />

      <div className='h-[320px] w-full' aria-hidden='true'>
        <Bar data={data} options={options} />
      </div>

      <div
        className='overflow-x-auto u-edge-fade'
        tabIndex={0}
        role='region'
        aria-label='Board results by year, scrolls horizontally'
        data-testid='results-table-scroll'
      >
        <table className='w-full min-w-[640px] border-collapse text-left'>
          <caption className='u-label pb-4 text-left text-n-600'>
            {board === 'see' ? 'Secondary Education Examination' : 'National Examinations Board, grade 12'}{' '}
            · appeared, passed and division split by session
          </caption>
          <thead>
            <tr>
              {['Session', 'Appeared', 'Passed', 'Pass rate', 'Distinction', 'First', 'Second'].map((h) => (
                <th key={h} scope='col' className='u-label border-b-hair border-n-300 py-3 pr-6 text-n-600'>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} data-testid={'results-row-' + r.yearBs}>
                <th scope='row' className='u-label border-b-hair border-n-200 py-3 pr-6 text-ink'>
                  {r.year}
                </th>
                <td className='tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink'>{r.appeared}</td>
                <td className='tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink'>{r.passed}</td>
                <td className='tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink'>
                  {Math.round((r.passed / r.appeared) * 1000) / 10}%
                </td>
                <td className='tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink'>{r.distinction}</td>
                <td className='tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink'>{r.firstDivision}</td>
                <td className='tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink'>{r.secondDivision}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
