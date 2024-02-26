using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.FactionSystems.PoliceSystems;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.WorldSystems.RaycastInteractions;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.PoliceFaction
{
    public class PoliceSystem : Script
    {
        public List<Vector3> receptionDesks = new List<Vector3>
        {
            new Vector3(441.1, -981.0, 30.7),
            new Vector3(-447.8, 6013.7, 31.7)
        };

        public PoliceSystem()
        {
            receptionDesks.ForEach(desk =>
            {
                RaycastInteractionSystem.raycastPoints.Add(new RaycastInteraction
                {
                    menuTitle = "Police Reception Desk",
                    raycastMenuItems = new string[] { "View active fines" },
                    raycastMenuPosition = desk,
                    targetMethod = resyncFinesUiData
                });
            });

            Main.resourceStart += () => ChatUtils.startupPrint($"Loaded in {receptionDesks.Count} police reception desks.");
        }

        #region Global Methods
        private void resyncFinesUiData(Player player, string rayOption = null)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            uiHandling.pushRouterToClient(player, Browsers.FineMenu, true);
            uiHandling.resetMutationPusher(player, MutationKeys.CriminalCharges);

            List<CriminalCharge> fines = character.criminalCharges.Where(charge => charge.totalTime == 0).ToList();

            fines.ForEach(fine =>
            {
                uiHandling.handleObjectUiMutationPush(player, MutationKeys.CriminalCharges, new CriminalChargeUiData
                {
                    chargeId = fine.criminal_charge_id,
                    charges = CriminalCharges.convertChargeIdListToCharges(JsonConvert.DeserializeObject<int[]>(fine.criminal_charge_ids)),
                    totalFine = fine.totalFine
                });
            });
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:policeSystems:handleFinePay")]
        public void handleFinePay(Player player, int fineId)
        {
            if (receptionDesks.Where(desk => player.checkIsWithinCoord(desk, 2f)).FirstOrDefault() == null) return;

            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            CriminalCharge charge = character.criminalCharges.Where(charge => charge.criminal_charge_id == fineId).FirstOrDefault();

            if(charge == null) return;  

            if((character.money_amount - charge.totalFine) < 0)
            {
                uiHandling.sendPushNotifError(player, "You don't have enough to pay for this fine.", 6600);
                return;
            }

            character.money_amount -= charge.totalFine;
            player.setPlayerCharacterData(character, false, true);

            CriminalChargeSystem.removePlayerCharge(character.character_id, fineId);

            player.SendChatMessage(ChatUtils.Success + $"You paid off a fine totalling {charge.totalFine}");

            resyncFinesUiData(player);
        }
        #endregion
    }
}
