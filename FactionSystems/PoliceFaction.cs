using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.FactionSystems
{
    public class PoliceFaction : Script
    {
        [Command("m", "~y~Use:~w~ /megaphone [message]", GreedyArg = true)]
        public void megaphoneCommand(Player player, string message)
        {
            Vehicle vehicle = VehicleSystem.getClosestVehicleToPlayer(player, 4);
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;


            if (vehicle != null && vehicle.Class == 0 || player.IsInVehicle && player.Vehicle.Class == 0)
            {
                Console.WriteLine(NAPI.Vehicle.GetVehicleClass(player.Vehicle.Model) + player.Vehicle.Class);

                DbVehicle vehicleData = vehicle.getData();
                
                if (vehicleData != null)
                {
                    if(!player.IsInVehicle && !vehicleData.vehicle_doors[0])
                    {
                        CommandUtils.errorSay(player, "The vehicles driver side door must be open to use this command outside of a vehicle");
                        return;
                    }

                    List<Player> closePlayers = NAPI.Player.GetPlayersInRadiusOfPlayer(35f, player);

                    message = message.ToUpper();

                    player.SendChatMessage(characterData.character_name + ChatUtils.orange +" [MEGAPHONE] " + ChatUtils.grey + "says:" + ChatUtils.White + " " + message);

                    closePlayers.ForEach(targetP =>
                    {
                        if (!player.Equals(targetP))
                        {
                            string suffix = ChatUtils.orange+" [MEGAPHONE] " + ChatUtils.grey + " says: " + ChatUtils.White + message;
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
    }
}
