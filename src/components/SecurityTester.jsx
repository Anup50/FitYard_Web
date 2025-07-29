import { useState } from "react";
import {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeFormData,
} from "../utils/sanitizer";
import { useSanitizedHTML, useSanitizedText } from "../hooks/useSanitizer";
import SafeHTML from "../components/SafeHTML";

const SecurityTester = () => {
  const [testResults, setTestResults] = useState([]);

  // XSS Attack Vectors for Testing
  const xssPayloads = {
    basic: '<script>alert("XSS Attack!")</script>',
    image: '<img src="x" onerror="alert(\'XSS via image\')" />',
    iframe: "<iframe src=\"javascript:alert('XSS via iframe')\"></iframe>",
    event: "<div onmouseover=\"alert('XSS via event')\">Hover me</div>",
    javascript: 'javascript:alert("XSS via javascript protocol")',
    data: 'data:text/html,<script>alert("XSS via data URL")</script>',
    svg: "<svg onload=\"alert('XSS via SVG')\"></svg>",
    style:
      "<style>body{background:url(\"javascript:alert('CSS XSS')\")}</style>",
    object: "<object data=\"javascript:alert('XSS via object')\"></object>",
    form: '<form><input type="text" value="<script>alert(\'Form XSS\')</script>"></form>',
  };

  // Mock Product Data with XSS Payloads
  const mockProductData = {
    name: 'Premium T-Shirt<script>alert("Product XSS")</script>',
    description: `
      <h2>Product Description</h2>
      <p>This is a <strong>premium</strong> t-shirt with <em>excellent</em> quality.</p>
      <script>alert("Description XSS")</script>
      <img src="x" onerror="alert('Image XSS in description')" />
      <a href="javascript:alert('Link XSS')">Click here</a>
      <div onmouseover="alert('Event XSS')">Hover for attack</div>
    `,
    price: '29.99<script>alert("Price XSS")</script>',
    category: 'Men<img src=x onerror=alert("Category XSS")>',
    image: 'javascript:alert("Image URL XSS")',
    sizes: ['S<script>alert("Size XSS")</script>', "M", "L", "XL"],
    reviews: [
      {
        user: 'John<script>alert("User XSS")</script>',
        comment: 'Great product! <script>alert("Review XSS")</script>',
        rating: '5<img src=x onerror=alert("Rating XSS")>',
      },
    ],
  };

  // Mock Form Data with XSS Payloads
  const mockFormData = {
    firstName: 'John<script>alert("First Name XSS")</script>',
    lastName: 'Doe<img src=x onerror=alert("Last Name XSS")>',
    email: 'john@example.com<script>alert("Email XSS")</script>',
    phone: "+1234567890<iframe src=\"javascript:alert('Phone XSS')\"></iframe>",
    address: "123 Main St<svg onload=\"alert('Address XSS')\"></svg>",
    city: "New York<object data=\"javascript:alert('City XSS')\"></object>",
    zipCode:
      "10001<style>body{background:url(\"javascript:alert('ZIP XSS')\")}</style>",
    message: `
      Hello! This is a test message.
      <script>alert("Message XSS")</script>
      <img src="x" onerror="alert('Image in message')" />
      <a href="javascript:alert('Link in message')">Malicious link</a>
    `,
  };

  // Test Individual Sanitization Functions
  const runSanitizationTests = () => {
    const results = [];

    // Test HTML Sanitization
    Object.entries(xssPayloads).forEach(([key, payload]) => {
      const sanitized = sanitizeHTML(payload);
      results.push({
        test: `HTML Sanitization - ${key}`,
        original: payload,
        sanitized: sanitized,
        safe:
          !sanitized.includes("<script>") && !sanitized.includes("javascript:"),
        type: "html",
      });
    });

    // Test Text Sanitization
    results.push({
      test: "Text Sanitization",
      original: 'Hello <script>alert("XSS")</script> World!',
      sanitized: sanitizeText('Hello <script>alert("XSS")</script> World!'),
      safe: true,
      type: "text",
    });

    // Test URL Sanitization
    const maliciousUrls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'vbscript:msgbox("XSS")',
      "https://example.com/image.jpg", // This should be safe
      "/assets/image.png", // This should be safe
    ];

    maliciousUrls.forEach((url) => {
      const sanitized = sanitizeURL(url);
      results.push({
        test: "URL Sanitization",
        original: url,
        sanitized: sanitized,
        safe:
          !sanitized.includes("javascript:") &&
          !sanitized.includes("data:text/html"),
        type: "url",
      });
    });

    // Test Form Data Sanitization
    const sanitizedForm = sanitizeFormData(mockFormData);
    results.push({
      test: "Form Data Sanitization",
      original: JSON.stringify(mockFormData, null, 2),
      sanitized: JSON.stringify(sanitizedForm, null, 2),
      safe: !JSON.stringify(sanitizedForm).includes("<script>"),
      type: "form",
    });

    setTestResults(results);
  };

  // Test React Hooks
  const TestHooksComponent = () => {
    const safeHTML = useSanitizedHTML(mockProductData.description);
    const safeText = useSanitizedText(mockProductData.name);

    return (
      <div className="mt-6 p-4 border rounded">
        <h3 className="font-bold mb-2">React Hooks Test</h3>
        <div className="mb-2">
          <strong>Safe Text (useSanitizedText):</strong>
          <div className="bg-gray-100 p-2 rounded">{safeText}</div>
        </div>
        <div>
          <strong>Safe HTML (useSanitizedHTML):</strong>
          <div
            className="bg-gray-100 p-2 rounded"
            dangerouslySetInnerHTML={{ __html: safeHTML }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🛡️ DOMPurify Security Testing</h1>

      <div className="mb-6">
        <button
          onClick={runSanitizationTests}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Run Security Tests
        </button>
      </div>

      {/* Mock Product Display Test */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">
          🛍️ Product Display Security Test
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">❌ Unsafe (Raw Data):</h3>
            <div className="bg-red-50 p-3 rounded border-red-200 border">
              <div className="text-sm text-gray-600 mb-1">Name:</div>
              <div className="mb-2">{mockProductData.name}</div>
              <div className="text-sm text-gray-600 mb-1">Description:</div>
              <div
                dangerouslySetInnerHTML={{
                  __html: mockProductData.description,
                }}
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">✅ Safe (Sanitized):</h3>
            <div className="bg-green-50 p-3 rounded border-green-200 border">
              <div className="text-sm text-gray-600 mb-1">Name:</div>
              <div className="mb-2">{sanitizeText(mockProductData.name)}</div>
              <div className="text-sm text-gray-600 mb-1">Description:</div>
              <SafeHTML
                html={mockProductData.description}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">🔬 Test Results</h2>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded ${
                  result.safe
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{result.test}</h3>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      result.safe
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result.safe ? "✅ SAFE" : "❌ UNSAFE"}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Original:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                      {result.original}
                    </pre>
                  </div>
                  <div>
                    <strong>Sanitized:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                      {result.sanitized}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* React Hooks Test */}
      <TestHooksComponent />

      {/* Performance Test */}
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">⚡ Performance Test</h2>
        <button
          onClick={() => {
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
              sanitizeHTML(mockProductData.description);
            }
            const end = performance.now();
            alert(`1000 sanitizations took ${(end - start).toFixed(2)}ms`);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Test 1000 Sanitizations
        </button>
      </div>

      {/* Manual Testing Instructions */}
      <div className="mt-8 p-4 border rounded bg-blue-50">
        <h2 className="text-xl font-bold mb-4">
          📋 Manual Testing Instructions
        </h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>1. Test Product Search:</strong> Try searching for:{" "}
            <code>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</code>
          </p>
          <p>
            <strong>2. Test Newsletter:</strong> Enter email:{" "}
            <code>
              test@example.com&lt;img src=x onerror=alert(&quot;XSS&quot;)&gt;
            </code>
          </p>
          <p>
            <strong>3. Test Login:</strong> Try username:{" "}
            <code>
              admin&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
            </code>
          </p>
          <p>
            <strong>4. Check Console:</strong> Look for any XSS alerts or
            security warnings
          </p>
          <p>
            <strong>5. Admin Panel:</strong> Try adding products with malicious
            names and descriptions
          </p>
          <p>
            <strong>6. Test Password Forms:</strong> Try XSS in forgot password
            and reset password forms
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityTester;
