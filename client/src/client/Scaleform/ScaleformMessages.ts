export default class ScaleForm {
    public static LocalPlayer: PlayerMp
    public static midsizedMessageScaleform: BasicScaleform | null = null;
    public static msgInit: number = 0;
    public static msgDuration: number = 5000;
    public static msgAnimatedOut: boolean = false;
    public static msgBgColor: number = 0;
    public static bigMessageScaleform: BasicScaleform | null = null;
    public static bigMsgInit = 0;
    public static bigMsgDuration = 5000;
    public static bigMsgAnimatedOut = false;

    constructor() {
        mp.events.add("ShowMidsizedMessage", ScaleForm.showMidsizedScaleform);
        mp.events.add("ShowMidsizedShardMessage", ScaleForm.showMidsizedScaleform);
        mp.events.add("ShowWeaponPurchasedMessage", ScaleForm.showWeaponPurchaseMessage);
        mp.events.add("ShowPlaneMessage", ScaleForm.showPlaneMessage);
        mp.events.add("ShowShardMessage", ScaleForm.showShardMessage);

        mp.events.add("render", ScaleForm.handleRender);
    }

    public static handleRender() {
        if (ScaleForm.midsizedMessageScaleform != null) {
            ScaleForm.midsizedMessageScaleform.renderFullscreen();

            if (ScaleForm.msgInit > 0 && Date.now() - ScaleForm.msgInit > ScaleForm.msgDuration) {
                if (!ScaleForm.msgAnimatedOut) {
                    ScaleForm.midsizedMessageScaleform.callFunction("SHARD_ANIM_OUT", ScaleForm.msgBgColor);
                    ScaleForm.msgAnimatedOut = true;
                    ScaleForm.msgDuration += 750;
                } else {
                    ScaleForm.msgInit = 0;
                    ScaleForm.midsizedMessageScaleform.dispose();
                    ScaleForm.midsizedMessageScaleform = null;
                }
            }
        }

        if (ScaleForm.bigMessageScaleform != null) {
            ScaleForm.bigMessageScaleform.renderFullscreen();

            if (ScaleForm.bigMsgInit > 0 && Date.now() - ScaleForm.bigMsgInit > ScaleForm.bigMsgDuration) {
                if (!ScaleForm.bigMsgAnimatedOut) {
                    ScaleForm.bigMessageScaleform.callFunction("TRANSITION_OUT");
                    ScaleForm.bigMsgAnimatedOut = true;
                    ScaleForm.bigMsgDuration += 750;
                } else {
                    ScaleForm.bigMsgInit = 0;
                    ScaleForm.bigMessageScaleform.dispose();
                    ScaleForm.bigMessageScaleform = null;
                }
            }
        }
    }

    public static showWeaponPurchaseMessage(title: string, weaponName: string, weaponHash: string, time: number = 5000) {
        if (ScaleForm.bigMessageScaleform == null) ScaleForm.bigMessageScaleform = new BasicScaleform("mp_big_message_freemode");
        ScaleForm.bigMessageScaleform.callFunction("SHOW_WEAPON_PURCHASED", title, weaponName, weaponHash);

        ScaleForm.bigMsgInit = Date.now();
        ScaleForm.bigMsgDuration = time;
        ScaleForm.bigMsgAnimatedOut = false;
    }

    public static showPlaneMessage(title: string, planeName: string, planeHash: string, time: number = 5000) {
        if (ScaleForm.bigMessageScaleform == null) ScaleForm.bigMessageScaleform = new BasicScaleform("mp_big_message_freemode");
        ScaleForm.bigMessageScaleform.callFunction("SHOW_PLANE_MESSAGE", title, planeName, planeHash);

        ScaleForm.bigMsgInit = Date.now();
        ScaleForm.bigMsgDuration = time;
        ScaleForm.bigMsgAnimatedOut = false;
    }

    public static showShardMessage(title: string, message: string, titleColor: string, bgColor: number, time = 5000) {
        if (ScaleForm.bigMessageScaleform == null) ScaleForm.bigMessageScaleform = new BasicScaleform("mp_big_message_freemode");
        ScaleForm.bigMessageScaleform.callFunction("SHOW_SHARD_CENTERED_MP_MESSAGE", title, message, titleColor, bgColor);
        ScaleForm.bigMsgInit = Date.now();
        ScaleForm.bigMsgDuration = time;
        ScaleForm.bigMsgAnimatedOut = false;
    }

    public static showMidsizedScaleform(title: string, message: string, time: number = 5000) {
        if (ScaleForm.midsizedMessageScaleform == null) ScaleForm.midsizedMessageScaleform = new BasicScaleform("midsized_message");
        ScaleForm.midsizedMessageScaleform.callFunction("SHOW_MIDSIZED_MESSAGE", title, message);

        ScaleForm.msgInit = Date.now();
        ScaleForm.msgDuration = time;
        ScaleForm.msgAnimatedOut = false;
    }

    public static showMidsizedShard(title: string, message: string, bgColor: number, useDarkerShard: boolean, condensed: boolean, time: number = 5000) {
        if (ScaleForm.midsizedMessageScaleform == null) ScaleForm.midsizedMessageScaleform = new BasicScaleform("midsized_message");
        ScaleForm.midsizedMessageScaleform.callFunction("SHOW_SHARD_MIDSIZED_MESSAGE", title, message, bgColor, useDarkerShard, condensed);

        ScaleForm.msgInit = Date.now();
        ScaleForm.msgDuration = time;
        ScaleForm.msgAnimatedOut = false;
        ScaleForm.msgBgColor = bgColor;
    }

    public static isActive(): boolean | number {
        return BasicScaleform.handle && mp.game.graphics.hasScaleformMovieLoaded(BasicScaleform.handle);
    }
}


class BasicScaleform {
    public static handle: number;

    constructor(scaleformName: string) {
        BasicScaleform.handle = mp.game.graphics.requestScaleformMovie(scaleformName);
        while (!mp.game.graphics.hasScaleformMovieLoaded(BasicScaleform.handle)) mp.game.wait(0);
    }

    callFunction(functionName: string, ...args: any[]) {
        mp.game.graphics.pushScaleformMovieFunction(BasicScaleform.handle, functionName);

        args.forEach(arg => {
            switch(typeof arg) {
                case "string": {
                    mp.game.graphics.pushScaleformMovieFunctionParameterString(arg);
                    break;
                }

                case "boolean": {
                    mp.game.graphics.pushScaleformMovieFunctionParameterBool(arg);
                    break;
                }

                case "number": {
                    if(Number(arg) === arg && arg % 1 !== 0) {
                        mp.game.graphics.pushScaleformMovieFunctionParameterFloat(arg);
                    } else {
                        mp.game.graphics.pushScaleformMovieFunctionParameterInt(arg);
                    }
                }
            }
        });

        mp.game.graphics.popScaleformMovieFunctionVoid();
    }

    renderFullscreen() {
        mp.game.graphics.drawScaleformMovieFullscreen(BasicScaleform.handle, 255, 255, 255, 255, -1);
    }

    dispose() {
        mp.game.graphics.setScaleformMovieAsNoLongerNeeded(BasicScaleform.handle);
    }
}