using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.PoliceFaction
{
    public class PoliceFaction : Script
    {
        private static List<string> allowedVehicles = new List<string>();
        public static Dictionary<string, Vector3> policePrecincts = new Dictionary<string, Vector3>
        {
            {
                "Mission Row - PD", new Vector3(451.8, -981.4, 43.7)
            }
        };

        public PoliceFaction()
        {
            Main.resourceStart += () =>
            {
                allowedVehicles = FactionSystem.loadFactionVehicles(Factions.LSPD);
            };

            FactionSystem.onDutyAreaPress += (player, faction) =>
            {
                if(faction.Equals(Factions.LSPD) && player.getPlayerFactions()?.Contains(faction) != null)
                {
                    handleDutySelection(player);
                }
            };

            foreach (KeyValuePair<string, Vector3> item in policePrecincts)
            {
                NAPI.Blip.CreateBlip(60, item.Value, 1f, 4, item.Key, 255, 1f, true, 0, 0);
            }
        }

        #region Global Methods 
        private static void handleDutySelection(Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            character.faction_duty_status = (int)Factions.LSPD;


            player.setPlayerCharacterData(character, false, true);
        }
        #endregion

        #region Commands
        [Command("m", "~y~Use:~w~ /megaphone [message]", GreedyArg = true)]
        public void megaphoneCommand(Player player, string message)
        {
            Vehicle vehicle = VehicleSystem.getClosestVehicleToPlayer(player, 4);
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;


            if (vehicle != null && vehicle.Class == 0 || player.IsInVehicle && player.Vehicle.Class == 0)
            {
                DbVehicle vehicleData = vehicle.getData();

                if (vehicleData != null)
                {
                    if (!player.IsInVehicle && !vehicleData.vehicle_doors[0])
                    {
                        CommandUtils.errorSay(player, "The vehicles driver side door must be open to use this command outside of a vehicle");
                        return;
                    }

                    List<Player> closePlayers = NAPI.Player.GetPlayersInRadiusOfPlayer(35f, player);

                    message = message.ToUpper();

                    player.SendChatMessage(characterData.character_name + ChatUtils.orange + " [MEGAPHONE] " + ChatUtils.grey + "says:" + ChatUtils.White + " " + message);

                    closePlayers.ForEach(targetP =>
                    {
                        if (!player.Equals(targetP))
                        {
                            string suffix = ChatUtils.orange + " [MEGAPHONE] " + ChatUtils.grey + " says: " + ChatUtils.White + message;
                            ChatUtils.sendWithNickName(targetP, player, "", suffix);
                        }
                    });
                }
                else
                {
                    CommandUtils.errorSay(player, "The vehicle must be unlocked for you to use this command.");
                }
            }
            else
            {
                CommandUtils.errorSay(player, "You must be in or near a police vehicle to use this command.");
            }
        }
        #endregion
    }
}
