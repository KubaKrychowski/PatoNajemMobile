# PatoNajem Mobile

Aplikacja mobilna platformy PatoNajem — weryfikacja nieruchomości przed wynajmem.

## Stack

- **Expo SDK 56** + TypeScript
- **Expo Router** — nawigacja (tabs + stack)
- **Redux Toolkit** — stan globalny (auth, filtry ofert)
- **TanStack Query** — cache i asynchroniczne pobieranie danych z API
- **@expo/vector-icons** (Ionicons) — ikony UI
- **React Native Reanimated + Gesture Handler** — animacje i gesty
- **react-native-worklets** — zależność Reanimated v4
- **SecureStore** — przechowywanie tokenów JWT (z fallbackiem na localStorage dla web)
- **AsyncStorage** — offline cache ofert
- **NetInfo** — wykrywanie braku połączenia

## Wymagania wstępne

- Node.js 18+

API jest zahostowane na **Azure App Service** — nie wymaga lokalnego backendu ani NGINX.

## Uruchomienie

```bash
# 1. Zainstaluj zależności
cd PatoNajemMobile
npm install

# 2. Uruchom na urządzeniu (Expo Go — zeskanuj QR kod)
npm start

# 3. Uruchom na emulatorze Android
npm run android

# 4. Uruchom w przeglądarce (web)
npx expo start --web --clear
```


## Backend

Aplikacja komunikuje się z API zahostowanym na Azure App Service (`polandcentral`). Domyślny adres jest wbudowany w zmienną środowiskową `EXPO_PUBLIC_API_URL` — nie wymaga żadnej konfiguracji.

Aplikacja używa dedykowanego endpointu `POST /api/mobile-token` (zamiast PKCE flow). Endpoint zwraca token JWT bezpośrednio — bez ciasteczek.

## Testy

```bash
npm test
```

**14 testów jednostkowych** pokrywających:
- `calculateScore` — logika scoringu lokalizacji (6 testów)
- `geocodeAddress` — geocodowanie Nominatim (2 testy)
- `offersSlice` — reducery Redux: search, tab, sortBy, priceRange, reset (6 testów)

## Funkcje

### Auth
- Logowanie / rejestracja z walidacją po stronie klienta
- JWT w `SecureStore` na native, `localStorage` jako fallback na web
- Auto-login przy ponownym uruchomieniu (odczyt tokenu z SecureStore)
- Obsługa wygaśnięcia tokenu (401 → automatyczne wylogowanie)

### Lista ofert
- `FlatList` z infinite scroll (paginacja) i pull-to-refresh
- Filtrowanie po statusie: wszystkie / dostępne / wynajęte
- Wyszukiwanie tekstowe
- Offline mode — cache ostatniej strony w `AsyncStorage`
- Wskaźnik trybu offline (NetInfo)

### Dodawanie oferty
- Formularz z walidacją (tytuł, lokalizacja, powierzchnia, cena, opis)
- Wybór zdjęć z galerii (max 5), podgląd miniatur, możliwość usunięcia przed wysłaniem
- Upload zdjęć przez `POST /offers/:id/images` (multipart/form-data) po utworzeniu oferty
- Wybór poziomu patologii: NORMAL / HARD MODE / EXTREME
- Obsługa odmowy uprawnień do galerii z opcją otwarcia ustawień systemowych

### Szczegół oferty
- Galeria zdjęć z miniaturami (swipeable)
- System głosowania (tylko downvote — łapka w dół) z haptic feedback i natychmiastowym odświeżeniem listy
- Licznik wyświetleń (ikona oka)
- Komentarze z datami — wymagane logowanie do dodania

### Analiza adresu
- Geocodowanie przez Nominatim API (OpenStreetMap) — wymagany `User-Agent` w nagłówku
- Geolokalizacja GPS — przycisk "użyj mojej lokalizacji" z obsługą odmowy uprawnień (w tym trwałej blokady → otwórz ustawienia)
- Jakość powietrza: PM2.5, PM10, O₃, NO₂, SO₂, CO (Open-Meteo API)
- Elementy ryzyka w promieniu 1 km: linie WN, kopalnie, kolej, drogi (Overpass API)
- Scoring lokalizacji 0–100 z wizualizacją per kategoria

### Profil
- Dane użytkownika, data rejestracji, rola
- Status weryfikacji emaila
- Wylogowanie z potwierdzeniem

## Architektura

```
app/
├── _layout.tsx          root layout (Provider, QueryClient, GestureHandler)
├── index.tsx            guard — przekierowanie auth/tabs
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/
    ├── _layout.tsx      bottom tab bar (Ionicons, safe area aware)
    ├── oferty/
    │   ├── index.tsx    lista ofert (FlatList + filtry + FAB)
    │   ├── [id].tsx     szczegół oferty (galeria, downvote, komentarze)
    │   └── nowa.tsx     formularz dodawania oferty (image picker)
    ├── analiza.tsx      analiza adresu
    └── profil.tsx       profil użytkownika

store/
├── index.ts             konfiguracja Redux store
├── authSlice.ts         stan auth (user, token, isInitialized)
└── offersSlice.ts       filtry ofert (tab, search, sort, price)

services/
├── api.ts               axios instance z Bearer token interceptorem
├── authService.ts       login, logout, token storage (SecureStore + localStorage)
├── offersService.ts     CRUD ofert, upload zdjęć, cache, głosowanie, komentarze
└── analysisService.ts   geocoding (z User-Agent), air quality, overpass, scoring

components/
├── ui/
│   ├── Button.tsx       warianty: primary, secondary, danger, ghost
│   ├── Input.tsx        z obsługą błędów i pokaż/ukryj hasło
│   └── ScoreBadge.tsx   kółko z wynikiem (green/amber/red)
├── offers/
│   └── OfferCard.tsx    karta oferty (memo, Ionicons)
└── analysis/
    ├── AirQualityCard.tsx  paski PM2.5, PM10, itd.
    └── ScoreCard.tsx       scoring z ikonami Ionicons
```

## Zmienne środowiskowe

| Zmienna | Domyślnie | Opis |
|---------|-----------|------|
| `EXPO_PUBLIC_API_URL` | `https://patonajem-api-dveta0erh4h2avce.polandcentral-01.azurewebsites.net` | Adres backendu (Azure App Service) |

## Natywne funkcje urządzenia

| Feature | Moduł | Zastosowanie |
|---------|-------|--------------|
| Geolokalizacja | `expo-location` | Przycisk "użyj lokalizacji" w analizie |
| Galeria / aparat | `expo-image-picker` | Upload zdjęć do ofert |
| Wibracje | `expo-haptics` | Feedback przy głosowaniu i sukcesie |
| Bezpieczny storage | `expo-secure-store` | Token JWT (native) |

## Bezpieczeństwo

- Token JWT w `SecureStore` (szyfrowany przez OS na native)
- Fallback na `localStorage` tylko na web (nie produkcja)
- `EXPO_PUBLIC_API_URL` w `.env` (plik w `.gitignore`)
- Automatyczne wylogowanie przy 401
- Walidacja formularzy po stronie klienta przed wysłaniem
