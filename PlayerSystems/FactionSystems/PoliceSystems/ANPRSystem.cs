using CloudRP.GeneralSystems.SpeedCameras;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;

namespace CloudRP.PlayerSystems.FactionSystems.PoliceSystems
{
    public class ANPRSystem : Script
    {
        public static Dictionary<int, DbVehicle> stolenVehicles = new Dictionary<int, DbVehicle>();
        private static SpeedCamera lastTriggered = null;

        public ANPRSystem()
        {
            SpeedCameras.onVehiclePassByCamera += handleRecognition;
        }

        private static void handleRecognition(Player player, Vehicle vehicle, DbVehicle vehicleData, string camName, int speed)
        {
            if(stolenVehicles.ContainsKey(vehicleData.vehicle_id))
            {
                lastTriggered = SpeedCameras.cameras.Where(cam => cam.camName == camName)?
                    .FirstOrDefault();

                FactionSystem.sendMessageToOndutyFactionMembers($"{ChatUtils.anpr} stolen vehicle {vehicleData.vehicle_display_name} [{vehicleData.numberplate}] triggered camera {camName} travelling at {speed.ToString("N0")}KM/H. {(lastTriggered != null ? "Use /getlastanpr to get location." :"")}", Factions.LSPD);
            }
        }

        [Command("getlastanpr", "~y~Use:~w~ /getlastanpr")]
        public void getLastAnprTriggeredCommand(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character is null) return;

            if(character.faction_duty_status != (int)Factions.LSPD)
            {
                CommandUtils.errorSay(player, $"You must be part of the LSPD faction in order to use this command.");
                return;
            }

            if(lastTriggered is null) {
                CommandUtils.errorSay(player, "There is no current last triggered ANPR alert.");
                return;
            }

            MarkersAndLabels.setClientWaypoint(player, lastTriggered.position);
            player.SendChatMessage(ChatUtils.anpr + $"The ANPR camera position for camera {lastTriggered.camName} has been marked on your GPS as a waypoint.");
        }

    }
}
