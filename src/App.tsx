import { GameProvider, useGame } from './hooks/useGame';
import { FxProvider, useScreenTransition } from './hooks/useFx';
import { MenuScreen, BannerOverlay } from './components/MenuScreen';
import { MapScreen } from './components/MapScreen';
import { CombatScreen } from './components/CombatScreen';
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
import { FxOverlay } from './components/FxOverlay';
import { SiteHeader } from './components/SiteHeader';

function GameRouter() {
  const { run, tick } = useGame();
  void tick;
  const transitioning = useScreenTransition(run.screen);

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
    game_over: <GameOverScreen victory={false} />,
    victory: <GameOverScreen victory={true} />,
    stats: <StatsScreen />,
    card_editor: <CardEditorScreen />,
  };

  return (
    <>
      <div className={`screen-wrap ${transitioning ? 'screen-wrap--transition' : ''}`}>
        {screens[run.screen]}
      </div>
      <BannerOverlay />
      <DeckModal />
      <FxOverlay />
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
          <SiteHeader />
          <div className="app-main">
            <GameRouter />
          </div>
        </div>
      </FxProvider>
    </GameProvider>
  );
}
