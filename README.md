# Weather Buddy Kids ☀️🌧️❄️🌬️🌙

Cartoon-style weather app for kids ages **4–7**, built with **React Native + Expo**.

**Tabs:** Today • Week • Buddy • Settings (About is inside Settings)

---

## What this app does
- Shows weather with big numbers and playful visuals for kids
- Default city on first launch: **Ottawa, Ontario, Canada**
- **Use my location** (optional) with graceful fallback if denied
- **Search city** with autocomplete (Open-Meteo Geocoding)
- Favorites (up to 5) with **global duplicate prevention** (default Ottawa + search + location)
- Kid Mode (ON by default): shows only Temp, Rain, Wind, Dress Tip
- Offline-friendly cache (last successful forecast per city)

---

## Tech stack
- Expo + React Native
- TypeScript
- React Navigation (bottom tabs)
- Zustand state
- AsyncStorage caching
- expo-location
- Open-Meteo APIs (no API key)

---

# ✅ Commands (Everything you need)

## 0) Requirements
- Node.js (LTS recommended)
- npm
- Expo Go app installed on your phone (for device testing)
- Expo account (for EAS builds)
- iOS builds: Apple Developer account

---

## 1) Install (first time)
From the project root:

```bash
npm install
```

If you hit Expo dependency mismatch / ERESOLVE issues:

```bash
npx expo install --fix
npm install
```

---

## 2) Run locally (Expo Go)
Start the dev server:

```bash
npx expo start
```

Clear cache (recommended if something is weird):

```bash
npx expo start -c
```

---

## 3) Cleanup + reinstall (common fix)
```bash
rm -rf node_modules package-lock.json
npm install
```

If npm still complains about peer deps:

```bash
npm install --legacy-peer-deps
```

---

# EAS Build (Android + iOS)

## 4) One-time EAS setup (per machine)
Install EAS CLI:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

Initialize:

```bash
eas init
```

Configure build setup:

```bash
eas build:configure
```

---

## 5) Android builds
> Google Play Store requires **AAB**. APK is for testing/sideload.

### Build APK (Preview / Testing)
```bash
eas build -p android --profile preview
```

### Build AAB (Production / Google Play)
```bash
eas build -p android --profile production
```

### Download your build
- After the build finishes, EAS prints a download URL in the terminal.
- You can also download from your Expo dashboard (Builds page for your project).

---

## 6) iOS builds
> iOS builds require an Apple Developer account and signing.

### Build IPA (Preview / internal testing)
```bash
eas build -p ios --profile preview
```

### Build App Store-ready build (Production)
```bash
eas build -p ios --profile production
```

### Download your build
- EAS prints a download URL in the terminal and lists builds in your Expo dashboard.

---

## 7) Store submit (optional)
> Android submit often requires you to create the app in Play Console at least once first.

### Submit Android
```bash
eas submit -p android --profile production
```

### Submit iOS
```bash
eas submit -p ios --profile production
```

---

# Versioning (Important for Play Store)

## 8) Android: package name + versionCode
- `android.package` must be **lowercase** and should never change after publishing.
- `android.versionCode` must increase with every Play Store upload.

Example (app.json):
```json
"android": {
  "package": "com.mohibr.weatherbuddykids",
  "versionCode": 2
}
```

## 9) Expo app version
In `app.json`:
- `expo.version` is the user-visible version (e.g. 1.0.0)

---

# Android APK naming (optional)
Google Play uses AAB. If you want your downloaded preview APK to be named:

**WeatherBuddyKids.apk**

Rename after downloading:

```bash
mv /path/to/downloaded.apk WeatherBuddyKids.apk
```

(Exact artifact filename from EAS is not always controllable inside the cloud build.)

---

# Data source
Weather data by **Open-Meteo**:
- Geocoding API: city search autocomplete
- Forecast API: current + daily forecast
No API key required.

---

# Privacy
- No accounts
- No server-side storage of personal data by Aignitron Inc.
- Location is optional and used only to show local weather
Privacy Policy:
https://www.aignitron.com/AIApps/WeatherBuddy/Privacy

Support:
WeatherBuddyKids@aignitron.com

---

# License
**Code:** Apache-2.0 (see LICENSE)

**Branding & assets** (names “Aignitron”, “Weather Buddy Kids”, icons, buddy character art, illustrations, screenshots):
© Aignitron Inc. All rights reserved.
See ASSETS_LICENSE.md and TRADEMARKS.md.
