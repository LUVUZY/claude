import {Composition} from 'remotion';
import {BuyersMind2D} from './TwoD';
import {BuyersMind3D} from './ThreeD';
import {TwoSellers, TWO_SELLERS_FRAMES} from './TwoSellers';
import {MaybeLater, MAYBE_LATER_FRAMES} from './MaybeLater';
import {CheapRisk, CHEAP_RISK_FRAMES} from './CheapRisk';
import {CheapRiskWide, WIDE_FRAMES} from './CheapRiskWide';
import {CryoCalibration} from './CryoCalibration';
import {NextTo, NEXT_TO_FRAMES} from './NextTo';
import {HookV2, HOOK_V2_FRAMES} from './HookV2';

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
    <Composition id="CheapRiskWide" component={CheapRiskWide} durationInFrames={WIDE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="CheapRiskWideMusicReady" component={CheapRiskWide} defaultProps={{music: 'none' as const}} durationInFrames={WIDE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="CryoCalibration" component={CryoCalibration} durationInFrames={130} fps={30} width={1920} height={1080} />
    <Composition id="NextTo" component={NextTo} durationInFrames={NEXT_TO_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="NextToMusicReady" component={NextTo} defaultProps={{music: 'none' as const}} durationInFrames={NEXT_TO_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="HookV2" component={HookV2} durationInFrames={HOOK_V2_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
