// Global fetch interceptor — detects 429 quota exceeded responses and dispatches
// a custom DOM event so the QuotaToast component can show a notification.

const _originalFetch = window.fetch.bind(window);

window.fetch = async function (input, init) {
  const response = await _originalFetch(input, init);

  if (response.status === 429) {
    try {
      const clone = response.clone();
      const data = await clone.json();
      if (data?.quotaExceeded) {
        window.dispatchEvent(new CustomEvent('quota-exceeded', { detail: data }));
      }
    } catch {
      // silently ignore parse errors
    }
  }

  return response;
};
