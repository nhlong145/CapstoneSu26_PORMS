import type { OperationMode, RiskLevel } from '@/types/port.types'

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#27AE60',
  MEDIUM: '#F39C12',
  HIGH: '#E67E22',
  CRITICAL: '#C0392B',
}

export const RISK_LABELS_VI: Record<RiskLevel, string> = {
  LOW: 'THẤP',
  MEDIUM: 'TRUNG BÌNH',
  HIGH: 'CAO',
  CRITICAL: 'NGUY CẤP',
}

export const MODE_COLORS: Record<OperationMode, string> = {
  NORMAL: '#27AE60',
  LIMITED: '#F39C12',
  STOP: '#C0392B',
}

export const MODE_LABELS_VI: Record<OperationMode, string> = {
  NORMAL: 'BÌNH THƯỜNG',
  LIMITED: 'HẠN CHẾ',
  STOP: 'DỪNG',
}

export function riskLevelToNumber(level: RiskLevel): number {
  switch (level) {
    case 'LOW':
      return 1
    case 'MEDIUM':
      return 2
    case 'HIGH':
      return 3
    case 'CRITICAL':
      return 4
  }
}

export function useRiskColor(level: RiskLevel) {
  const color = RISK_COLORS[level]
  return {
    color,
    label: RISK_LABELS_VI[level],
    bgClass: `bg-[${color}]/10`,
    borderClass: `border-[${color}]/30`,
    textStyle: { color },
    bgStyle: { backgroundColor: `${color}1a`, borderColor: `${color}4d` },
  }
}

export function getMaxRiskColor(levels: RiskLevel[]): string {
  const max = Math.max(...levels.map(riskLevelToNumber))
  const map: Record<number, RiskLevel> = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH', 4: 'CRITICAL' }
  return RISK_COLORS[map[max] ?? 'LOW']
}
