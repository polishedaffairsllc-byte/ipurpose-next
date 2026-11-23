import { FirstRunChoiceScreen } from '../../components/FirstRunChoiceScreen';
import { useFirstRun } from '../../context/FirstRunContext';

export default function StartingPointScreen() {
  const { advance } = useFirstRun();
  return <FirstRunChoiceScreen onSelect={choice => advance({ stage: 'intro', choice })} />;
}
