# Quick Testing Guide - Startup Buttons

## Test the Feature

### 1. Start the Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Open the Application
Navigate to your app in the browser

### 3. Test Startup Buttons

#### Test Case 1: Initial Display
**Steps:**
1. Click the support chat button (green circle at bottom-right)
2. Chat window opens

**Expected Result:**
✅ Welcome message appears
✅ 4 buttons appear below the welcome message:
   - English
   - Kinyarwanda
   - Ishema card game
   - SRH and Mental health support

#### Test Case 2: Button Click - English
**Steps:**
1. Click "English" button

**Expected Result:**
✅ Buttons disappear immediately
✅ User message appears: "I want to continue in English"
✅ Bot response streams in (word by word)
✅ Bot responds in English

#### Test Case 3: Button Click - Kinyarwanda
**Steps:**
1. Refresh/clear chat
2. Click "Kinyarwanda" button

**Expected Result:**
✅ Buttons disappear
✅ User message: "Nshaka gukomeza mu Kinyarwanda"
✅ Bot responds in Kinyarwanda

#### Test Case 4: Button Click - Card Game
**Steps:**
1. Refresh/clear chat
2. Click "Ishema card game" button

**Expected Result:**
✅ Buttons disappear
✅ User message: "Tell me about the ISHEMA RYANJYE card game"
✅ Bot provides game information

#### Test Case 5: Button Click - Health Support
**Steps:**
1. Refresh/clear chat
2. Click "SRH and Mental health support" button

**Expected Result:**
✅ Buttons disappear
✅ User message: "What sexual and reproductive health and mental health services do you offer?"
✅ Bot provides health information

#### Test Case 6: Buttons Stay Hidden
**Steps:**
1. Click any button
2. Wait for bot response
3. Type another message

**Expected Result:**
✅ Buttons do NOT reappear
✅ Normal chat continues

#### Test Case 7: Language Switch Reset
**Steps:**
1. Select a button and chat
2. Change language using language selector (top right)

**Expected Result:**
✅ Chat clears
✅ Welcome message reappears in new language
✅ Buttons reappear

#### Test Case 8: Clear Chat
**Steps:**
1. Click any button and chat
2. Click the "−" (minus) button in chat header

**Expected Result:**
✅ Chat clears
✅ Welcome message reappears
✅ Buttons reappear

#### Test Case 9: Button Hover Effects
**Steps:**
1. Open chat
2. Hover over each button

**Expected Result:**
✅ Button gradient darkens
✅ Button lifts slightly (transform)
✅ Shadow becomes more prominent
✅ Smooth transition animation

#### Test Case 10: Disabled State
**Steps:**
1. Click a button
2. Immediately try to click another button

**Expected Result:**
✅ Buttons are disabled during loading
✅ Cursor shows "not-allowed"
✅ Buttons appear faded (50% opacity)
✅ No hover effects while disabled

### 4. Mobile Testing

#### Test on Small Screen
**Steps:**
1. Resize browser to mobile width (< 768px)
2. Open chat
3. Check buttons

**Expected Result:**
✅ Buttons are full width
✅ Text is readable
✅ Spacing is appropriate
✅ Touch targets are large enough
✅ All 4 buttons visible without scrolling

### 5. Error Scenarios

#### Test Case 11: Backend Offline
**Steps:**
1. Stop backend server
2. Open chat

**Expected Result:**
✅ Welcome message might not load
✅ Buttons might not appear
✅ Error message displays
✅ Chat is still functional for typing

#### Test Case 12: Network Error During Button Click
**Steps:**
1. Open chat with buttons visible
2. Disconnect network
3. Click a button

**Expected Result:**
✅ Error message displays
✅ Empty bot message is removed
✅ User can try again
✅ Chat remains functional

## Visual Checklist

### Button Appearance
- [ ] Green gradient background (from green-500 to green-600)
- [ ] White text, bold font
- [ ] Rounded full (pill shape)
- [ ] Drop shadow visible
- [ ] Proper spacing between buttons

