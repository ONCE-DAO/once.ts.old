import { BaseOnce } from "./BaseOnce.class";

export abstract class BaseNodeOnce extends BaseOnce {
  constructor() {
    super(global);
    this.ENV = process.env;
  }
}
