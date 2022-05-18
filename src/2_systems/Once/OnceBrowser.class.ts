import Once, { OnceMode, OnceState } from "../../3_services/Once.interface";
import { BaseOnce } from "../../1_infrastructure/BaseOnce.class";

export default class OnceBrowser extends BaseOnce implements Once {

  init(...a: any[]) {
    throw new Error("Method not implemented.");
  }
  mode = OnceMode.BROWSER;
  state = OnceState.DISCOVER_SUCCESS;
  creationDate: Date = new Date();;

  private constructor() {
    super(window);
  }

  async start(): Promise<Once> {
    return this;
  }

  static async start(): Promise<Once> {

    console.log("ONCE STARTED AS NODE_JS");
    const once = new this();

    return once;
  }

}
