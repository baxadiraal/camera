import type { Access, AccessArgs } from 'payload'

/** Публичное чтение — только опубликованные документы; редакторы видят всё. */
export const publishedOrEditor: Access = ({ req }: AccessArgs) => {
  if (req.user) return true
  return {
    status: { equals: 'published' },
  }
}

/** Полностью публичное чтение (справочники: партнёры, услуги, меню). */
export const anyone: Access = () => true

/** Изменять контент может только авторизованный сотрудник. */
export const editorsOnly: Access = ({ req }: AccessArgs) => Boolean(req.user)

/** Управлять пользователями может только администратор. */
export const adminsOnly: Access = ({ req }: AccessArgs) =>
  (req.user as { role?: string } | null)?.role === 'admin'
