document.addEventListener('DOMContentLoaded', function() {
    const message = document.getElementById('message');
    const suggestBtn = document.getElementById('suggestBtn');
    const suggestions = document.getElementById('suggestions');
    const copyBtn = document.getElementById('copyBtn');
  
    // Function to show emoji suggestions
    function showSuggestions(emojis) {
        const suggestionBox = document.createElement('div');
        suggestionBox.id = 'emoji-suggestion-box';
        suggestionBox.style.position = 'absolute';
        suggestionBox.style.border = '1px solid #ccc';
        suggestionBox.style.background = '#fff';
        suggestionBox.style.zIndex = 1000;
  
        emojis.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.textContent = emoji;
            emojiItem.style.padding = '5px';
            emojiItem.style.cursor = 'pointer';
            emojiItem.onclick = () => insertEmojiAtCursor(emoji);
            suggestionBox.appendChild(emojiItem);
        });
  
        document.body.appendChild(suggestionBox);
    }
  
    // Function to insert emoji at cursor
    function insertEmojiAtCursor(emoji) {
        const start = message.selectionStart;
        const end = message.selectionEnd;
        const text = message.value;
        message.value = text.slice(0, start) + emoji + text.slice(end);
        message.selectionStart = message.selectionEnd = start + emoji.length;
    }
  
    // Function to handle text input and get suggestions
    function handleTextInput() {
        const text = message.value;
        chrome.runtime.sendMessage({ action: 'getEmojiSuggestions', text }, response => {
            const suggestionBox = document.getElementById('emoji-suggestion-box');
            if (suggestionBox) suggestionBox.remove();
            if (response.emojis && response.emojis.length > 0) {
                showSuggestions(response.emojis);
            }
        });
    }
  
    // Add event listener for text input
    message.addEventListener('input', handleTextInput);
  
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
    suggestBtn.addEventListener('click', () => {
        const text = message.value;
        chrome.runtime.sendMessage(
            { action: 'getEmojiSuggestions', text },
            response => {
                if (response.modifiedText) {
                    suggestions.textContent = response.modifiedText;
                } else if (response.error) {
                    suggestions.textContent = response.error;
                } else {
                    suggestions.textContent = 'No suggestions found.';
                }
            }
        );
    });
  
    // Handle copy button click
    copyBtn.addEventListener('click', function() {
        const suggestionsText = suggestions.innerText;
        navigator.clipboard.writeText(suggestionsText).then(function() {
            showToast('Message copied!');
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy message');
        });
    });
  
    // Function to show toast
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0,0,0,0.7)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1001';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
  });