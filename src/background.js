// Background script to handle Webhook requests to avoid CORS issues

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'sendToWebhook') {
        const { webhookUrl, payload } = message.data;


        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(async (response) => {
                if (response.ok) {
                    sendResponse({ success: true });
                } else {
                    // capture more details if the request fails
                    const text = await response.text().catch(() => '');
                    const statusPart = response.status ? `Status ${response.status}` : '';
                    const msg = [statusPart, response.statusText, text].filter(Boolean).join(' - ');
                    sendResponse({ success: false, error: msg || 'Request Failed' });
                }
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep the message channel open for async sendResponse
    }
});
