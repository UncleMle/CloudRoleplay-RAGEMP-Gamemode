using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.CustomEvents;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionSystem : Script
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

            foreach (KeyValuePair<Factions, List<Vector3>> area in onDutyAreas)
            {
                area.Value.ForEach(marker =>
                {
                    MarkersAndLabels.setTextLabel(marker, "Use ~y~Y~w~ to interact", 5f);
                    MarkersAndLabels.setPlaceMarker(marker, 0);
                });
            }
        }

        public void handleOnDuty(Player player)
        {
            foreach (KeyValuePair<Factions, List<Vector3>> area in onDutyAreas)
            {
                area.Value.ForEach(spot =>
                {
                    if (player.checkIsWithinCoord(spot, 2f)) onDutyAreaPress(player, area.Key);
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
