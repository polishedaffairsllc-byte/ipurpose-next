import AsyncStorage from '@react-native-async-storage/async-storage';
import { parsePurposeProgress, type PurposeProgress } from './purpose';

const writes = new Map<string, Promise<void>>();
const deletedAccounts = new Set<string>();
export const purposeStorageKey = (userId: string) => `ipurpose:purpose:v1:${userId}`;

export async function loadPurposeProgress(userId: string) {
  await writes.get(userId)?.catch(() => {});
  return parsePurposeProgress(await AsyncStorage.getItem(purposeStorageKey(userId)));
}

export function savePurposeProgress(userId: string, progress: PurposeProgress) {
  const serialized = JSON.stringify(progress);
  const write = (writes.get(userId) ?? Promise.resolve()).catch(() => {}).then(async () => {
    if (!deletedAccounts.has(userId)) await AsyncStorage.setItem(purposeStorageKey(userId), serialized);
  });
  writes.set(userId, write);
  void write.finally(() => { if (writes.get(userId) === write) writes.delete(userId); }).catch(() => {});
  return write;
}

export async function clearPurposeProgress(userId: string) {
  deletedAccounts.add(userId);
  await writes.get(userId)?.catch(() => {});
  await AsyncStorage.removeItem(purposeStorageKey(userId));
}
