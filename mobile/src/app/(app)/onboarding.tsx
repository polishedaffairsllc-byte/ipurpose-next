import { ClarityCheckFlow } from '../../components/ClarityCheckFlow';
import { useFirstRun } from '../../context/FirstRunContext';

export default function OnboardingScreen() {
  const { state, advance } = useFirstRun();
  return <ClarityCheckFlow mode="onboarding" onComplete={state?.stage === 'experience' && state.choice === 'clarity'
    ? () => advance({ stage: 'complete', choice: 'clarity' })
    : undefined} />;
}
