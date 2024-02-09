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
        public static Dictionary<int, ServiceData> activeServiceRequests = new Dictionary<int, ServiceData>();

        #region Global Methods 
        public static ServiceData getPlayersService(int characterId)
            => activeServiceRequests
            .Where(req => req.Key == characterId)
            .FirstOrDefault().Value;
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
                activeService = getPlayersService(character.character_id),
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

            if(getPlayersService(character.character_id) != null)
            {
                uiHandling.sendPushNotifError(player, "You already have an active service request. Use /cancelservice to cancel it.", 6600);
                return;
            }

            activeServiceRequests.Add(character.character_id, new ServiceData
            {
                createdAt = CommandUtils.generateUnix(),
                service = service.Key
            });

            uiHandling.sendNotification(player, $"~g~Requested service {service.Value}.", false);
        }
        #endregion


        #region Commands 
        [Command("cancelservice", "~y~Use: ~w~/cancelservice")]
        public void cancelTaxiServiceCommand(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            ServiceData service = getPlayersService(character.character_id);

            if (service != null)
            {
                activeServiceRequests.Remove(character.character_id);
                CommandUtils.successSay(player, "You have cancelled your taxi service request.");
            } else
            {
                CommandUtils.errorSay(player, "You don't have an active service.");
            }
        }
        #endregion
    }
}
