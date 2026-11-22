import Prism from 'prismjs';

// Import common language grammars for Prism
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';

const LANGUAGE_ALIASES = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  yml: 'yaml',
};

/**
 * Highlights a block of code using Prism, with fallback to escaped HTML.
 */
export function highlightCode(code, language = '') {
  if (!code) return '';

  const cleanLang = (language || '').toLowerCase().trim();
  const targetLang = LANGUAGE_ALIASES[cleanLang] || cleanLang;

  if (targetLang && Prism.languages[targetLang]) {
    try {
      return Prism.highlight(code, Prism.languages[targetLang], targetLang);
    } catch (e) {
      console.warn('Prism highlighting failed for language:', targetLang, e);
    }
  }

  // Fallback safe escape
  return escapeHtml(code);
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
