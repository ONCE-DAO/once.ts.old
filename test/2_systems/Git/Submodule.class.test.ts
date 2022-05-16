import OnceNodeServer from "../../../src/2_systems/Once/OnceNodeServer.class";
import DefaultSubmodule from "../../../src/2_systems/Git/Submodule.class";

beforeEach(async () => {
  if (ONCE_STARTED === false) await OnceNodeServer.start();
});

test("getDistPath", async () => {
  //TODO create mocked submodule
  const subModule = await DefaultSubmodule.getInstance().init({
    path: "Components/tla/EAM/once.ts/dev/once.ts@main",
  });
  expect(subModule.distPath.match("/EAMD.ucp/Components/tla/EAM/once.ts/dev/once.ts")).toBeTruthy();
});
