using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using CloudRP.Vehicles;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Xml.Linq;
using static CloudRP.Authentication.Account;

namespace CloudRP.Admin
{
    internal class AdminSystem : Script
    {
        [ServerEvent(Event.PlayerConnected)]
        public void playerConnected(Player player)
        {
            Ban checkIsBanned = AdminUtils.checkPlayerIsBanned(player);

            if (checkIsBanned != null)
            {
                AdminUtils.setPlayerToBanScreen(player, checkIsBanned);
            }

        }

        [Command("aduty")]
        public void onAduty(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData != null && userData.adminLevel > (int)AdminRanks.Admin_SeniorSupport)
            {
                userData.adminDuty = !userData.adminDuty;

                if (userData.adminDuty)
                {
                    AdminUtils.sendMessageToAllStaff($"{userData.adminName} is on duty");
                    AdminUtils.setPed(player, userData.adminPed);
                }
                else
                {
                    AdminUtils.setPed(player, "mp_m_freemode_01");

                    AdminUtils.sendMessageToAllStaff($"{userData.adminName} is off duty");
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
                string adminRank = AdminUtils.getColouredAdminRank(user);
                string duty = user.adminDuty ? "[!{green}On-Duty!{white}]" : "[!{red}Off-Duty!{white}]";

                
                AdminUtils.staffSay(player, index + $". {user.adminName} {adminRank} {duty}");
            }
        }

        [Command("a", "~r~/adminchat [message]", GreedyArg = true, Alias = "adminchat")]
        public void adminChat(Player player, string message)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData.adminLevel > (int)AdminRanks.Admin_None)
            {
                Dictionary<Player, User> onlineAdmins = AdminUtils.gatherStaff();

                string colouredAdminRank = AdminUtils.getColouredAdminRank(userData);

                foreach (KeyValuePair<Player, User> entry in onlineAdmins)
                {
                    User staff = entry.Value;

                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, "!{red}" + $"[AdminChat] " + "!{white}" + colouredAdminRank + staff.adminName + " !{grey}says:!{white} " + message);

                    userData.isFlying = false;

                    PlayersData.setPlayerAccountData(player, userData);
                    player.TriggerEvent("admin:endFly");
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

                Vehicle vehicleBuild = VehicleSystem.buildVehicle(vehName, playerPosition, playerRotation, userData.accountId);

                if (vehicleBuild == null) return;

                player.SetIntoVehicle(vehicleBuild, 0);

                AdminUtils.staffSay(player, $"Spawned in vehicle {vehName}");
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("bringv", "~r~/bringv [vehicleId]", Alias = "vbring")]
        public void bringVehicle(Player player, int vehicleId)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData.adminLevel > (int)AdminRanks.Admin_SeniorSupport && userData.adminDuty || userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    DbVehicle findVehicleById = dbContext.vehicles.Find(vehicleId);

                    if (findVehicleById == null)
                    {
                        AdminUtils.staffSay(player, $"No vehicle with ID {vehicleId} was found.");
                        return;
                    }

                    Vehicle spawnedVehicle = null;

                    if(findVehicleById.vehicle_dimension != VehicleDimensions.World)
                    {
                        spawnedVehicle = VehicleSystem.spawnVehicle(findVehicleById);
                    } else
                    {
                        List<Vehicle> onlineVehicles = NAPI.Pools.GetAllVehicles();
                        
                        foreach(Vehicle vehicle in onlineVehicles)
                        {
                            DbVehicle vehicleData = VehicleSystem.getVehicleData(vehicle);

                            if(vehicleData != null && vehicleData.vehicle_id == vehicleId)
                            {
                                spawnedVehicle = vehicle;
                            } 
                        }
                    }

