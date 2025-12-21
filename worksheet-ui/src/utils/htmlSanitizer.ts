/**
 * HTML Sanitizer Utility
 *
 * Cleans HTML content to allow only safe formatting tags for rich text editing.
 * Prevents XSS attacks and malformed HTML from breaking the document.
 *
 * Allowed tags: <b>, <i>, <u>, <ul>, <ol>, <li>, <br>
 * Strips: Everything else (divs, spans, styles, classes, scripts, etc.)
 */

const ALLOWED_TAGS = ['B', 'I', 'U', 'UL', 'OL', 'LI', 'BR'];

/**
 * Sanitizes HTML content by removing all disallowed tags and attributes
 *
 * @param html - Raw HTML string to sanitize
 * @returns Cleaned HTML string with only allowed tags
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary container to parse HTML
  const source = document.createElement('div');
  source.innerHTML = html;

  // Create output container
  const output = document.createElement('div');

  // Recursively clean the DOM tree
  Array.from(source.childNodes).forEach((child) => {
    cleanNode(child, output);
  });

  return output.innerHTML;
}

/**
 * Recursively cleans a DOM node and its children
 *
 * @param node - DOM node to clean
 * @param container - Parent container to append cleaned nodes
 */
function cleanNode(node: Node, container: Element): void {
  // Text nodes are always safe
  if (node.nodeType === Node.TEXT_NODE) {
    container.appendChild(node.cloneNode(false));
    return;
  }

  // Only process element nodes
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const element = node as Element;

  // Check if tag is allowed
  if (!ALLOWED_TAGS.includes(element.tagName)) {
    // Replace disallowed tags with their text content
    // This preserves text while removing unwanted structure
    const textContent = element.textContent || '';
    if (textContent) {
      container.appendChild(document.createTextNode(textContent));
    }
    return;
  }

  // Create a clean copy of the allowed element
  const cleanElement = document.createElement(element.tagName);

  // Recursively clean and append children
  Array.from(element.childNodes).forEach((child) => {
    cleanNode(child, cleanElement);
  });

  container.appendChild(cleanElement);
}

/**
 * Sanitizes HTML from clipboard paste events
 *
 * @param e - ClipboardEvent from paste handler
 * @returns Sanitized HTML string
 */
export function sanitizePaste(e: ClipboardEvent): string {
  e.preventDefault();

  // Try to get HTML from clipboard first, fall back to plain text
  const html =
    e.clipboardData?.getData('text/html') ||
    e.clipboardData?.getData('text/plain') ||
    '';

  // If it's plain text, preserve line breaks as <br> tags
  if (!html.includes('<')) {
    const text = e.clipboardData?.getData('text/plain') || '';
    return text.replace(/\n/g, '<br>');
  }

  return sanitizeHTML(html);
}

/**
 * Strips all HTML tags, leaving only text content
 *
 * @param html - HTML string to strip
 * @returns Plain text without any HTML tags
 */
export function stripAllTags(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

/**
 * Checks if HTML contains only allowed tags
 *
 * @param html - HTML string to validate
 * @returns True if all tags are allowed, false otherwise
 */
export function isValidHTML(html: string): boolean {
  const div = document.createElement('div');
  div.innerHTML = html;

  const hasInvalidTags = (node: Node): boolean => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (!ALLOWED_TAGS.includes(element.tagName)) {
        return true;
      }

      // Check children
      for (let i = 0; i < element.childNodes.length; i++) {
        if (hasInvalidTags(element.childNodes[i])) {
          return true;
        }
      }
    }
    return false;
  };

  return !hasInvalidTags(div);
}
