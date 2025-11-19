# Running LetsRide on iOS

## Prerequisites
- Xcode installed and updated
- iOS Simulator installed
- CocoaPods installed (`sudo gem install cocoapods`)

## First Time Setup
```bash
cd /Users/ninefigurelegend/Documents/GitHub/letsride
npx expo prebuild
cd ios && pod install && cd ..
```

## Running the App

### Method 1: Quick Run (Recommended)
```bash
npx expo run:ios
```

This automatically:
- Opens iOS Simulator
- Builds and installs the app
- Starts the Metro bundler

### Method 2: Specific Simulator
```bash
npx expo run:ios --simulator="iPhone 15 Pro"
```

### Method 3: Physical Device
```bash
npx expo run:ios --device
```

## Troubleshooting

**Build fails**: Clean build folder
```bash
cd ios && xcodebuild clean && cd ..
npx expo run:ios
```

**Pod errors**: Reinstall pods
```bash
cd ios && pod deintegrate && pod install && cd ..
```

**Port conflict**: Use different port
```bash
npx expo start --port 8082
```

