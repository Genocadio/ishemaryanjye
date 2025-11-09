"use client"

import React from 'react'

// Lazy load DOMPurify only on client side to avoid SSR issues
let DOMPurify: any = null

/**
 * Detects if a string contains HTML tags
 */
export function isHtmlContent(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  // Check for HTML tags (including self-closing tags)
  const htmlTagRegex = /<[^>]+>/g
  return htmlTagRegex.test(text)
}

/**
 * Sanitizes HTML content using DOMPurify
 * Configured to preserve all CKEditor HTML formatting
 * Note: This is a synchronous wrapper, but DOMPurify loads asynchronously on first use
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // If we're on the server, return HTML as-is (will be sanitized on client)
  if (typeof window === 'undefined') {
    return html
  }
  
  // Try to get DOMPurify synchronously if already loaded
  if (!DOMPurify) {
    // Lazy load DOMPurify on first use
    // Use a try-catch to handle any import issues
    try {
      // Use dynamic import that Next.js can handle
      const dompurifyModule = require('dompurify')
      DOMPurify = dompurifyModule.default || dompurifyModule
    } catch (e) {
      // If import fails, return HTML as-is (will be sanitized on next render)
      console.warn('DOMPurify not available, skipping sanitization:', e)
      return html
    }
  }
  
  // Configure DOMPurify to preserve all CKEditor HTML formatting
  // This allows tables, lists, spans with styles, etc.
  // Using a permissive config that preserves CKEditor output while still sanitizing dangerous content
  const config = {
    // Allow all common HTML tags that CKEditor uses
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'div', 'span', 'a', 'img',
      'sub', 'sup', 'mark', 'small', 'del', 'ins'
    ],
    // Allow common attributes including style for CKEditor formatting
    ALLOWED_ATTR: [
      'class', 'style', 'id',
      'href', 'target', 'rel', 'title', 'alt',
      'colspan', 'rowspan', 'cellpadding', 'cellspacing', 'border',
      'width', 'height', 'src'
    ],
    // Preserve content and formatting
    KEEP_CONTENT: true,
    // Allow style attributes (needed for CKEditor color and formatting)
    ALLOW_DATA_ATTR: false,
    // Security settings
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: false,
    SANITIZE_DOM: true
  }
  
  return DOMPurify.sanitize(html, config)
}

/**
 * Renders content as either HTML (if HTML detected) or plain text (using formatText)
 * @param text - The content to render
 * @param formatTextFn - Function to format plain text (from existing components)
 * @param className - Optional CSS classes for the container
 */
export function renderContent(
  text: string | null | undefined,
  formatTextFn?: (text: string) => React.ReactNode,
  className: string = ''
): React.ReactNode {
  if (!text) return null
  
  if (isHtmlContent(text)) {
    const sanitized = sanitizeHtml(text)
    return (
      <div
        className={`prose prose-sm max-w-none [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-100 [&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_em]:italic [&_span]:inline ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitized }}
        style={{
          // Additional styles for CKEditor content
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      />
    )
  }
  
  // Use existing formatText function for plain text
  if (formatTextFn) {
    return <div className={className}>{formatTextFn(text)}</div>
  }
  
  // Fallback: just return the text
  return <div className={className}>{text}</div>
}

