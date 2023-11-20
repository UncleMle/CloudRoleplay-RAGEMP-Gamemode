using CloudRP.Authentication;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Xml.Linq;
using static CloudRP.Authentication.Account;

namespace CloudRP.Admin
{
    internal class AdminSystem : Script
    {

        [Command("aduty")]
        public void onAduty(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData != null && userData.adminLevel > (int)AdminRanks.Admin_SeniorSupport)
            {
                userData.adminDuty = !userData.adminDuty;

                if (userData.adminDuty)
                {
                    AdminUtils.sendMessageToAllStaff($"{AdminUtils.staffPrefix} {userData.adminName} is on duty");
                }
                else
                {
                    AdminUtils.sendMessageToAllStaff($"{AdminUtils.staffPrefix} {userData.adminName} is off duty");
                }

                PlayersData.setPlayerAccountData(player, userData);

            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("staff")]
        public void staff(Player player)
        {
            int index = 0;
            foreach (var item in AdminUtils.gatherStaff())
            {
                index++;
                User user = item.Value;
                string duty = user.adminDuty ? "[!{green}On-Duty!{white}]" : "[!{red}Off-Duty!{white}]";

                NAPI.Chat.SendChatMessageToPlayer(player, index + $". {user.username} {duty}");
            }
        }

        [Command("client", "~r~/client [ename]")]
        public void eventTrigger(Player player, string eventName)
        {
            if (eventName == null) return;

            if (PlayersData.getPlayerAccountData(player).adminLevel > 7)
            {
                player.TriggerEvent(eventName);
                AdminUtils.staffSay(player, $"Triggered clientside event {eventName}");
            }
        }

        [Command("a", "~r~/adminchat [message]", GreedyArg = true, Alias = "adminchat")]
        public void adminChat(Player player, string message)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            if (userData.adminLevel > 0)
            {
                Dictionary<Player, User> onlineAdmins = AdminUtils.gatherStaff();

                string colouredAdminRank = AdminUtils.getColouredAdminRank(userData);

                foreach (KeyValuePair<Player, User> entry in onlineAdmins)
                {
                    User staff = entry.Value;

                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, "!{red}" + $"[AdminChat] " + "!{white}" + colouredAdminRank + staff.adminName + " !{grey}says:!{white} " + message);
                }
            }

        }

        [Command("veh", "~r~/veh [vehName]")]
        public void spawnVehicle(Player player, string vehName)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin || userData.adminLevel > (int)AdminRanks.Admin_SeniorAdmin && userData.adminDuty)
            {
                Vector3 playerPosition = player.Position;
                float playerRotation = player.Rotation.Z;

                uint vehicleHash = NAPI.Util.GetHashKey(vehName);
                Vehicle veh = NAPI.Vehicle.CreateVehicle(vehicleHash, playerPosition, playerRotation, 255, 255, "ADMIN", 255, false, true, 0);

                DbVehicle vehicleInsert = new DbVehicle
                {
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now,
                    owner_id = userData.accountId,
                    position_x = playerPosition.X,
                    position_y = playerPosition.Y,
                    position_z = playerPosition.Z,
                    rotation = playerRotation,
                    vehicle_spawn_hash = vehicleHash,
                    vehicle_name = vehName
                };

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.vehicles.Add(vehicleInsert);
                    dbContext.SaveChanges();
                }

                player.SetIntoVehicle(veh, 0);

                AdminUtils.staffSay(player, $"Spawned in vehicle {vehName}");
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("bringv", "~r~/bringv [vehicleId]")]
        public void bringVehicle(Player player, int vehicleId)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData.adminLevel > (int)AdminRanks.Admin_SeniorSupport && userData.adminDuty || userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin)
            {
                Vehicle findVehicleById = VehicleSystem.findVehicleById(vehicleId);

                if(findVehicleById == null)
                {
                    AdminUtils.staffSay(player, $"No vehicle with ID {vehicleId} was found.");
                    return;
                }

                VehicleSystem.bringVehicleToPlayer(player, findVehicleById, true);

                AdminUtils.staffSay(player, $"Brought vehicle with ID {vehicleId}");
            }
        }
    }
}
