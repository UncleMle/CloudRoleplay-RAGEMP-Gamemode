import { BarberData } from "@/@types";

export default class Barber {
    public static LocalPlayer: PlayerMp = mp.players.local;
    
    constructor() {
        mp.events.add("c::barber:applyStyle", Barber.handleStyleChange);
    }

    private static handleStyleChange(data: string) {
        if(!data) return;

        try {
            let barber: BarberData = JSON.parse(data);

            Barber.LocalPlayer.setComponentVariation(2, parseInt(barber.hairStyle), 0, 0);
            Barber.LocalPlayer.setHairColor(parseInt(barber.hairColour), parseInt(barber.hairHighlights));
            Barber.LocalPlayer.setHeadOverlay(1, parseInt(barber.facialHairStyle), 1.0, parseInt(barber.facialHairColour), 0);
            Barber.LocalPlayer.setHeadOverlay(10, parseInt(barber.chestHairStyle), 1.0, 0, 0);
            Barber.LocalPlayer.setHeadOverlay(2, parseInt(barber.eyebrowsStyle), 1.0, parseInt(barber.eyebrowsColour), 0);
        } catch
        {
        }
    }
}