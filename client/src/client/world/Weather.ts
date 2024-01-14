export default class Weather {
    public static LocalPlayer: PlayerMp = mp.players.local;

    constructor() {
        mp.events.add("client:weatherSet", Weather.handleWeatherChange);
    }

    private static handleWeatherChange(weatherType: string) {
        mp.game.gameplay.setWeatherTypeOverTime(weatherType, 0);
    }
}