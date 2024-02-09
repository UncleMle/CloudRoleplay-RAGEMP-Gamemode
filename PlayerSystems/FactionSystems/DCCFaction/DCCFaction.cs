using CloudRP.PlayerSystems.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.DCCFaction
{
    public class DCCFaction : Script
    {
        #region Remote Events
        [RemoteEvent("server:dcc:phone:initApp")]
        public void getOnDutyCabDrivers(Player player)
        {
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
        #endregion

    }
}
