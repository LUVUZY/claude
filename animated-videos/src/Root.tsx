import {Composition} from 'remotion';
import {BuyersMind2D} from './TwoD';
import {BuyersMind3D} from './ThreeD';
import {TwoSellers, TWO_SELLERS_FRAMES} from './TwoSellers';
import {MaybeLater, MAYBE_LATER_FRAMES} from './MaybeLater';
import {CheapRisk, CHEAP_RISK_FRAMES} from './CheapRisk';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BuyersMind2D" component={BuyersMind2D} durationInFrames={600} fps={30} width={1080} height={1920} />
    <Composition id="BuyersMind3D" component={BuyersMind3D} durationInFrames={480} fps={30} width={1080} height={1920} />
    <Composition id="TwoSellers" component={TwoSellers} durationInFrames={TWO_SELLERS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MaybeLater" component={MaybeLater} durationInFrames={MAYBE_LATER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MaybeLaterDemoBeat" component={MaybeLater} defaultProps={{music: 'demo' as const}} durationInFrames={MAYBE_LATER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MaybeLaterWithSong" component={MaybeLater} defaultProps={{music: 'song' as const}} durationInFrames={MAYBE_LATER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MaybeLaterBeatGuide" component={MaybeLater} defaultProps={{music: 'guide' as const}} durationInFrames={MAYBE_LATER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="CheapRisk" component={CheapRisk} durationInFrames={CHEAP_RISK_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="CheapRiskMusicReady" component={CheapRisk} defaultProps={{music: 'none' as const}} durationInFrames={CHEAP_RISK_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
