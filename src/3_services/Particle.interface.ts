import { UcpModelChangelog } from "./UcpModel.interface";
import Wave from "./Wave.interface";

export default interface Particle {
    id: string;
    predecessorId: string | undefined;
    changelog: UcpModelChangelog,
    modelSnapshot: any,
    waveList: Wave[],
    addChange(ChangeLog: Wave): void;

}