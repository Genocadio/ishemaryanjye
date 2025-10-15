# Support Chat API Migration Guide

## Quick Comparison: Old vs New

### Request Format

#### OLD (Before Migration)
```typescript
fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    last_prompt: input,
    conversation_history: messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    })),
    language: getBotLanguage(language)
  })
})
```

#### NEW (After Migration)
```typescript
fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [...messages, userMessage].map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    })),
    language: getBotLanguage(language)
  })
})
```

**Key Difference:** 
- ❌ Removed: `last_prompt` + `conversation_history`
- ✅ Added: Single `messages` array with full conversation

---

### Response Handling

#### OLD (Static Response)
```typescript
if (response.ok) {
  const data = await response.json()
  if (data.success) {
    const supportMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: data.result,  // All at once
      sender: "support",
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, supportMessage])
  }
}
```

**User Experience:**
- User types message → Sends
- Wait (loading spinner) ⏳
- Full response appears at once 💬

---

#### NEW (Streaming Response)
```typescript
// Create placeholder
const botMessage: Message = {
  id: botMessageId,
  text: "",
  sender: "support",
  timestamp: Date.now(),
}
setMessages((prev) => [...prev, botMessage])

// Stream chunks
const reader = response.body?.getReader()
const decoder = new TextDecoder()
let accumulatedText = ""

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value, { stream: true })
  const lines = chunk.split('\n')
  
  for (const line of lines) {
    const jsonChunk = JSON.parse(line)
    if (jsonChunk.content) {
      accumulatedText += jsonChunk.content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: accumulatedText }
            : msg
        )
      )
    }
  }
}
```

**User Experience:**
- User types message → Sends
- Empty bubble appears immediately 💭
- Text streams in word by word ✍️
- Response builds in real-time 🔄

---

## Visual Flow Comparison

### OLD FLOW (Static)
```
User Input
    ↓
Send Request
    ↓
[Loading Spinner ⏳]
    ↓
Wait for complete response...
    ↓
Display full message at once 💬
    ↓
Done ✓
```

### NEW FLOW (Streaming)
```
User Input
    ↓
Send Request
    ↓
Create empty message bubble 💭
    ↓
[Typing indicator ⏳]
    ↓
Stream starts → Stop typing indicator
    ↓
Chunk 1: "Hello" 
    ↓ Update message
Chunk 2: " how"
    ↓ Update message
Chunk 3: " are"
    ↓ Update message
Chunk 4: " you?"
    ↓ Update message
Chunk 5: {"done": true}
    ↓
Done ✓ "Hello how are you?" 💬
```

---

## Backend Response Format

### Streaming Chunks Example

```json
// Chunk 1
{"content": "**Welcome"}

// Chunk 2
{"content": " to"}

// Chunk 3
{"content": " ISHEMA"}

// Chunk 4
{"content": " RYANJYE!**"}

// Chunk 5
{"content": "\n\n"}

// Chunk 6
{"content": "I can"}

// Chunk 7
{"content": " help"}

// Chunk 8
{"content": " you"}

// Chunk 9
{"content": " with:"}

// Chunk 10
{"content": "\n1."}

// Chunk 11
{"content": " Sexual"}

// Chunk 12
{"content": " &"}

// Chunk 13
{"content": " Reproductive"}

// Chunk 14
{"content": " Health"}

// Final chunk
{"done": true}
```

**What User Sees:**
```
**Welcome to ISHEMA RYANJYE!**

I can help you with:
1. Sexual & Reproductive Health
```
(Appears progressively, not all at once)

---

## Error Handling Comparison

### OLD
```typescript
catch (error) {
  setError("Failed to get response from bot")
}
```

### NEW
```typescript
catch (error) {
  console.error("Error in handleSendMessage:", error)
  setError("Failed to get response from bot")
  
  // Remove the empty bot message if there was an error
  setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId))
}
```

**Improvement:** Cleans up placeholder message on error

---

## Testing Scenarios

### Scenario 1: Short Response
**Input:** "Hello"
**Expected:** Quick streaming, minimal chunks
**Visual:** Brief typing effect

### Scenario 2: Long Response
**Input:** "Tell me about reproductive health"
**Expected:** Many chunks, extended streaming
**Visual:** Gradual text buildup, engaging to watch

### Scenario 3: Formatted Response
**Input:** "What can you help with?"
**Expected:** Markdown in chunks
**Visual:** Bold, lists, etc. appear progressively

### Scenario 4: Error Handling
**Simulate:** Network interruption mid-stream
**Expected:** Error message, placeholder removed
**Visual:** Clean error state

---

## Language Behavior

### English/French → English Backend
```javascript
getBotLanguage('en') // → 'english'
getBotLanguage('fr') // → 'english'
```

### Kinyarwanda → Kinyarwanda Backend
```javascript
getBotLanguage('rw') // → 'kinyarwanda'
```

### On Language Change
1. Clear all messages
2. Reset welcome flag
3. Fetch new configuration
4. Show welcome in new language
5. Ready for new conversation

---

## Performance Metrics to Monitor

### Response Time
- **Old:** Time to complete response
- **New:** Time to first chunk (should be faster!)

### Perceived Performance
- **Old:** User waits for full response
- **New:** User sees progress immediately

### Network Efficiency
- **Old:** Single large payload
- **New:** Progressive chunks (can be interrupted)

---

## Migration Checklist

- [x] Update request format (messages array)
- [x] Implement streaming reader
- [x] Add chunk accumulation logic
- [x] Update real-time message display
- [x] Enhance error handling
- [x] Update branding to ISHEMA RYANJYE
- [x] Test markdown in streaming
- [x] Verify language switching
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Gather user feedback

---

**Status:** ✅ Ready for Testing
**Breaking Changes:** Yes - requires backend streaming support
**Rollback:** Change URLs to old endpoint if needed
