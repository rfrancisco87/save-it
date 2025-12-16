# Save It - Setup & Usage Guide

## Installation
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right corner.
3.  Click **Load unpacked**.
4.  Select the `src` folder inside your project directory (`/Users/rfrancisco/save-it/src`).

## Configuration
1.  Click the **Save It** extension icon in your toolbar.
2.  Since no webhook is configured initially, you will see a prompt to open Settings.
3.  Click **Open Settings** (or the gear icon).
4.  Enter your webhook URL (e.g., from [Webhook.site](https://webhook.site) or your custom endpoint).
5.  Click **Save Settings**.

## Usage
1.  Navigate to any webpage you want to save.
2.  Click the extension icon.
3.  The popup will open with the current URL pre-filled.
4.  (Optional) Edit the URL if needed.
5.  Click **Send to Webhook**.
6.  You should see a "Successfully sent!" message.

## Verification
To verify it works without a real backend, use [Webhook.site](https://webhook.site):
1.  Go to Webhook.site and copy the unique URL.
2.  Paste it into the extension settings.
3.  Send a URL from the extension.
4.  Check Webhook.site to see the POST request with the JSON payload.

### Payload Format
The extension sends data in the following JSON structure:
```json
{
  "text": "https://example.com/current-page",
  "timestamp": "2023-10-27T10:00:00.000Z"
}
```
