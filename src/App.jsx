import { useMemo } from 'react';
import { detectQuality } from './engine/quality';
import ScrollDriver from './engine/ScrollDriver';
import WorldCanvas from './engine/WorldCanvas';
import TransitionWipe from './engine/TransitionWipe';
import { registry } from './engine/sceneRegistry';
import Loader from './ui/Loader';
import Cursor from './ui/Cursor';
import Nav from './ui/Nav';
import DebugHud from './ui/DebugHud';
import LiteSite from './lite/LiteSite';
import SeoHead from './components/SeoHead';

export default function App() {
  const { lite } = useMemo(detectQuality, []);
  if (lite) return (<><SeoHead /><LiteSite /></>);
  return (
    <>
      <SeoHead />
      <ScrollDriver />
      <WorldCanvas />
      <div className="overlays">{registry.map((s) => { const O = s.Overlay; return <O key={s.id} />; })}</div>
      <TransitionWipe />
      <Nav />
      <Cursor />
      <Loader />
      <DebugHud />
    </>
  );
}
