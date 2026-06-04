import { Composition } from "remotion";
import { MentalHealthVideo } from "./MentalHealthVideo";
import { SwooshTest } from "./SwooshTest";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MentalHealthVideo"
        component={MentalHealthVideo}
        durationInFrames={480}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SwooshTest"
        component={SwooshTest}
        durationInFrames={75}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ file: "swoosh-soft.mp3", label: "swoosh" }}
      />
    </>
  );
};
