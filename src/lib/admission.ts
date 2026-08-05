import type { AdmissionStage, AdmissionStageView, AdmissionStatus } from '@/types/content'

/**
 * Статус этапа приёмной кампании считается из дат, а не хранится в базе:
 * иначе редактору пришлось бы вручную двигать «идёт сейчас» каждую неделю.
 *
 * Границы включительные: этап 1–30 июня считается идущим и первого, и тридцатого.
 * Сравнение — по календарным дням в ташкентской зоне, время в датах игнорируется.
 */
function toDayNumber(iso: string): number {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return Number.NaN
  return Math.floor(date.getTime() / 86_400_000)
}

export function getStageStatus(stage: AdmissionStage, now: Date): AdmissionStatus {
  const today = Math.floor(now.getTime() / 86_400_000)
  const start = toDayNumber(stage.startDate)
  const end = stage.endDate ? toDayNumber(stage.endDate) : start

  if (Number.isNaN(start)) return 'future'
  if (today < start) return 'future'
  if (today > end) return 'past'
  return 'current'
}

/** Добавляет статус каждому этапу за один проход. */
export function withStatuses(
  stages: readonly AdmissionStage[],
  now: Date = new Date(),
): readonly AdmissionStageView[] {
  return stages.map((stage) => ({ ...stage, status: getStageStatus(stage, now) }))
}
