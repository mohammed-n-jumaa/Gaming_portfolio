import { AppProvider } from "@/components/AppProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { Cursor } from "@/components/Cursor";
import { HUD, Toasts } from "@/components/HUD";
import { ThemeDock } from "@/components/ThemeDock";
import { Guide } from "@/components/guide/Guide";
import { TitleScreen } from "@/components/levels/TitleScreen";
import { CharacterSheet } from "@/components/levels/CharacterSheet";
import { Inventory } from "@/components/levels/Inventory";
import { Abilities } from "@/components/levels/Abilities";
import { QuestLog } from "@/components/levels/QuestLog";
import { WorldMap } from "@/components/levels/WorldMap";
import { Console } from "@/components/levels/Console";
import { Continue } from "@/components/levels/Continue";

export default function Page() {
  return (
    <AppProvider>
      <SmoothScroll />
      <Preloader />
      <Cursor />
      <HUD />
      <Toasts />
      <ThemeDock />
      <main className="main">
        <TitleScreen />
        <CharacterSheet />
        <Inventory />
        <Abilities />
        <QuestLog />
        <WorldMap />
        <Console />
        <Continue />
      </main>
      <Guide />
    </AppProvider>
  );
}
