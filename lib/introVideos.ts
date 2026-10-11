import { firebaseAdmin } from './firebaseAdmin';
import { INTRO_FLAGS, readIntroCompletions, type IntroKind } from '../mobile/src/lib/introVideos';

export async function getIntroCompletions(uid: string) {
  const snapshot = await firebaseAdmin.firestore().collection('users').doc(uid).get();
  return readIntroCompletions(snapshot.data()?.introVideos);
}

export async function completeIntro(uid: string, kind: IntroKind) {
  // Merge a single nested field; never replace the profile or other intro flags.
  await firebaseAdmin.firestore().collection('users').doc(uid).set(
    { introVideos: { [INTRO_FLAGS[kind]]: true } },
    { merge: true },
  );
}
