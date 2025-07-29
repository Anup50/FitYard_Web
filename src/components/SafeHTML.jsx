import React from "react";
import { useSafeHTML } from "../hooks/useSanitizer";

/**
 * A safe HTML component that sanitizes content before rendering
 * @param {Object} props - Component props
 * @param {string} props.html - The HTML content to render
 * @param {string} props.as - The HTML element to render as (default: 'div')
 * @param {Object} props.sanitizeOptions - Options for DOMPurify
 * @param {string} props.className - CSS classes to apply
 * @param {Object} props.style - Inline styles to apply
 * @param {Object} props.otherProps - Other props to pass to the element
 * @returns {JSX.Element} - Sanitized HTML component
 */
const SafeHTML = ({
  html,
  as: Component = "div",
  sanitizeOptions = {},
  className = "",
  style = {},
  ...otherProps
}) => {
  const safeHTMLProps = useSafeHTML(html, sanitizeOptions);

  return (
    <Component
      className={className}
      style={style}
      {...safeHTMLProps}
      {...otherProps}
    />
  );
};

export default SafeHTML;
