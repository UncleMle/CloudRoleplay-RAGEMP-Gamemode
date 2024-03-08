export default class Weather {
    public static LocalPlayer: PlayerMp = mp.players.local;

    constructor() {
        mp.events.add("client:weatherSet", Weather.handleWeatherChange);
        
        // Weather.updateLightStates();
    }

    private static updateLightStates() {
        for (let i = 0; i <= 16; i++) {
            mp.game.graphics.setLightsState(i, true);
        }
    }

    private static handleWeatherChange(weatherType: string) {
        mp.game.gameplay.setWeatherTypeOverTime(weatherType, 0);
    }
}