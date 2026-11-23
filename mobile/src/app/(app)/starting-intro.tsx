import { IntroVideo } from '../../components/IntroVideo';
import { useAuth } from '../../context/AuthContext';
import { useFirstRun } from '../../context/FirstRunContext';
import { markIntroCompleted } from '../../lib/api';

export default function StartingIntroScreen() {
  const { user } = useAuth();
  const { state, advance } = useFirstRun();
  if (!user || state?.stage !== 'intro' || !state.choice) return null;
  const choice = state.choice;
  return <IntroVideo key={choice} kind={choice} onContinue={async () => {
    await markIntroCompleted(choice, user.uid);
    await advance({ stage: 'experience', choice });
  }} />;
}
