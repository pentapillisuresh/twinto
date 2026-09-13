# TWINTO - Expo SDK 54 / JSX

## Install
npm install
npx expo install
npx expo run:android

If cache/native files are stale:
npx expo start --clear
npx expo run:android

## Demo
OTP: 123456
Default service area: Anantapur (17 mins)
Unavailable preview: Location -> Preview unavailable-location screen

## API later
Replace implementations in services/index.js. UI uses dummy data from data/index.js, so screens do not need to be rewritten.

Business rules included:
- Platform Fee (not Handling Fee)
- Separate Delivery Partner Fee
- Up to 3 items = free delivery in dummy rule
- Customer address included in checkout flow
- Product weight, price, discount and delivery minutes