                    if(spawnedVehicle != null)
                    {
                        VehicleSystem.bringVehicleToPlayer(player, spawnedVehicle, true);

                        AdminUtils.staffSay(player, $"Brought vehicle with ID {vehicleId}");

                    }
                }
            }
        }

        [Command("fly", "~r~/fly")]
        public void fly(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (AdminUtils.checkUserData(player, userData))
            {
                userData.isFlying = !userData.isFlying;

                if (userData.isFlying)
                {
                    AdminUtils.staffSay(player, $"Enabled fly");
                    player.TriggerEvent("admin:startFly");
                }
                else
                {
                    AdminUtils.staffSay(player, $"Disabled fly");
                    player.TriggerEvent("admin:endFly");
                }

                PlayersData.setPlayerAccountData(player, userData);
            }
        }

        [Command("freeze", "~r~/freeze [nameOrId]")]
        public void freezePlayer(Player player, string nameOrId)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (AdminUtils.checkUserData(player, userData))
            {
                Player getPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (getPlayer != null)
                {
                    User targetPlayerData = PlayersData.getPlayerAccountData(getPlayer);

                    if (targetPlayerData.isFlying || targetPlayerData.adminDuty)
                    {
                        CommandUtils.errorSay(player, "You cannot freeze a player that is flying or in admin duty.");
                        return;
                    }

                    targetPlayerData.isFrozen = targetPlayerData.isFrozen = !targetPlayerData.isFrozen;
                    string isFrozen = targetPlayerData.isFrozen ? "froze" : "unfroze";

                    PlayersData.setPlayerAccountData(getPlayer, targetPlayerData);

                    if (!targetPlayerData.isFrozen)
                    {
                        getPlayer.TriggerEvent("admin:events:stopFly");
                    }

                    AdminUtils.staffSay(player, $"You {isFrozen} {targetPlayerData.username}");
                    AdminUtils.staffSay(getPlayer, $"You were {isFrozen + "n"} by Admin {userData.adminName}");
                }


            }
        }

        [Command("tpm", "~r~/tpm")]
        public void onTeleportToWay(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (AdminUtils.checkUserData(player, userData))
            {
                player.TriggerEvent("admin:events:teleportWay");
                AdminUtils.staffSay(player, "Teleported to waypoint");
            }
        }

        [Command("delv", "~r~/delv [vehicleId]")]
        public void delV(Player player, int vehicleId)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin)
            {
                bool delVehicle = VehicleSystem.deleteVehicleById(vehicleId);

                if (delVehicle)
                {
                    AdminUtils.staffSay(player, $"Vehicle with id {vehicleId} deleted .");
                } else
                {
                    AdminUtils.staffSay(player, $"Vehicle with id {vehicleId} was not found.");
                }

            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("gcv", "~r~/gcv [Vehicle ID or vehicle]")]
        public void getVehicleInfo(Player player, int vehicleId = -1)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            
            if(userData.adminLevel > 0)
            {

                if(vehicleId == -1 && player.Vehicle == null)
                {
                    AdminUtils.staffSay(player, $"Specifiy a vehicle ID or use this command inside of a vehicle.");
                    return;
                }

                
                if(vehicleId == -1 && player.IsInVehicle)
                {
                    DbVehicle currentVehicleData = VehicleSystem.getVehicleData(player.Vehicle);

                    if (currentVehicleData != null)
                    {
                        VehicleSystem.sayInfoAboutVehicle(player, userData, currentVehicleData);
                    }
                    else
                    {
                        AdminUtils.staffSay(player, "Vehicle couldn't be found.");
                    }
                    return;
                }

                DbVehicle foundVehicleData = VehicleSystem.getVehicleDataById(vehicleId);
                
                if (foundVehicleData != null)
                {
                    VehicleSystem.sayInfoAboutVehicle(player, userData, foundVehicleData);
                }
                else
                {
                    AdminUtils.staffSay(player, "Vehicle couldn't be found.");
                }
            }
        }

        [Command("setdimension", "~r~/setdimension [playerIdOrName] [dimension]", Alias = "setd")]
        public void setDimension(Player player, string playerIdOrName, uint dimension)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(AdminUtils.checkUserData(player, userData))
            {
                Player getPlayer = CommandUtils.getPlayerFromNameOrId(playerIdOrName);
                DbCharacter characterData = PlayersData.getPlayerCharacterData(getPlayer);

                if (getPlayer == null || characterData == null)
                {
                    AdminUtils.playerNotFound(player);
                    return;
                }

                characterData.player_dimension = dimension;
                getPlayer.Dimension = dimension;

                using(DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.characters.Update(characterData);
                    dbContext.SaveChanges();
                }

                AdminUtils.staffSay(player, $"Set {characterData.character_name}'s dimension to {dimension}");
                AdminUtils.staffSay(getPlayer, $"Your dimension was set to {dimension} by Admin {userData.adminName}");
            }
        }

        [Command("fix")]
        public void onFixVehicle(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(AdminUtils.checkUserData(player, userData))
            {
                if(player.IsInVehicle)
                {
                    NAPI.Vehicle.RepairVehicle(player.Vehicle);
                    AdminUtils.staffSay(player, " Repaired vehicle.");
                } else
                {
                    AdminUtils.staffSay(player, " You must be in a vehicle to repair it.");
                }
            }
        }

        [Command("setaped", "~r~/setaped [pedName]")]
        public void setAdminPed(Player player, string pedName)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(userData.adminLevel > (int)AdminRanks.Admin_SeniorSupport)
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account findAccount = dbContext.accounts.Find(userData.accountId);

                    if (findAccount != null)
                    {
                        findAccount.admin_ped = pedName;
                        userData.adminPed = pedName;
                    }

                    dbContext.Update(findAccount);
                    dbContext.SaveChanges();
                    PlayersData.setPlayerAccountData(player, userData);
                    AdminUtils.setPed(player, pedName);

                    AdminUtils.staffSay(player, $"You set your admin ped to {pedName}");
                }
            } else AdminUtils.sendNoAuth(player);
        }

        [Command("ban", "~r~/ban [playerIdOrName] [reason] [length minutes(-1 for permanent ban)]")]
        public static void banPlayer(Player player, string playerNameOrId, string reason, int time)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(AdminUtils.checkUserData(player, userData))
            {
                Player banPlayer = CommandUtils.getPlayerFromNameOrId(playerNameOrId);
                if(banPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                User banPlayerUserData = PlayersData.getPlayerAccountData(banPlayer);

                if (time < -1)
                {
                    AdminUtils.staffSay(player, "Enter a valid minute time.");
                    return;
                }

                long lift_unix_time = time == -1 ? -1 : CommandUtils.generateUnix() + time * 60;

                AdminUtils.banAPlayer(time, userData, banPlayerUserData, banPlayer, reason);

                string playerAdminRank = AdminUtils.getColouredAdminRank(userData);
                string endOfBanString = lift_unix_time == 1 ? Chat.red + "is permanent" : "expires at" + Chat.orange + CommandUtils.unixTimeStampToDateTime(lift_unix_time);
                AdminUtils.sendMessageToAllStaff($"{playerAdminRank} {userData.adminName} banned account {banPlayerUserData.username} with reason {reason} ban {endOfBanString}");
            }
        }

        [Command("spw", "~r~/spw [weaponName] [ammo]")]
        public void spawnWeapon(Player player, WeaponHash weaponName, int ammo = 999)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            if (userData == null) return;

            if(userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin)
            {
                NAPI.Player.GivePlayerWeapon(player, weaponName, ammo);

                AdminUtils.staffSay(player, $"You gave yourself a {Chat.yellow}{weaponName}{Chat.White} with {ammo} ammo");
            }
            else AdminUtils.sendNoAuth(player);

        }

        [Command("flip", "~r~/flip [Current Vehicle Or VehicleId]")]
        public void flipVehicle(Player player, int vehicleId = -1)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData == null) return;

            if(userData.adminLevel > 2 && userData.adminDuty || userData.adminLevel > (int)AdminRanks.Admin_SeniorAdmin)
            {
                if(vehicleId == -1 && !player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle or specify a vehicle ID.");
                }

                if(player.IsInVehicle)
                {
                    player.Vehicle.Rotation = new Vector3(0, 0, 0);
                    AdminUtils.staffSay(player, "Flipped vehicle.");
                    return;
                }

                Vehicle findById = VehicleSystem.findVehicleById(vehicleId); 

                if(findById == null)
                {
                    CommandUtils.errorSay(player, "Vehicle with that ID was not found");
                    return;
                }

                findById.Rotation = new Vector3(0, 0, 0);
                AdminUtils.staffSay(player, "Flipped vehicle");

            } else AdminUtils.sendNoAuth(player);
        }

        [Command("stv", "~r~/stv [seatId]", Alias = "setintovehicle")]
        public void setIntoVehicle(Player player, int seatId = 0)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (AdminUtils.checkUserData(player, userData))
            {
                List<Vehicle> rangeVehicles = VehicleSystem.getVehicleInRange(player, 10);
                
                if(rangeVehicles == null || rangeVehicles.Count == 0)
                {
                    CommandUtils.errorSay(player, "There are no vehicles within range to enter");
                    return;
                }

                player.SetIntoVehicle(rangeVehicles[0], seatId);
            }
        }

        [Command("id", "~r~/id [playerIdOrName]")]
        public void idPlayer(Player player, string playerName)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if(AdminUtils.checkUserData(player, userData))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(playerName);

                if(findPlayer == null)
                {
                    CommandUtils.errorSay(player, "Player was not found.");
                    return;
                }

                DbCharacter findPlayerCharData = PlayersData.getPlayerCharacterData(player);

                uiHandling.pushRouterToClient(player, Browsers.StatsPage);

                uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerStats, findPlayerCharData);
                uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerData, player);

                AdminUtils.staffSay(player, $"Viewing {findPlayerCharData.character_name}'s stats");
            }
        }

    }
}
