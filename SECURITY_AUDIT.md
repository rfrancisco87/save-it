# Security Audit - Save It Chrome Extension

## Executive Summary
This document outlines the security review of the "Save It" Chrome extension, identifying current security posture and recommendations for improvements.

## Current Security Status: ⚠️ MODERATE RISK

---

## Identified Security Issues

### 🔴 CRITICAL

#### 1. No URL Validation on Webhook Configuration
**Risk Level:** Critical  
**Location:** `options/options.js` (line 3)  
**Issue:** The extension accepts any string as a webhook URL without validation.

**Attack Vector:**
- Users could accidentally save malicious URLs
- Data exfiltration to attacker-controlled servers
- Potential for SSRF attacks

**Recommendation:**
```javascript
function isValidWebhookUrl(url) {
    try {
        const urlObj = new URL(url);
        // Only allow HTTPS for security
        if (urlObj.protocol !== 'https:') {
            return { valid: false, error: 'Only HTTPS URLs are allowed' };
        }
        // Prevent localhost/internal network access
        if (urlObj.hostname === 'localhost' || 
            urlObj.hostname === '127.0.0.1' ||
            urlObj.hostname.match(/^192\.168\./)) {
            return { valid: false, error: 'Internal network URLs are not allowed' };
        }
        return { valid: true };
    } catch (e) {
        return { valid: false, error: 'Invalid URL format' };
    }
}
```

---

### 🟡 HIGH

#### 2. Overly Broad Host Permissions
**Risk Level:** High  
**Location:** `manifest.json` (line 11)  
**Issue:** `<all_urls>` grants permission to access every website.

**Current:**
```json
"host_permissions": ["<all_urls>"]
```

**Impact:**
- Extension appears overly privileged in Chrome Web Store
- Users may be hesitant to install
- Violates principle of least privilege

**Recommendation:**
Since webhooks can be any URL, this is necessary for functionality. However, add clear documentation explaining why this permission is needed. Consider:
- Adding a warning in the UI when users first configure
- Explaining in the Chrome Web Store description
- Consider optional mode: user-specified domain restrictions

---

#### 3. Missing Content Security Policy (CSP)
**Risk Level:** High  
**Location:** `manifest.json`  
**Issue:** No CSP defined, allowing inline scripts and eval().

**Recommendation:**
Add to `manifest.json`:
```json
"content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
}
```

---

#### 4. No Input Sanitization on User-Edited URL
**Risk Level:** High  
**Location:** `popup/popup.js` (line 57)  
**Issue:** User can edit the URL in the textarea before sending; no validation occurs.

**Attack Vector:**
- User could accidentally modify URL to malicious destination
- No length limits (could cause DoS with extremely long URLs)

**Recommendation:**
```javascript
function validateAndSanitizeUrl(url) {
    // Trim whitespace
    url = url.trim();
    
    // Check length (reasonable max for URL)
    if (url.length > 2048) {
        return { valid: false, error: 'URL too long (max 2048 characters)' };
    }
    
    // Validate URL format
    try {
        new URL(url);
        return { valid: true, url };
    } catch (e) {
        return { valid: false, error: 'Invalid URL format' };
    }
}
```

---

### 🟢 MEDIUM

#### 5. Webhook URL Stored in Sync Storage
**Risk Level:** Medium  
**Location:** `options/options.js` (line 5)  
**Issue:** `chrome.storage.sync` syncs data across all user devices.

**Concerns:**
- If webhook URL contains sensitive tokens/keys (bad practice but possible)
- Data synced to Google's servers
- Accessible on all synced Chrome instances

**Recommendation:**
- Add warning in UI: "Webhook URLs are synced across your Chrome browsers"
- Consider using `chrome.storage.local` instead
- Document: users should NOT include secrets in webhook URLs

---

#### 6. No Rate Limiting on Webhook Requests
**Risk Level:** Medium  
**Location:** `background.js`  
**Issue:** No rate limiting on fetch requests.

**Attack Vector:**
- Malicious user could spam webhook endpoint
- Could be used for DoS attacks against third-party services

**Recommendation:**
```javascript
// Add simple rate limiting
const rateLimiter = {
    requests: [],
    maxRequests: 10,
    timeWindow: 60000, // 1 minute
    
    canMakeRequest() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            return false;
        }
        
        this.requests.push(now);
        return true;
    }
};
```

---

#### 7. Error Messages May Leak Information
**Risk Level:** Medium  
**Location:** `background.js` (line 23), `popup/popup.js` (line 62, 77)  
**Issue:** Detailed error messages shown to user.

**Concerns:**
- Response bodies from failed requests shown to user
- Could leak sensitive information from webhook endpoints
- Status codes and error details exposed

**Recommendation:**
- Sanitize error messages before showing to user
- Log detailed errors for debugging, show generic messages to users
- Don't expose full response bodies

---

### 🔵 LOW

#### 8. No Timeout on Fetch Requests
**Risk Level:** Low  
**Location:** `background.js` (line 9)  
**Issue:** Fetch requests have no timeout.

**Impact:**
- Slow webhook endpoints could hang the extension
- Poor user experience

**Recommendation:**
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal
})
.finally(() => clearTimeout(timeout));
```

---

#### 9. Missing Security Headers Documentation
**Risk Level:** Low  
**Issue:** No documentation about required webhook security.

**Recommendation:**
Document in README that webhook endpoints should:
- Use HTTPS only
- Implement authentication/authorization
- Validate request origins if needed
- Rate limit requests

---

## Secure Coding Practices ✅

### What's Already Secure:

1. ✅ **XSS Prevention:** Using `textContent` instead of `innerHTML`
2. ✅ **Message Passing:** Proper use of Chrome messaging API
3. ✅ **Background Script:** Fetches isolated from page context
4. ✅ **No Eval:** No use of `eval()` or `Function()` constructors
5. ✅ **Manifest V3:** Using latest secure manifest version

---

## Priority Recommendations

### Immediate (Before Public Release):
1. Add URL validation for webhook URLs (enforce HTTPS)
2. Add CSP to manifest
3. Add input validation for user-edited URLs
4. Sanitize error messages

### Short Term:
5. Implement rate limiting
6. Add request timeouts
7. Add security documentation for users

### Long Term:
8. Consider webhook URL encryption in storage
9. Add option for manual domain whitelist
10. Implement request logging for debugging

---

## Compliance Notes

- ✅ Minimal data collection (only stores webhook URL)
- ✅ No analytics/tracking
- ⚠️ Should add privacy policy clearly stating what data goes to webhook
- ⚠️ Should warn users about data leaving their browser

---

## Overall Security Score: 6.5/10

**Strengths:**
- Modern Manifest V3
- No obvious code injection vulnerabilities
- Minimal permission scope (given functionality)

**Weaknesses:**
- No input validation
- Broad host permissions (necessary but concerning)
- Missing CSP and security headers

**Conclusion:** The extension is reasonably secure but requires critical improvements before public distribution.
