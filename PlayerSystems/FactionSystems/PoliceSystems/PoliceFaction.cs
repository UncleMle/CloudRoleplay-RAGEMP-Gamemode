﻿using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.PoliceFaction
{
    public class PoliceFaction : Script
    {
        #region Global Methods 
        #endregion

        #region Remote Events
        #endregion

        #region Commands
        [Command("m", "~y~Use:~w~ /megaphone [message]", GreedyArg = true)]
        public void megaphoneCommand(Player player, string message)
        {
            Vehicle vehicle = VehicleSystem.getClosestVehicleToPlayer(player, 4);
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;

            if (vehicle != null || player.IsInVehicle)
            {
                DbVehicle vehicleData = vehicle.getData();

                if (vehicleData != null)
                {
                    if (!FactionSystem.emergencyFactions.Contains((Factions)vehicleData.faction_owner_id)) return;

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
