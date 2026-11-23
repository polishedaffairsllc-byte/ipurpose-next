import { IntroVideo } from '../../components/IntroVideo';
import { useFirstRun } from '../../context/FirstRunContext';

export default function WelcomeVideoScreen() {
  const { advance } = useFirstRun();
  return <IntroVideo kind="welcome" onContinue={() => advance({ stage: 'choice' })} />;
}
