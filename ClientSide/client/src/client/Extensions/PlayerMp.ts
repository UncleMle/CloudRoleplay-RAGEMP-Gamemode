import { _sharedAccountDataIdentifier } from "@/Constants/Constants";

export default class PlayerMpExtensions {
  public static PlayerMp: PlayerMp;

  constructor() {
    PlayerMpExtensions.PlayerMp.testMethod = () => {
      return PlayerMpExtensions.PlayerMp.getVariable(_sharedAccountDataIdentifier);
    }
  }
}