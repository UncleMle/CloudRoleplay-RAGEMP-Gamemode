import { Corpse } from '@/@types';
import CharacterSystem from '@/Character/CharacterSystem';
import Clothing from '@/Character/Clothing';
import getTimeUnix from '@/PlayerMethods/getTimeUnix';

class Corpses {
	public static LocalPlayer: PlayerMp;
	public static corpseKey: string = 'sync:corpsePed';
	public static corpseValEvent: string = 'sync:corpseValidation';
	public static corpses: Corpse[] = [];
	public static _pedTimeout_seconds: number = 300;

	constructor() {
		Corpses.LocalPlayer = mp.players.local;

		mp.events.add('entityStreamIn', Corpses.handleStreamIn);
		mp.events.add('corpse:add', Corpses.addCorpsePed);
		mp.events.add('corpse:removeCorpse', Corpses.spliceCorpsePed);

        setInterval(() => {
			mp.peds.forEachInStreamRange((ped) => {
				let corpseData: Corpse | undefined = Corpses.corpses.find(corpse => corpse.corpseId == ped.corpseId);
				if (!corpseData) return;

                Corpses.initPed(ped, corpseData);
				if ((getTimeUnix() - corpseData.unixCreated) > Corpses._pedTimeout_seconds) {
					mp.events.callRemote(Corpses.corpseValEvent, corpseData.corpseId);
				}
			});
		}, 5000);
	}

	public static renderCorpses() {
		mp.peds.forEachInStreamRange(ped => {
			if(ped.corpseId !== undefined) {
				if(Corpses.corpses[ped.corpseId]) {
					let rootBone: Vector3 = ped.getBoneCoords(0, 0, 0, 0);

					let rootDrawCoords: { x: number, y: number } = mp.game.graphics.world3dToScreen2d(new mp.Vector3(rootBone.x, rootBone.y, rootBone.z));

					mp.game.graphics.drawText(`Corpse ID  ${ped.corpseId} handle ${ped.handle}`, [rootDrawCoords.x, rootDrawCoords.y], {
						font: 4,
						color: [255, 255, 255, 185],
						scale: [0.3, 0.3],
						outline: true
					});
				}
			}
		});
	}

	public static async handleStreamIn(entity: PedMp) {
        if (entity.type != 'ped') return;

        let corpseData: Corpse | null = Corpses.getCorpseData(entity.corpseId);
        if (!corpseData) return;

        Corpses.initPed(entity, corpseData);
        Corpses.disableVehCollision(entity);
	}

	public static disableVehCollision(entity: PedMp) {
		mp.vehicles.forEachInStreamRange((veh) => {
			veh.setNoCollision(entity.handle, true);
		});
	}

	public static addCorpsePed(corpse: Corpse) {
		mp.console.logInfo("Corpse " + JSON.stringify(corpse));
		let corpseData: Corpse = corpse;
		let ped: PedMp = mp.peds.new(
			mp.game.joaat(corpse.model.sex ? 'mp_m_freemode_01' : 'mp_f_freemode_01'),
			new mp.Vector3(corpse.position.x, corpse.position.y, corpse.position.z),
			0,
			0
		);

		Corpses.corpses.push(corpse);

		ped.corpseId = corpse.corpseId;
		ped.corpseCharacterId = corpse.characterId;
		ped.taskPlayAnim('dead', 'dead_a', 8.0, 0, 600, 1, 1.0, false, false, false);

		Corpses.initPed(ped, corpseData);
	}

	public static spliceCorpsePed(corpseId: number) {
		let findCorpse: Corpse | undefined = Corpses.corpses.find(cor => cor.corpseId == corpseId);

		if(findCorpse) {
			Corpses.corpses.splice(Corpses.corpses.indexOf(findCorpse), 1);
		}

		mp.peds.forEach((ped: PedMp) => {
			if (corpseId == ped.corpseId) {
				ped.destroy();
			}
		});
	}

	public static getCorpseData(corpseId: number): Corpse | null {
		let corpseData: Corpse | null = null;

		Corpses.corpses.forEach((corpse: Corpse) => {
			if (corpse.corpseId == corpseId) {
				corpseData = corpse;
			}
		});

		return corpseData;
	}

	public static initPed(ped: PedMp, corpseData: Corpse) {
		if (ped.handle == 0 || !corpseData) return;

		ped.freezePosition(true);
		ped.setInvincible(true);
		ped.setProofs(false, false, false, false, false, false, false, false);
		ped.taskPlayAnim('dead', 'dead_a', 8.0, 0, 600, 1, 1.0, false, false, false);

		Clothing.setClothingData(corpseData.clothes, false, true, ped);
		CharacterSystem.setCharacterCustomization(corpseData.model, false, ped);
	}
}

export default Corpses;
