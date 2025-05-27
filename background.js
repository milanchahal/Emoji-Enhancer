chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getEmojiSuggestions') {
    const apiKey = 'CONFIG.API_KEY'; // Replace with your actual API key
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Suggest appropriate emojis for this message: "${request.text}". Return the original message with emojis added.`
          }]
        }]
      })
    })
    .then(response => response.json())
    .then(data => {
      // Assuming the API returns the modified text in the response
      const modifiedText = data.candidates[0].content.parts[0].text;
      sendResponse({ modifiedText: modifiedText });
    })
    .catch(error => {
      sendResponse({ error: 'Failed to get emoji suggestions' });
    });

    return true;  // Keep the messaging channel open for sendResponse
  }
});