### Button States
- [ ] **Normal**: Green gradient with shadow
- [ ] **Hover**: Darker gradient, lifted, larger shadow
- [ ] **Active**: Returns to normal position
- [ ] **Disabled**: Faded (50% opacity), no interactions

### Layout
- [ ] Buttons appear after welcome message
- [ ] Buttons are in a vertical column
- [ ] Buttons are properly aligned
- [ ] Appropriate padding and margins
- [ ] Buttons fit within chat window

## Backend Configuration Check

### Verify API Response
**Terminal:**
```bash
curl http://localhost:8000/chat-bot-config/
```

**Expected Response:**
```json
{
  "StartUpMessage": "Muraho! Welcome to ISHEMA RYANJYE...",
  "commonButtons": [
    {
      "buttonText": "English",
      "buttonPrompt": "I want to continue in English"
    },
    {
      "buttonText": "Kinyarwanda",
      "buttonPrompt": "Nshaka gukomeza mu Kinyarwanda"
    },
    {
      "buttonText": "Ishema card game",
      "buttonPrompt": "Tell me about the ISHEMA RYANJYE card game"
    },
    {
      "buttonText": "SRH and Mental health support",
      "buttonPrompt": "What sexual and reproductive health and mental health services do you offer?"
    }
  ],
  "botStatus": 1,
  "botImageURL": "...",
  "userAvatarURL": "...",
  "fontSize": 14
}
```

## Browser Console Checks

### Expected Console Messages
During normal operation:
```
(No errors)
```

During button click:
```
Messages being sent to API: [...]
```

If there's a parsing error (non-critical):
```
Failed to parse chunk: [invalid json line]
```

### Red Flags
❌ `Failed to fetch bot configuration`
❌ `Failed to get response from bot`
❌ Network errors
❌ CORS errors

## Performance Checks

### Loading Time
- [ ] Buttons appear within 1 second of opening chat
- [ ] No visible lag when clicking buttons
- [ ] Streaming response starts within 2 seconds

### Smooth Animations
- [ ] Button hover transitions are smooth (300ms)
- [ ] Button click animation is immediate
- [ ] No jank or stuttering

## Accessibility Checks

### Keyboard Navigation
- [ ] Can tab to buttons
- [ ] Can press Enter/Space to activate
- [ ] Focus indicator visible

### Screen Reader
- [ ] Button text is announced
- [ ] Button purpose is clear

## Integration Checks

### With Existing Features
- [ ] Streaming responses work after button click
- [ ] Markdown formatting works in responses
- [ ] Language switching works correctly
- [ ] Chat history saves properly
- [ ] Error handling works
- [ ] Copy message works
- [ ] Clear chat works
- [ ] Feedback form works

## Quick Debug Commands

### Check State
Add to component temporarily:
```typescript
console.log({
  showStartupButtons,
  messagesLength: messages.length,
  botConfigButtons: botConfig?.commonButtons?.length,
  isLoading
})
```

### Check Button Click
Add to handleButtonClick:
```typescript
console.log('Button clicked:', buttonPrompt)
```

### Check API Response
Add to streaming handler:
```typescript
console.log('Received chunk:', jsonChunk)
```

## Success Criteria

✅ All 4 buttons display correctly
✅ Clicking any button sends the correct prompt
✅ Buttons disappear after selection
✅ Streaming response works
✅ Buttons work on mobile
✅ Hover effects work smoothly
✅ Disabled state prevents double-clicks
✅ Language switching resets buttons
✅ Clear chat resets buttons
✅ No console errors

## Common Issues & Fixes

### Issue: Buttons Don't Appear
**Fix:** Check backend is running and returns commonButtons

### Issue: Button Click Does Nothing
**Fix:** Check console for errors, verify API URL

### Issue: Buttons Don't Disappear
**Fix:** Check showStartupButtons state logic

### Issue: Hover Effects Not Working
**Fix:** Verify Tailwind CSS classes are being applied

### Issue: Mobile Layout Broken
**Fix:** Check responsive classes and screen width

---

**Ready to Test!** 🚀

Start your backend server and open the chat to see the startup buttons in action.
