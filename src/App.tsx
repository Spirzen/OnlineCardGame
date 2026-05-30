import { GameProvider, useGame } from './hooks/useGame';
import { FxProvider, useScreenTransition } from './hooks/useFx';
import { MenuScreen, BannerOverlay } from './components/MenuScreen';
import { MapScreen } from './components/MapScreen';
import { CombatScreen } from './components/CombatScreen';
import { TutorialOverlay, useTutorialTrigger } from './components/TutorialOverlay';
import {
  RewardScreen,
  ShopScreen,
  RestScreen,
  EventScreen,
  TreasureScreen,
  GameOverScreen,
} from './components/Screens';
import {
  ClassSelectScreen,
  RelicPickScreen,
  StatsScreen,
  SmithScreen,
  CardEditorScreen,
} from './components/ExtraScreens';
import { DeckModal } from './components/DeckModal';
import { CodexScreen } from './components/CodexScreen';
import { EpicNovelScreen } from './components/EpicNovelScreen';
import { StoryTutorialScreen } from './components/StoryTutorialScreen';
import { ClickerScreen } from './components/ClickerScreen';
import { FxOverlay } from './components/FxOverlay';

function GameRouter() {
  const { run, tick, dispatch } = useGame();
  void tick;
  const transitioning = useScreenTransition(run.screen);
  const { showTutorial, closeTutorial } = useTutorialTrigger(run.screen);

  if (run.screen === 'story_tutorial') {
    return (
      <>
        <StoryTutorialScreen
          onComplete={() => dispatch({ type: 'COMPLETE_STORY_TUTORIAL' })}
          onSkip={() => dispatch({ type: 'SKIP_STORY_TUTORIAL' })}
        />
        <FxOverlay />
      </>
    );
  }

  const screens: Record<string, React.ReactNode> = {
    menu: <MenuScreen />,
    class_select: <ClassSelectScreen />,
    relic_pick: <RelicPickScreen />,
    map: <MapScreen />,
    combat: <CombatScreen />,
    reward: <RewardScreen />,
    shop: <ShopScreen />,
    rest: <RestScreen />,
    smith: <SmithScreen />,
    event: <EventScreen />,
    treasure: <TreasureScreen />,
    codex: <CodexScreen />,
    epic_novel: <EpicNovelScreen />,
    game_over: <GameOverScreen victory={false} />,
    victory: <GameOverScreen victory={true} />,
    stats: <StatsScreen />,
    card_editor: <CardEditorScreen />,
    clicker: <ClickerScreen />,
  };

  return (
    <>
      <div className={`screen-wrap ${transitioning ? 'screen-wrap--transition' : ''}`}>
        {screens[run.screen]}
      </div>
      <BannerOverlay />
      <DeckModal />
      <FxOverlay />
      <TutorialOverlay active={showTutorial} onClose={closeTutorial} />
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <FxProvider>
        <div className="app">
          <div className="aurora" />
          <div className="stars" />
          <div className="app-main">
            <GameRouter />
          </div>
        </div>
      </FxProvider>
    </GameProvider>
  );
}
