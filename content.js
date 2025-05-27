// Function to insert the emoji into the text area
function insertEmojiAtCursor(emoji) {
  const activeElement = document.activeElement;
  if (activeElement && activeElement.tagName === 'INPUT') {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const text = activeElement.value;
      activeElement.value = text.slice(0, start) + emoji + text.slice(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + emoji.length;
  }
}

// Function to show emoji suggestions
function showSuggestions(suggestions) {
  const suggestionBox = document.createElement('div');
  suggestionBox.id = 'emoji-suggestion-box';
  suggestionBox.style.position = 'absolute';
  suggestionBox.style.border = '1px solid #ccc';
  suggestionBox.style.background = '#fff';
  suggestionBox.style.zIndex = 1000;

  suggestions.forEach(emoji => {
      const emojiItem = document.createElement('div');
      emojiItem.textContent = emoji;
      emojiItem.style.padding = '5px';
      emojiItem.style.cursor = 'pointer';
      emojiItem.onclick = () => insertEmojiAtCursor(emoji);
      suggestionBox.appendChild(emojiItem);
  });

  document.body.appendChild(suggestionBox);
}

// Function to handle text input and get suggestions
function handleTextInput(event) {
  const text = event.target.value;
  chrome.runtime.sendMessage({ action: 'getEmojiSuggestions', text }, response => {
      const suggestionBox = document.getElementById('emoji-suggestion-box');
      if (suggestionBox) suggestionBox.remove();
      showSuggestions(response.emojis);
  });
}

// Add event listener for text input
document.querySelectorAll('input[type="text"]').forEach(input => {
  input.addEventListener('input', handleTextInput);
});

// Add event listener for Tab key press to insert selected emoji
document.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
      const suggestionBox = document.getElementById('emoji-suggestion-box');
      if (suggestionBox) {
          const firstEmoji = suggestionBox.firstChild;
          if (firstEmoji) {
              insertEmojiAtCursor(firstEmoji.textContent);
              suggestionBox.remove();
              event.preventDefault();
          }
      }
  }
});

// Handle suggest button click
document.getElementById('suggestBtn').addEventListener('click', () => {
  const message = document.getElementById('message').value;
  chrome.runtime.sendMessage(
      { action: 'getEmojiSuggestions', text: message },
      response => {
          const suggestionsDiv = document.getElementById('suggestions');
          if (response.emojis && response.emojis.length > 0) {
              suggestionsDiv.textContent = message + ' ' + response.emojis.join(' ');
          } else {
              suggestionsDiv.textContent = 'No suggestions found.';
          }
      }
  );
});