export default class BulletFragments {
    private static LocalPlayer: PlayerMp = mp.players.local;
    private static bulletCasingItems: Vector3[] = [];
    private static gameCam: CameraMp = mp.cameras.new("gameplay");
    private static readonly createFragmentArea: string = "server:bulletFragments:addNewBulletFragmentArea";

    constructor() {
        mp.events.add({
            "render": BulletFragments.handleRender,
            "playerWeaponShot": BulletFragments.handleWeaponShot,
            "client:bulletFragmentSystem:updateClientFrags": BulletFragments.setAllFragments,
            "client:bulletFragmentSystem:addOneFrag": BulletFragments.addOneMoreFrag
        });
    }

    private static addOneMoreFrag(oneFrag: string) {
        BulletFragments.bulletCasingItems.push(JSON.parse(oneFrag));
    }

    private static setAllFragments(serverFragments: string) {
        BulletFragments.bulletCasingItems = JSON.parse(serverFragments);
    }

    private static handleRender() {
        BulletFragments.bulletCasingItems.forEach(casing => {
            mp.game.graphics.drawText("Bullet Fragments #" + BulletFragments.bulletCasingItems.indexOf(casing), [casing.x, casing.y, casing.z], {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.4, 0.4]
            });
        });
    }

    private static handleWeaponShot() {
        let getHitCoord: RaycastResult = BulletFragments.getAimedAtRaycast();

        if (getHitCoord && getHitCoord.position) {
            mp.events.callRemote(BulletFragments.createFragmentArea, getHitCoord.position);
        }
    }


    private static getAimedAtRaycast() {
        let position: Vector3 = BulletFragments.gameCam.getCoord();
        let direction: Vector3 = BulletFragments.gameCam.getDirection();

        let farAway: Vector3 = new mp.Vector3((direction.x * 250) + (position.x), (direction.y * 250) + (position.y), (direction.z * 250) + (position.z));

        let getHittingData: RaycastResult = mp.raycasting.testPointToPoint(position, farAway, BulletFragments.LocalPlayer);

        return getHittingData;
    }
}