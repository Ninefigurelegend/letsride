# Running LetsRide on Android

## Prerequisites
- Android Studio installed
- Android SDK installed (API level 36+)
- Android Virtual Device (AVD) created
- Environment variables configured in `~/.zshrc`:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools

  # Additionally
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/tools/bin
  ```

## First Time Setup
```bash
cd /Users/ninefigurelegend/Documents/GitHub/letsride
npx expo prebuild
```

## Running the App

### Step 1: Start Emulator
**Option A - From Android Studio:**
- Open Android Studio
- Click "Device Manager" (phone icon in toolbar)
- Click ▶️ on your AVD

**Option B - From Terminal:**
```bash
emulator -list-avds  # List available emulators
emulator -avd Pixel_8_Pro &  # Start specific emulator
```

### Step 2: Run App
```bash
npx expo run:android
```

This automatically:
- Builds the Android app
- Installs on running emulator/device
- Starts the Metro bundler

### Physical Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Run: `adb devices` (should see your device)
5. Run: `npx expo run:android --device`

## Troubleshooting

**Emulator not detected**:
```bash
adb devices  # Check connected devices
adb kill-server && adb start-server  # Restart ADB
```

**Build fails - Clean cache**:
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

**Port already in use**:
```bash
lsof -ti:8081 | xargs kill -9  # Kill process on port 8081
npx expo start
```

**Metro bundler issues**:
```bash
npx expo start --clear  # Clear cache and restart
```

