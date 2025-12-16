document.addEventListener('DOMContentLoaded', () => {
    const pageUrlInput = document.getElementById('page-url');
    const sendBtn = document.getElementById('send-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const configError = document.getElementById('config-error');
    const mainContent = document.getElementById('main-content');
    const goToOptionsBtn = document.getElementById('go-to-options');
    const statusMessage = document.getElementById('status-message');

    let webhookUrl = '';
    let apiKey = '';

    // Load basic data
    chrome.storage.sync.get(['webhookUrl', 'apiKey'], (result) => {
        webhookUrl = result.webhookUrl;
        apiKey = result.apiKey || ''; // Optional, defaults to empty string

        if (!webhookUrl) {
            configError.style.display = 'block';
            mainContent.style.display = 'none';
        } else {
            // Get current tab URL
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    pageUrlInput.value = tabs[0].url;
                }
            });
        }
    });

    // Navigation handlers
    settingsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    goToOptionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Send Logic
    sendBtn.addEventListener('click', async () => {
        const urlToSend = pageUrlInput.value;

        if (!urlToSend) return;
        if (!webhookUrl) {
            showStatus('Error: No Webhook URL configured.', 'error');
            return;
        }

        setLoading(true);

        try {
            // Send message to background script to handle the fetch
            chrome.runtime.sendMessage(
                {
                    action: 'sendToWebhook',
                    data: {
                        webhookUrl: webhookUrl,
                        payload: {
                            text: urlToSend,
                            timestamp: new Date().toISOString(),
                            ...(apiKey && { apiKey: apiKey }) // Only include if apiKey exists
                        }
                    }
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        showStatus('Extension Error: ' + chrome.runtime.lastError.message, 'error');
                        setLoading(false);
                        return;
                    }

                    if (response === undefined) {
                        showStatus('Error: No response from background script. Please Reload Extension.', 'error');
                        setLoading(false);
                        return;
                    }

                    if (response.success) {
                        showStatus('Successfully sent!', 'success');
                        setTimeout(() => window.close(), 1500);
                    } else {
                        showStatus(`Failed: ${response.error || 'Unknown error'}`, 'error');
                    }
                    setLoading(false);
                }
            );
        } catch (error) {
            showStatus('Error: ' + error.message, 'error');
            setLoading(false);
        }
        // internal fetch logic removed as it's now handled asynchronously by message passing
    });

    function setLoading(isLoading) {
        if (isLoading) {
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
        } else {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send to Webhook';
        }
    }

    function showStatus(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.style.display = 'block';
        if (type === 'error') {
            statusMessage.style.color = 'var(--error-red)';
        } else {
            statusMessage.style.color = 'var(--primary-blue)'; // Or success green
        }
    }
});
