export const requestForegroundPermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted' }));
export const getCurrentPositionAsync = jest.fn(() => Promise.resolve({ coords: { latitude: 52.2297, longitude: 21.0122 } }));
export const reverseGeocodeAsync = jest.fn(() => Promise.resolve([{ street: 'Puławska', streetNumber: '143', city: 'Warszawa' }]));
export const Accuracy = { Balanced: 3, High: 5 };
