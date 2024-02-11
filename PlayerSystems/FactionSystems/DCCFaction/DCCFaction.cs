using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.DCCFaction
{
    public class DCCFaction : Script
    {
        #region Global Methods 
        #endregion

        #region Remote Events
        [RemoteEvent("server:dcc:phone:initApp")]
        public void getOnDutyCabDrivers(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            int cabDrivers = 0;

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                if(p.getPlayerCharacterData()?.faction_duty_status == (int)Factions.DCC)
                {
                    cabDrivers++; 
                }
            });

            uiHandling.handleObjectUiMutation(player, MutationKeys.DCCPhone, new DCCFactionUIData
            {
                onDutyMembers = cabDrivers,
                services = DCCServices.services
            });
        }

        [RemoteEvent("server:dcc:requestService")]
        public void requestDccService(Player player, string serviceName)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            KeyValuePair<AvailableServices, string> service = DCCServices.services.Where(serv => serv.Value == serviceName).FirstOrDefault();

            if (service.Value == null) return;

            if(FactionSystem.hasDispatchCall(player))
            {
                uiHandling.sendPushNotifError(player, "You already have an active service request. Use /cancelcall to cancel it.", 6600);
                return;
            }

            FactionSystem.addDispatchCall(player, Factions.DCC, $"requests {service.Value}");

            uiHandling.sendNotification(player, $"~g~Requested service {service.Value}.", false);
        }
        #endregion


        #region Commands
        #endregion
    }
}
