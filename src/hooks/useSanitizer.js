import { useMemo } from "react";
import {
  sanitizeHTML,
  sanitizeText,
  sanitizeRichText,
} from "../utils/sanitizer";

/**
 * React hook for sanitizing HTML content
 * @param {string} html - The HTML content to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized HTML content
 */
export const useSanitizedHTML = (html, options = {}) => {
  return useMemo(() => {
    return sanitizeHTML(html, options);
  }, [html, options]);
};

/**
 * React hook for sanitizing text content
 * @param {string} text - The text content to sanitize
 * @returns {string} - Sanitized text content
 */
export const useSanitizedText = (text) => {
  return useMemo(() => {
    return sanitizeText(text);
  }, [text]);
};

/**
 * React hook for sanitizing rich text content
 * @param {string} richText - The rich text content to sanitize
 * @returns {string} - Sanitized rich text content
 */
export const useSanitizedRichText = (richText) => {
  return useMemo(() => {
    return sanitizeRichText(richText);
  }, [richText]);
};

/**
 * React hook for creating safe dangerouslySetInnerHTML props
 * @param {string} html - The HTML content to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} - Props object with dangerouslySetInnerHTML
 */
export const useSafeHTML = (html, options = {}) => {
  return useMemo(() => {
    const sanitized = sanitizeHTML(html, options);
    return {
      dangerouslySetInnerHTML: { __html: sanitized },
    };
  }, [html, options]);
};
