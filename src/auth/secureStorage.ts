import * as SecureStore from 'expo-secure-store';
import type { KeyValueStore } from './handoff';
import { parseStoredSession, type Session } from './session';

/** Android Keystore-backed storage via expo-secure-store. */
export const secureKeyValueStore: KeyValueStore = {
  getItem: (k) => SecureStore.getItemAsync(k),
  setItem: (k, v) => SecureStore.setItemAsync(k, v),
  removeItem: (k) => SecureStore.deleteItemAsync(k),
};

const SESSION_KEY = 'breather.session.v1';

export const sessionStorage = {
  async load(): Promise<Session | null> {
    try {
      return parseStoredSession(await SecureStore.getItemAsync(SESSION_KEY));
    } catch {
      return null;
    }
  },
  async save(s: Session): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(s));
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
