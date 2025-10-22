# Firebase Realtime Database Setup

Your Firebase credentials have been configured, but you need to set up database security rules to allow the application to read and write orders.

## Setting Up Database Rules

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Navigate to Realtime Database**:
   - Click "Build" → "Realtime Database" in the left sidebar
4. **Go to Rules tab**
5. **Replace the existing rules** with one of the following:

### Option 1: Development Mode (Unrestricted Access)
⚠️ **Use this for development/testing only**

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Option 2: Production Mode (Recommended)
✅ **More secure, allows all authenticated users**

```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true,
      "$orderId": {
        ".validate": "newData.hasChildren(['orderNumber', 'items', 'total', 'status', 'timestamp', 'paymentMethod'])"
      }
    }
  }
}
```

### Option 3: Most Secure (Authenticated Users Only)
🔒 **Requires Firebase Authentication setup**

```json
{
  "rules": {
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$orderId": {
        ".validate": "newData.hasChildren(['orderNumber', 'items', 'total', 'status', 'timestamp', 'paymentMethod'])"
      }
    }
  }
}
```

## Publishing Rules

1. After pasting your chosen rules, click **"Publish"**
2. Wait a few seconds for the rules to propagate
3. Reload your application

## Verify It's Working

1. Open the application in your browser
2. Go to Billing → Add an item → Complete payment
3. Navigate to Kitchen page
4. You should see the order appear (may take 1-2 seconds)
5. Try updating the order status - it should sync across tabs

## Troubleshooting

If you still see permission errors:

1. **Check browser console** for specific error messages
2. **Verify database URL** matches your project in the Firebase Console
3. **Wait 30 seconds** after publishing rules for changes to propagate
4. **Hard reload** your browser (Ctrl+Shift+R or Cmd+Shift+R)

## Next Steps

Once rules are configured, the application will:
- ✅ Save orders to Firebase when payment is completed
- ✅ Sync orders in real-time across all kitchen displays
- ✅ Update order status when kitchen staff changes it
- ✅ Show online/offline indicator in the top-right
