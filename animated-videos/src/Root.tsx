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
import {ObsessBuyer, OBSESS_FRAMES} from './ObsessBuyer';
import {ThirdBuyer, THIRD_FRAMES} from './ThirdBuyer';
import {EveryMillionaire, EM_FRAMES} from './EveryMillionaire';
import {LineStyleTest, LINE_TEST_FRAMES} from './LineStyleTest';
import {LessTime, LESS_TIME_FRAMES} from './LessTime';
import {Decoy, DECOY_FRAMES} from './Decoy';
import {TwoMillionaires, TWO_MIL_FRAMES} from './TwoMillionaires';
import {FirstTenK, FIRST_10K_FRAMES} from './FirstTenK';
import {FirstTenKVertical, FIRST_10K_V_FRAMES} from './FirstTenKVertical';
import {WhoTheyBecome, WTB_FRAMES} from './WhoTheyBecome';

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
    <Composition id="ObsessBuyer" component={ObsessBuyer} durationInFrames={OBSESS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ObsessBuyerMusicReady" component={ObsessBuyer} defaultProps={{music: 'none' as const}} durationInFrames={OBSESS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ThirdBuyer" component={ThirdBuyer} durationInFrames={THIRD_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ThirdBuyerMusicReady" component={ThirdBuyer} defaultProps={{music: 'none' as const}} durationInFrames={THIRD_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="WhoTheyBecome" component={WhoTheyBecome} durationInFrames={WTB_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="WhoTheyBecomeMusicReady" component={WhoTheyBecome} defaultProps={{music: 'none' as const}} durationInFrames={WTB_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FirstTenKVerticalGrid" component={FirstTenKVertical} defaultProps={{grid: true}} durationInFrames={FIRST_10K_V_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="FirstTenKVerticalPlain" component={FirstTenKVertical} defaultProps={{grid: false}} durationInFrames={FIRST_10K_V_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="FirstTenK" component={FirstTenK} durationInFrames={FIRST_10K_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FirstTenKMusicReady" component={FirstTenK} defaultProps={{music: 'none' as const}} durationInFrames={FIRST_10K_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="TwoMillionaires" component={TwoMillionaires} durationInFrames={TWO_MIL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="TwoMillionairesMusicReady" component={TwoMillionaires} defaultProps={{music: 'none' as const}} durationInFrames={TWO_MIL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Decoy" component={Decoy} durationInFrames={DECOY_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="DecoyMusicReady" component={Decoy} defaultProps={{music: 'none' as const}} durationInFrames={DECOY_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="LessTime" component={LessTime} durationInFrames={LESS_TIME_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="LessTimeMusicReady" component={LessTime} defaultProps={{music: 'none' as const}} durationInFrames={LESS_TIME_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="LineStyleTest" component={LineStyleTest} durationInFrames={LINE_TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="EveryMillionaire" component={EveryMillionaire} durationInFrames={EM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="EveryMillionaireMusicReady" component={EveryMillionaire} defaultProps={{music: 'none' as const}} durationInFrames={EM_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
