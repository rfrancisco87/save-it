// Generate a secure random key
const generateApiKey = () => {
    // Generate a 32-character random key using crypto API
    const array = new Uint8Array(24); // 24 bytes = 32 base64 chars
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

// Save options to chrome.storage
const saveOptions = () => {
    const webhookUrl = document.getElementById('webhook-url').value;
    const apiKey = document.getElementById('api-key').value;

    chrome.storage.sync.set(
        {
            webhookUrl: webhookUrl,
            apiKey: apiKey
        },
        () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.style.opacity = '1';
            setTimeout(() => {
                status.style.opacity = '0';
            }, 750);
        }
    );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        {
            webhookUrl: '',
            apiKey: ''
        },
        (items) => {
            document.getElementById('webhook-url').value = items.webhookUrl;
            document.getElementById('api-key').value = items.apiKey;
        }
    );
};

// Generate key button handler
const handleGenerateKey = () => {
    const apiKeyInput = document.getElementById('api-key');
    apiKeyInput.value = generateApiKey();
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-btn').addEventListener('click', saveOptions);
document.getElementById('generate-key-btn').addEventListener('click', handleGenerateKey);
