using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionSystem
    {
        public delegate void FactionSystemEventsHandler(Player player, Factions faction);
        public static event FactionSystemEventsHandler onDutyAreaPress;
        
        public static Dictionary<Factions, List<Vector3>> onDutyAreas = new Dictionary<Factions, List<Vector3>>
        {
            {
                Factions.LSPD, new List<Vector3>
                {
                    new Vector3(452.0, -987.0, 30.7)
                }
            }
        };

        public FactionSystem()
        {
            KeyPressEvents.keyPress_Y += handleOnDuty;
        }

        public void handleOnDuty(Player player)
        {
            foreach (KeyValuePair<Factions, List<Vector3>> item in onDutyAreas)
            {
                item.Value.ForEach(spot =>
                {
                    if (player.checkIsWithinCoord(spot, 2f)) onDutyAreaPress(player, item.Key);
                });
            }
        }

    }

    public enum Factions
    {
        None,
        LSPD,
        SASD,
        LSMD,
        Weazel
    }
}
