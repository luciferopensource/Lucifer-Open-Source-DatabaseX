import type { AnchorHTMLAttributes, ReactNode } from 'react'

type PageLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> & {
  href: string
  children: ReactNode
}

/**
 * Every navigation link between pages opens in a new tab, as required for this
 * portal. In-page controls (tabs, filters, pagination) stay in the same tab and
 * are plain buttons. `noopener` is mandatory with `target="_blank"`.
 */
export function PageLink({ href, children, ...rest }: PageLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}
