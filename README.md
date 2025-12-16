# Save It - Chrome Extension

A minimalist Chrome extension that allows you to send the current tab's URL to a custom webhook. Designed with a Notion-inspired aesthetic.

## Features

- **One-Click Send**: Quickly send the current page URL to your configured webhook.
- **Preview & Edit**: preview the URL before sending.
- **Customizable**: Set your own webhook enpoint (e.g., n8n, Zapier, custom backend).
- **Notion-Style UI**: Clean, minimalist interface.
- **Robust**: Handles CORS requests using a background service worker.

## Installation

1.  Clone this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the `src` folder in this project.

## Configuration

1.  Click the **Save It** icon in the toolbar.
2.  Open **Settings**.
3.  Enter your **Webhook URL**.
4.  Click **Save Settings**.

## Usage

1.  Navigate to any webpage.
2.  Click the extension icon.
3.  Click **Send to Webhook**.

## Payload Format

The webhook receives a JSON POST request:

```json
{
  "text": "https://example.com/current-page",
  "timestamp": "2023-10-27T10:00:00.000Z",
  "apiKey": "your-anti-phishing-key" // Optional, only if configured
}
```

### Anti-Phishing Key

For added security, you can configure an optional anti-phishing key in the extension settings. This key will be included in every webhook request, allowing your webhook endpoint to verify that requests are coming from your extension and not from malicious sources.

## Privacy

This extension only accesses the URL of the active tab when you click the extension icon. It does not track your browsing history. The URL is only sent to the webhook you configure.

## Credits

Developed by [Roberto Francisco](https://seicho.group).
