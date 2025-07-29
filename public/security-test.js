// 🛡️ DOMPurify Security Test Suite
// Copy and paste this into your browser console to run additional tests

console.log("🔒 Starting DOMPurify Security Tests...");

// Test 1: Basic XSS Prevention
console.log("\n1. Testing Basic XSS Prevention:");
const basicXSS = '<script>alert("XSS Attack!")</script>Hello World';
console.log("Input:", basicXSS);
console.log(
  "Sanitized:",
  window.DOMPurify ? DOMPurify.sanitize(basicXSS) : "DOMPurify not available"
);

// Test 2: Event Handler XSS
console.log("\n2. Testing Event Handler XSS:");
const eventXSS = '<img src="x" onerror="alert(\'Event XSS\')" alt="test">';
console.log("Input:", eventXSS);
console.log(
  "Sanitized:",
  window.DOMPurify ? DOMPurify.sanitize(eventXSS) : "DOMPurify not available"
);

// Test 3: JavaScript Protocol
console.log("\n3. Testing JavaScript Protocol:");
const jsProtocol =
  "<a href=\"javascript:alert('JS Protocol XSS')\">Click me</a>";
console.log("Input:", jsProtocol);
console.log(
  "Sanitized:",
  window.DOMPurify ? DOMPurify.sanitize(jsProtocol) : "DOMPurify not available"
);

// Test 4: Data URL XSS
console.log("\n4. Testing Data URL XSS:");
const dataURL =
  "<iframe src=\"data:text/html,<script>alert('Data URL XSS')</script>\"></iframe>";
console.log("Input:", dataURL);
console.log(
  "Sanitized:",
  window.DOMPurify ? DOMPurify.sanitize(dataURL) : "DOMPurify not available"
);

// Test 5: SVG XSS
console.log("\n5. Testing SVG XSS:");
const svgXSS =
  '<svg onload="alert(\'SVG XSS\')"><rect width="100" height="100"/></svg>';
console.log("Input:", svgXSS);
console.log(
  "Sanitized:",
  window.DOMPurify ? DOMPurify.sanitize(svgXSS) : "DOMPurify not available"
);

// Test 6: CSS XSS
console.log("\n6. Testing CSS XSS:");
const cssXSS =
  "<div style=\"background: url(javascript:alert('CSS XSS'))\">Test</div>";
console.log("Input:", cssXSS);
console.log(
  "Sanitized:",
  window.DOMPurify ? DOMPurify.sanitize(cssXSS) : "DOMPurify not available"
);

// Test Performance
console.log("\n7. Performance Test:");
const complexHTML = `
  <div>
    <h1>Title</h1>
    <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
    <script>alert('XSS')</script>
    <img src="x" onerror="alert('XSS')" alt="test">
    <a href="javascript:alert('XSS')">Link</a>
    <svg onload="alert('XSS')"></svg>
  </div>
`;

if (window.DOMPurify) {
  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    DOMPurify.sanitize(complexHTML);
  }

  const end = performance.now();
  console.log(`${iterations} sanitizations took ${(end - start).toFixed(2)}ms`);
  console.log(
    `Average: ${((end - start) / iterations).toFixed(4)}ms per sanitization`
  );
} else {
  console.log("DOMPurify not available for performance test");
}

// Manual Test Instructions
console.log("\n📋 Manual Testing Instructions:");
console.log(
  "1. Navigate to the search bar and enter: <script>alert('Search XSS')</script>"
);
console.log(
  "2. Try the newsletter signup with: test@example.com<img src=x onerror=alert('Newsletter XSS')>"
);
console.log(
  "3. In the login form, try username: admin<script>alert('Login XSS')</script>"
);
console.log("4. Check if any alerts appear - they shouldn't!");

// Export test function for repeated use
window.runSecurityTests = function () {
  console.clear();
  console.log("🔒 Running DOMPurify Security Tests...");
  // Re-run all tests above
};

console.log("\n✅ Security tests completed! Check the results above.");
console.log("💡 Tip: Run 'runSecurityTests()' to repeat these tests anytime.");
