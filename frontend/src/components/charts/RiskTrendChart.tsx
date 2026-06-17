import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { RiskLevel } from '@/types/port.types'
import { RISK_LABELS_VI, getMaxRiskColor, riskLevelToNumber } from '@/hooks/useRiskColor'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

type Props = {
  data: RiskLevel[]
}

export default function RiskTrendChart({ data }: Props) {
  const labels = data.map((_, i) => `${i}h`)
  const values = data.map(riskLevelToNumber)
  const lineColor = getMaxRiskColor(data)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Mức rủi ro',
        data: values,
        borderColor: lineColor,
        backgroundColor: `${lineColor}33`,
        tension: 0.35,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const map: Record<number, RiskLevel> = {
              1: 'LOW',
              2: 'MEDIUM',
              3: 'HIGH',
              4: 'CRITICAL',
            }
            const y = ctx.parsed.y ?? 1
            const level = map[y] ?? 'LOW'
            return RISK_LABELS_VI[level]
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 8, font: { size: 10 } },
      },
      y: {
        min: 1,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: (value: string | number) => {
            const map: Record<number, string> = {
              1: 'LOW',
              2: 'MEDIUM',
              3: 'HIGH',
              4: 'CRITICAL',
            }
            return map[Number(value)] ?? ''
          },
          font: { size: 10 },
        },
      },
    },
  }

  return (
    <div className="h-40 w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}
