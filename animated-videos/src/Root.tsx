import {Composition} from 'remotion';
import {BuyersMind2D} from './TwoD';
import {BuyersMind3D} from './ThreeD';
import {TwoSellers, TWO_SELLERS_FRAMES} from './TwoSellers';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BuyersMind2D" component={BuyersMind2D} durationInFrames={600} fps={30} width={1080} height={1920} />
    <Composition id="BuyersMind3D" component={BuyersMind3D} durationInFrames={480} fps={30} width={1080} height={1920} />
    <Composition id="TwoSellers" component={TwoSellers} durationInFrames={TWO_SELLERS_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
