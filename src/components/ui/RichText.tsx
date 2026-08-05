import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import type { LexicalNode, RichTextValue } from '@/types/content'

/**
 * Минимальный рендерер редакторского контента (формат Lexical).
 *
 * Намеренно поддерживает только те узлы, которые редактор реально может
 * создать в текстовом поле: абзацы, заголовки h2–h4, списки, цитаты, ссылки
 * и переносы строк. Всё незнакомое пропускается — так чужая разметка из
 * буфера обмена не попадёт на страницу.
 */

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2

function renderNodes(nodes: readonly LexicalNode[] | undefined): ReactNode {
  if (!nodes) return null

  return nodes.map((node, index) => {
    const key = `${node.type ?? 'node'}-${index}`
    const children = renderNodes(node.children)

    switch (node.type) {
      case 'text': {
        const format = typeof node.format === 'number' ? node.format : 0
        let content: ReactNode = node.text ?? ''
        if (format & FORMAT_BOLD) content = <strong key={key}>{content}</strong>
        if (format & FORMAT_ITALIC) content = <em key={key}>{content}</em>
        return <span key={key}>{content}</span>
      }

      case 'linebreak':
        return <br key={key} />

      case 'heading': {
        const Tag = (node.tag === 'h2' || node.tag === 'h3' || node.tag === 'h4'
          ? node.tag
          : 'h3') as 'h2' | 'h3' | 'h4'
        const size = Tag === 'h2' ? 'text-h3' : Tag === 'h3' ? 'text-h4' : 'text-lg'
        return (
          <Tag key={key} className={`mt-10 ${size} text-ink-brand`}>
            {children}
          </Tag>
        )
      }

      case 'list': {
        const ListTag = node.listType === 'number' ? 'ol' : 'ul'
        return (
          <ListTag
            key={key}
            className={`mt-4 space-y-2 pl-6 ${
              ListTag === 'ol' ? 'list-decimal' : 'list-disc'
            }`}
          >
            {children}
          </ListTag>
        )
      }

      case 'listitem':
        return (
          <li key={key} className="text-base text-ink">
            {children}
          </li>
        )

      case 'quote':
        return (
          <blockquote
            key={key}
            className="mt-6 border-l-4 border-accent pl-4 text-lg text-ink-muted"
          >
            {children}
          </blockquote>
        )

      case 'link': {
        const url = node.fields?.url ?? ''
        const external = /^https?:\/\//i.test(url)
        return external ? (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-accent underline underline-offset-4"
          >
            {children}
          </a>
        ) : (
          <Link key={key} href={url} className="text-ink-accent underline underline-offset-4">
            {children}
          </Link>
        )
      }

      case 'paragraph':
        return (
          <p key={key} className="mt-4 text-base text-ink">
            {children}
          </p>
        )

      default:
        // Неизвестный узел выводим прозрачно, сохраняя вложенный текст
        return children ? <span key={key}>{children}</span> : null
    }
  })
}

export function RichText({ value }: { readonly value: RichTextValue | null | undefined }) {
  if (!value?.root?.children) return null
  return <div className="max-w-prose">{renderNodes(value.root.children)}</div>
}
