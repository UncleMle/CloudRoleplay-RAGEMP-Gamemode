using CloudRP.GeneralSystems.GeneralCommands;
using CloudRP.GeneralSystems.WeaponSystem;
using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.DeathSystem;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.PlayerSystems.PlayerDealerships;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.DiscordSystem;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using Discord;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CloudRP.ServerSystems.Admin
{
    internal class AdminSystem : Script
    {
        public static List<Report> activeReports = new List<Report>();
        public static Dictionary<int, Vector3> adminAdutyPositions = new Dictionary<int, Vector3>();
        public static int _maxReports = 2;
        public static int _maxAdminMarkers = 20;
        public static string defaultAdminPed = "ig_abigail";
        public static readonly string directory = Directory.GetCurrentDirectory() + "/json/";

        [ServerEvent(Event.PlayerDisconnected)]
        public void OnPlayerDisconnect(Player player, DisconnectionType type, string reason)
        {
            User userData = player.getPlayerAccountData();

            if (userData != null)
            {
                foreach (KeyValuePair<int, Vector3> adminPos in adminAdutyPositions)
                {
                    if (adminPos.Key == userData.account_id)
                    {
                        adminAdutyPositions.Remove(adminPos.Key);
                    }
                }
            }
        }

        public static void saveAdutyPosition(User userData, Vector3 pos)
        {
            if(userData != null)
            {
                if (adminAdutyPositions.ContainsKey(userData.account_id))
                {
                    adminAdutyPositions.Remove(userData.account_id);
                }

                adminAdutyPositions.Add(userData.account_id, pos);
            }
        }

        [ServerEvent(Event.PlayerConnected)]
        public void playerConnected(Player player)
        {
            Ban checkIsBanned = player.checkPlayerIsBanned();

            if (checkIsBanned != null)
            {
                player.setPlayerToBanScreen(checkIsBanned);
            }

        }

        [Command("ahelp", "~r~/ahelp")]
        public void adminHelpCommand(Player player)
        {
            if (player.checkUserData((int)AdminRanks.Admin_Support))
            {
                for (int i = 0; i < NAPI.Resource.GetResourceCommands("CloudRP").Length; i++)
                {
                    AdminUtils.staffSay(player, " /" + NAPI.Resource.GetResourceCommands("CloudRP")[i]);
                }
            }
        }

        [Command("report", "~y~Use: ~w~/report [description]", GreedyArg = true)]
        public async Task onReport(Player player, string desc)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null) return;

            if (desc.Length > 256)
            {
                CommandUtils.errorSay(player, "Report descriptions must be less than 256 characters.");
                return;
            }

            if (activeReports.Where(rep => rep.playerReporting.Equals(player)).ToList().Count > 0)
            {
                CommandUtils.errorSay(player, "You already have a report active. Use /closereport to close.");
                return;
            }

            Report report = new Report
            {
                playerReporting = player,
                characterData = characterData,
                userData = userData,
                description = desc
            };

            activeReports.Add(report);

            int id = activeReports.IndexOf(report);

            AdminUtils.sendMessageToAllStaff($"{characterData.character_name} [{player.Id}] has created a new report with ID {id}");
            CommandUtils.successSay(player, $"Created report with id {id}. Staff have been alerted.");
            await DiscordSystems.addAReport(report, id);

            string msgUri = DiscordUtils.getRedirectUri(report.discordRefId);

            EmbedBuilder sendInChannel = new EmbedBuilder
            {
                Title = "Report #" + id + " | **" + desc + "**",
                Color = Discord.Color.DarkerGrey,
                Description = "Created by " + characterData.character_name + " [" + player.Id + "]"
            };

            await DiscordIntegration.SendEmbed(report.discordChannelId, sendInChannel);
        }

        [Command("ann", "~r~/ann [message]", Alias = "announce", GreedyArg = true)]
        public void announceCommand(Player player, string message)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_SeniorModerator && userData.adminDuty || userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                string colouredAdminRank = AdminUtils.getColouredAdminRank(userData);

                string annMessage = $"{ChatUtils.red}[Announcement] {colouredAdminRank} {userData.admin_name} {ChatUtils.red}says:{ChatUtils.White} {message}";

                NAPI.Chat.SendChatMessageToAll(annMessage);

            }
            else AdminUtils.sendNoAuth(player);

        }

        [Command("aesp", "~r~/asep")]
        public void adminEspToggle(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                userData.admin_esp = !userData.admin_esp;

                player.setPlayerAccountData(userData, true, true);
                AdminUtils.staffSay(player, $"You have {(userData.admin_esp ? "disabled" : "enabled")} admin esp.");
                uiHandling.sendNotification(player, $"~r~You {(userData.admin_esp ? "~r~disabled" : "~g~enabled")} admin esp", false);
                ChatUtils.formatConsolePrint($"{userData.admin_name} toggled admin esp {(userData.admin_esp ? "on" : "off")}");
            }
        }

        [Command("closereport", "~y~Use: ~w~/closereport")]
        public void closeReport(Player player)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null) return;

            Report findReport = activeReports.Where(rep => rep.playerReporting == player).FirstOrDefault();

            if (findReport != null)
            {
                CommandUtils.successSay(player, "Your active report was closed.");
                DiscordSystems.closeAReport(findReport);
                return;
            }
            else
            {
                CommandUtils.errorSay(player, "You do not have a active report.");
            }
        }

        [RemoteEvent("server:viewReports")]
        [Command("reports", "~r~/reports")]
        public void viewReports(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_None)
            {
                if (activeReports.Count == 0)
                {
                    uiHandling.sendPushNotifError(player, "There are currently no active reports.", 4300);
                    return;
                }

                List<SharedReport> sharedReports = new List<SharedReport>();

                foreach (Report report in activeReports)
                {
                    sharedReports.Add(new SharedReport
                    {
                        description = report.description,
                        playerId = report.playerReporting.Id,
                        reportId = activeReports.IndexOf(report)
                    });
                }

                uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerReportData, sharedReports);

                uiHandling.pushRouterToClient(player, Browsers.ReportsPage);

            }
            else AdminUtils.sendNoAuth(player);

        }

        [RemoteEvent("server:acceptReport")]
        public void acceptReport(Player player, int reportId)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null || userData.admin_status < 1) return;

            if (reportId > activeReports.Count || reportId < 0)
            {
                CommandUtils.errorSay(player, "Invalid report id.");
                return;
            }

            Report findReport = activeReports[reportId];

            if (findReport.adminsHandling.ContainsKey(player))
            {
                CommandUtils.errorSay(player, "You have already accepted this report.");
                return;
            }

            if (findReport != null)
            {
                if (findReport.playerReporting.Equals(player))
                {
                    CommandUtils.errorSay(player, "You cannot accept your own reports");
                    return;
                }

                findReport.adminsHandling.Add(player, userData);

                if (findReport.adminsHandling.Count == 0 && findReport.discordAdminsHandling.Count == 0)
                {
                    NAPI.Chat.SendChatMessageToPlayer(findReport.playerReporting, ChatUtils.reports + $"Your report was accepted by {userData.admin_name}");
                }
                else
                {
                    NAPI.Chat.SendChatMessageToPlayer(findReport.playerReporting, ChatUtils.reports + $"Admin {userData.admin_name} joined your report.");
                }

                uiHandling.resetRouter(player);
                NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.reports + $"You accepted report {reportId}.");

                DiscordIntegration.SendMessage(findReport.discordChannelId, $"Admin {userData.admin_name} joined your report.");
            }
        }

        [RemoteEvent("server:closeReport")]
        public async Task closeReport(Player player, int reportId)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null || userData.admin_status < 1) return;

            Report findReport = activeReports[reportId];

            if (reportId > activeReports.Count || reportId < 0) return;

            if (!findReport.adminsHandling.ContainsKey(player))
            {
                CommandUtils.errorSay(player, "You must a be an admin handling this report to close it.");
                return;
            }

            uiHandling.resetRouter(player);

            await DiscordSystems.closeAReport(findReport, true);

            activeReports.Remove(findReport);
            NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.Success + "You closed report with id " + reportId);
            NAPI.Chat.SendChatMessageToPlayer(findReport.playerReporting, ChatUtils.reports + $"Your report was closed");
        }

        [Command("rr", "~r~Use: ~w~/rr [message]", GreedyArg = true, Alias = "reportrespond")]
        public async Task reportResponse(Player player, string message)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData == null || characterData == null) return;

            Report report = activeReports
                .Where(rep => rep.playerReporting == player)
                .FirstOrDefault();

            Report handlingReport = activeReports
                .Where(rep => rep.adminsHandling
                .ContainsKey(player))
                .FirstOrDefault();

            if (handlingReport != null)
            {
                AdminUtils.sendToAdminsHandlingReport(handlingReport, ChatUtils.reports + ChatUtils.red + "[Admin] " + ChatUtils.White + userData.admin_name + ChatUtils.grey + " says:" + ChatUtils.White + message, player);
                NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.reports + $"You {ChatUtils.grey}say:{ChatUtils.White} " + message);
                NAPI.Chat.SendChatMessageToPlayer(handlingReport.playerReporting, ChatUtils.reports + $"{ChatUtils.red}[Admin] {ChatUtils.White}{userData.admin_name} {ChatUtils.grey}says:{ChatUtils.White} " + message);
                await DiscordIntegration.SendMessage(handlingReport.discordChannelId, "``[ADMIN]`` " + userData.admin_name + " **says:** " + message, false);
                return;
            }

            if (report != null)
            {
                if (report.discordAdminsHandling.Count == 0 && report.adminsHandling.Count == 0)
                {
                    CommandUtils.errorSay(player, "You must wait until your report is accepted to use this command.");
                    return;
                }

                AdminUtils.sendToAdminsHandlingReport(report, ChatUtils.reports + $"{characterData.character_name} [{player.Id}]" + ChatUtils.grey + " says: " + ChatUtils.White + message, player);
                await DiscordIntegration.SendMessage(report.discordChannelId, characterData.character_name + $" [{player.Id}] " + "**says:** " + message);
                NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.reports + $"You {ChatUtils.grey}say:{ChatUtils.White} " + message);
                return;
            }
            else
            {
                CommandUtils.errorSay(player, "You do not have any active report to respond to.");
            }
        }

        [Command("goback", "~r~/goback")]
        public static void goAdminBack(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                KeyValuePair<int, Vector3> savedAdminPosition = adminAdutyPositions
                    .Where(savePos => savePos.Key == userData.account_id)
                    .FirstOrDefault();

                if (savedAdminPosition.Value == null)
                {
                    CommandUtils.errorSay(player, "You have not been on admin duty yet.");
                    return;
                }

                player.Position = savedAdminPosition.Value;

                uiHandling.sendNotification(player, "~r~Teleported to last admin duty position", false);
                AdminUtils.staffSay(player, "Returned to admin duty position.");
            }
        }

        [Command("aduty", "~r~/aduty", Alias = "ad")]
        public void onAduty(Player player)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData != null && characterData != null && userData.admin_status > (int)AdminRanks.Admin_SeniorSupport)
            {
                string colourAdminRank = AdminUtils.getColouredAdminRank(userData);

                player.setAdminDuty(!userData.adminDuty);

                uiHandling.sendNotification(player, $"Toggled admin duty {(userData.adminDuty ? "~g~on" : "~r~off")}", false);
                AdminUtils.sendMessageToAllStaff($"{colourAdminRank} {AdminUtils.staffSuffixColour}{userData.admin_name} is {(userData.adminDuty ? $"{ChatUtils.moneyGreen}on" : $"{ChatUtils.red}off")} duty");
                ChatUtils.formatConsolePrint($"{userData.admin_name} has toggled admin duty {(userData.adminDuty ? "on" : "off")}");
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("staff", "~r~/staff")]
        public void staff(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_None)
            {
                Dictionary<Player, User> onlineStaff = AdminUtils.gatherStaff();

                if (onlineStaff.Count == 0)
                {
                    CommandUtils.errorSay(player, "There is no online staff.");
                    return;
                }

                int index = 0;
                foreach (KeyValuePair<Player, User> item in onlineStaff)
                {
                    index++;
                    User user = item.Value;
                    string adminRank = AdminUtils.getColouredAdminRank(user);
                    string duty = user.adminDuty ? $"{ChatUtils.grey}[{ChatUtils.moneyGreen}On-Duty{ChatUtils.grey}]" : $"{ChatUtils.grey}[{ChatUtils.red}Off-Duty{ChatUtils.grey}]";

                    AdminUtils.staffSay(player, index + $". {user.admin_name} {adminRank} {duty}");
                }

            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("a", "~r~/adminchat [message]", GreedyArg = true, Alias = "adminchat")]
        public void adminChat(Player player, string message)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_None)
            {
                Dictionary<Player, User> onlineAdmins = AdminUtils.gatherStaff();

                string colouredAdminRank = AdminUtils.getColouredAdminRank(userData);

                foreach (KeyValuePair<Player, User> entry in onlineAdmins)
                {
                    entry.Key.SendChatMessage(colouredAdminRank + userData.admin_name + ChatUtils.red + " says: " + ChatUtils.White + message);
                }
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("tpto", "~r~/tpto [nameOrId]", Alias = "goto")]
        public void teleportToPlayer(Player player, string nameOrId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (findPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                DbCharacter characterData = findPlayer.getPlayerCharacterData();
                if (characterData == null) return;

                if (findPlayer.Equals(player))
                {
                    AdminUtils.staffSay(player, "You cannot tp to yourself.");
                    return;
                }

                if (findPlayer != null)
                {
                    player.Position = findPlayer.Position;
                    player.Dimension = findPlayer.Dimension;

                    AdminUtils.staffSay(player, $"Teleported to {characterData.character_name}");
                    ChatUtils.formatConsolePrint($"{userData.admin_name} teleported to player {findPlayer.Id}");

                    uiHandling.sendNotification(player, $"~r~You teleported to {characterData.character_name}", false);
                }
            }
        }

        [Command("kick", "~r~/kick [nameOrId] [silent]")]
        public void kickPlayer(Player player, string nameOrId, bool isSilent = false)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (findPlayer != null)
                {
                    DbCharacter characterData = findPlayer.getPlayerCharacterData();

                    if (findPlayer.Equals(player))
                    {
                        AdminUtils.staffSay(player, "You cannot kick yourself");
                        return;
                    }

                    if (findPlayer.isImmuneTo(player)) return;

                    findPlayer.Kick();
                    ChatUtils.formatConsolePrint($"{userData.admin_name} kicked {characterData.character_name}");
                    uiHandling.sendNotification(player, $"~r~You kicked {userData.admin_name}", false);

                    if (!isSilent)
                    {
                        AdminUtils.sendMessageToAllStaff(userData.admin_name + " kicked " + characterData.character_name);
                    }
                }
                else
                {
                    CommandUtils.notFound(player);
                }
            }
        }

        [Command("revive", "~r~/revive [nameOrId]")]
        public void reviveCommand(Player player, string nameOrId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (findPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                DbCharacter findCharacter = findPlayer.getPlayerCharacterData();

                if (findCharacter.injured_timer <= 0)
                {
                    AdminUtils.staffSay(player, "This player isn't injured!");
                    return;
                }

                DeathEvent.resetTimer(findPlayer, findCharacter);
                NAPI.Player.SpawnPlayer(findPlayer, findPlayer.Position);

                AdminUtils.staffSay(player, "You revived " + findCharacter.character_name);
                AdminUtils.staffSay(findPlayer, "You were revived by Admin " + userData.admin_name);

                uiHandling.sendNotification(player, $"~r~You revived {findCharacter.character_name}", false);
                uiHandling.sendNotification(findPlayer, $"~r~You were revived by {userData.admin_name}", false);

                ChatUtils.formatConsolePrint($"{userData.admin_name} revived {findCharacter.character_name}");
            }

        }

        [Command("bring", "~r~/bring [nameOrId]")]
        public void bringPlayer(Player player, string nameOrId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (findPlayer != null)
                {
                    DbCharacter findPlayerData = findPlayer.getPlayerCharacterData();

                    if (findPlayer.Equals(player))
                    {
                        CommandUtils.errorSay(player, "You cannot bring yourself");
                        return;
                    }

                    if (findPlayer.isImmuneTo(player)) return;

                    AntiCheatSystem.sleepClient(findPlayer);
                    findPlayer.Position = player.Position;
                    findPlayer.Dimension = player.Dimension;

                    ChatUtils.formatConsolePrint($"{userData.admin_name} teleported Player [{findPlayerData.character_name}] to themselves.");
                    AdminUtils.staffSay(player, "Teleported Player [" + findPlayer.Id + "] to you.");
                    AdminUtils.staffSay(findPlayer, $"Admin {userData.admin_name} teleported you.");

                    uiHandling.sendNotification(player, $"~r~You teleported {findPlayerData.character_name}.", false);
                    uiHandling.sendNotification(findPlayer, $"~r~You have been teleported by {userData.admin_name}.", false);
                }
                else CommandUtils.notFound(player);
            }
        }

        [Command("veh", "~r~/veh [vehName] [colourOne] [colourTwo]")]
        public void spawnVehicle(Player player, string vehName, int colourOne = 111, int colourTwo = 111)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter charData = player.getPlayerCharacterData();

            if (charData == null) return;

            if (player.checkUserData((int)AdminRanks.Admin_HeadAdmin, false))
            {
                Vector3 playerPosition = player.Position;
                float playerRotation = player.Rotation.Z;

                (Vehicle vehicle, DbVehicle vehicleData) = VehicleSystem.buildVehicle(vehName, playerPosition, playerRotation, charData.character_id, colourOne, colourTwo, charData.character_name);

                if (vehicle == null) return;

                player.SetIntoVehicle(vehicle, 0);

                AdminUtils.staffSay(player, $"You spawned in vehicle {vehName} #{vehicleData.vehicle_id}");
                ChatUtils.formatConsolePrint($"{userData.admin_name} spawned in a {vehName} #{vehicleData.vehicle_id}");
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("bringv", "~r~/bringv [vehicleIdOrPlate] [setIntoVeh(true | false)]", Alias = "vbring")]
        public void bringVehicle(Player player, string vehicleIdOrPlate, bool setIntoVeh = true)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Vehicle findVehicle = VehicleSystem.getVehicleByPlate(vehicleIdOrPlate);

                if (findVehicle == null)
                {
                    int? parseId = CommandUtils.tryParse(vehicleIdOrPlate);

                    if (parseId == null)
                    {
                        CommandUtils.errorSay(player, "Vehicle was not found.");
                        return;
                    }

                    findVehicle = VehicleSystem.getVehicleById((int)parseId, player.Position);
                }

                if (findVehicle == null)
                {
                    CommandUtils.errorSay(player, "Vehicle was not found.");
                }
                else
                {
                    DbVehicle vehicleData = findVehicle.getData();

                    if(vehicleData != null)
                    {
                        if(vehicleData.dealership_id != -1)
                        {
                            findVehicle.removePlayerDealerStatus();
                        }

                        uiHandling.sendNotification(player, "~r~Teleporting vehicle...", false);

                        NAPI.Pools.GetAllPlayers().ForEach(p =>
                        {
                            if (p.IsInVehicle && p.Vehicle.Id == findVehicle.Id)
                            {
                                p.WarpOutOfVehicle();
                                p.Position = player.Position;
                                AdminUtils.staffSay(p, $"Admin {userData.admin_name} teleported your vehicle.");
                            }
                        });

                        findVehicle.Position = player.Position.Around(5);

                        NAPI.Task.Run(() =>
                        {
                            if (findVehicle != null && player != null)
                            {
                                ChatUtils.formatConsolePrint($"{userData.admin_name} v brought {findVehicle.NumberPlate} to them.");
                                findVehicle.Position = player.Position.Around(5);
                                AdminUtils.staffSay(player, $"Vehicle was brought to you.");

                                if (setIntoVeh)
                                {
                                    player.SetIntoVehicle(findVehicle, 0);
                                }

                                uiHandling.sendNotification(player, $"~r~Teleported vehicle [{findVehicle.NumberPlate}]", false);
                            }
                        }, 1500);
                    }
                }
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("vbringall", "~r~/vbringall")]
        public void vbringAllCommand(Player player)
        {
            if(player.checkUserData((int)AdminRanks.Admin_Developer))
            {
                int count = 0;
                NAPI.Pools.GetAllVehicles().ForEach(veh =>
                {
                    DbVehicle vehicleData = veh.getData();

                    if (veh.getData() != null)
                    {
                        if(vehicleData.dealership_id != -1)
                        {
                            veh.removePlayerDealerStatus();
                        }

                        veh.Dimension = player.Dimension;
                        veh.Position = player.Position;
                        count++;
                    }
                });

                AdminUtils.staffSay(player, $"You teleported all {count} vehicles in the world to your position.");
            }
        }

        [Command("senalltoi", "~r~/senalltoi")]
        public void sendAllToInsuranceCommand(Player player)
        {
            if(player.checkUserData((int)AdminRanks.Admin_Developer))
            {
                int count = 0;

                NAPI.Pools.GetAllVehicles().ForEach(veh =>
                {
                    if(veh.getData() != null)
                    {
                        veh.sendVehicleToInsurance();
                        count++;
                    }
                });

                AdminUtils.staffSay(player, $"You have sent all {count} vehicles to insurance.");
            }
        }

        [RemoteEvent("admin:fly")]
        [Command("fly", "~r~/fly")]
        public void fly(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                userData.isFlying = !userData.isFlying;

                ChatUtils.formatConsolePrint($"{userData.admin_name} {(userData.isFlying ? "enabled" : "disabled")} fly.");

                if (userData.isFlying)
                {
                    player.TriggerEvent("admin:startFly");
                }
                else
                {
                    player.TriggerEvent("admin:endFly");
                }

                uiHandling.sendNotification(player, userData.isFlying ? "~g~Enabled fly" : "~r~Disabled fly", false);

                player.setPlayerAccountData(userData);
            }
        }

        [Command("freeze", "~r~/freeze [nameOrId]")]
        public void freezePlayer(Player player, string nameOrId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player getPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (getPlayer != null)
                {
                    User targetPlayerData = getPlayer.getPlayerAccountData();
                    DbCharacter targetCharData = getPlayer.getPlayerCharacterData();

                    if (targetPlayerData.isFlying || targetPlayerData.adminDuty)
                    {
                        CommandUtils.errorSay(player, "You cannot freeze a player that is flying or in admin duty.");
                        return;
                    }

                    if (getPlayer.isImmuneTo(player)) return;

                    targetPlayerData.isFrozen = targetPlayerData.isFrozen = !targetPlayerData.isFrozen;
                    string isFrozen = targetPlayerData.isFrozen ? "froze" : "unfroze";

                    getPlayer.setPlayerAccountData(targetPlayerData);
                    if (!targetPlayerData.isFrozen)
                    {
                        getPlayer.TriggerEvent("admin:events:stopFly");
                    }

                    if (getPlayer.IsInVehicle)
                    {
                        getPlayer.TriggerEvent("customs:toggleVehicleFreeze", targetPlayerData.isFrozen);
                    }

                    ChatUtils.formatConsolePrint($"{userData.admin_name} {isFrozen} {targetCharData.character_name}.");
                    AdminUtils.staffSay(player, $"You {isFrozen} {targetPlayerData.username}");
                    AdminUtils.staffSay(getPlayer, $"You were {isFrozen + "n"} by Admin {userData.admin_name}");

                    uiHandling.sendNotification(player, $"~r~You have {isFrozen} {targetCharData.character_name}", false);
                    uiHandling.sendNotification(getPlayer, $"~r~You have been {isFrozen} by {userData.admin_name}", false);
                }
            }
        }

        [Command("tpm", "~r~/tpm", Alias = "telm")]
        public void onTeleportToWay(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                saveAdutyPosition(userData, player.Position);
                ChatUtils.formatConsolePrint($"{userData.admin_name} teleported to way point.");
                player.TriggerEvent("admin:events:teleportWay");
            }
        }

        [Command("delv", "~r~/delv [yourVehicle Or vehicleId]")]
        public void delV(Player player, int vehicleId = -1)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                if (vehicleId == -1 && !player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle or specifiy one.");
                    return;
                }

                if (vehicleId == -1 && player.IsInVehicle)
                {
                    DbVehicle vehicleData = player.Vehicle.getData();

                    if (vehicleData == null)
                    {
                        player.Vehicle.Delete();
                        return;
                    }

                    VehicleSystem.deleteVehicleById(vehicleData.vehicle_id);
                    ChatUtils.formatConsolePrint($"{userData.admin_name} deleted vehicle #{vehicleId}");
                    AdminUtils.staffSay(player, $"Vehicle with id {vehicleData.vehicle_id} was deleted.");
                    return;
                }

                bool findAndDelete = VehicleSystem.deleteVehicleById(vehicleId);

                if (findAndDelete)
                {
                    ChatUtils.formatConsolePrint($"{userData.admin_name} deleted vehicle #{vehicleId}");
                    AdminUtils.staffSay(player, $"Vehicle with id {vehicleId} deleted.");
                }
                else
                {
                    CommandUtils.errorSay(player, "Vehicle couldn't be found!");
                }
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("gcv", "~r~/gcv")]
        public void getVehicleInfo(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > 0)
            {
                Vehicle findVeh = VehicleSystem.getClosestVehicleToPlayer(player);

                if (findVeh != null)
                {
                    DbVehicle currentVehicleData = findVeh.getData();

                    if (currentVehicleData != null)
                    {
                        findVeh.sayInfoAboutVehicle(player);
                    }
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
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player getPlayer = CommandUtils.getPlayerFromNameOrId(playerIdOrName);
                DbCharacter characterData = getPlayer.getPlayerCharacterData();

                if (getPlayer == null || characterData == null)
                {
                    AdminUtils.playerNotFound(player);
                    return;
                }

                if (dimension == Auth._startDimension)
                {
                    CommandUtils.errorSay(player, "This dimension is restricted.");
                    return;
                }

                if (getPlayer.isImmuneTo(player)) return;

                characterData.player_dimension = dimension;
                getPlayer.Dimension = dimension;

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    dbContext.characters.Update(characterData);
                    dbContext.SaveChanges();
                }

                ChatUtils.formatConsolePrint($"{userData.admin_name} set {characterData.character_name}'s dimension to {dimension}");
                AdminUtils.staffSay(player, $"Set {characterData.character_name}'s dimension to {dimension}");
                AdminUtils.staffSay(getPlayer, $"Your dimension was set to {dimension} by Admin {userData.admin_name}");

                uiHandling.sendNotification(player, $"~r~Set {characterData.character_name}'s dimension to {dimension}", false);
                uiHandling.sendNotification(getPlayer, $"~r~Your dimension was set to {dimension} by {userData.admin_name}", false);
            }
        }

        [Command("fix")]
        public void onFixVehicle(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                if (player.IsInVehicle)
                {
                    DbVehicle vehicleData = player.Vehicle.getData();
                    if (vehicleData == null) return;

                    player.Vehicle.closeAllDoors();
                    player.Vehicle.closeAllWindows();
                    player.Vehicle.setDirtLevel(0);

                    NAPI.Vehicle.RepairVehicle(player.Vehicle);

                    ChatUtils.formatConsolePrint($"{userData.admin_name} repaired a vehicle.");
                    AdminUtils.staffSay(player, " Repaired vehicle.");
                }
                else
                {
                    AdminUtils.staffSay(player, " You must be in a vehicle to repair it.");
                }
            }
        }

        [Command("setaped", "~r~/setaped [pedName | none]")]
        public void setAdminPed(Player player, string pedName)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_SeniorSupport)
            {
                pedName = pedName.ToLower();

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account findAccount = dbContext.accounts.Find(userData.account_id);

                    if (findAccount != null)
                    {
                        findAccount.admin_ped = pedName;
                        userData.admin_ped = pedName;
                    }

                    dbContext.Update(findAccount);
                    dbContext.SaveChanges();
                    player.setPlayerAccountData(userData);

                    AdminUtils.staffSay(player, $"You set your admin ped to {pedName}");
                }
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("ban", "~r~/ban [playerIdOrName] [length minutes(-1 for permanent ban)] [reason]", GreedyArg = true)]
        public static void banPlayer(Player player, string playerNameOrId, int time, string reason)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player banPlayer = CommandUtils.getPlayerFromNameOrId(playerNameOrId);
                if (banPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                if (player.Equals(banPlayer))
                {
                    AdminUtils.staffSay(player, "You cannot ban yourself.");
                    return;
                }

                if (banPlayer.isBanned())
                {
                    AdminUtils.staffSay(player, "This player is already in the server banned.");
                    return;
                }

                User banPlayerUserData = banPlayer.getPlayerAccountData();
                DbCharacter characterData = banPlayer.getPlayerCharacterData();


                if (banPlayer.isImmuneTo(player)) return;

                if (time < -1 || time == 0)
                {
                    AdminUtils.staffSay(player, "Enter a valid minute time.");
                    return;
                }

                long lift_unix_time = time == -1 ? -1 : CommandUtils.generateUnix() + time * 60;

                banPlayer.banPlayer(time, userData, banPlayerUserData, reason);

                string playerAdminRank = AdminUtils.getColouredAdminRank(userData);
                string endOfBanString = lift_unix_time == -1 ? ChatUtils.red + "is permanent" : "expires at " + ChatUtils.orange + CommandUtils.unixTimeStampToDateTime(lift_unix_time);

                ChatUtils.formatConsolePrint($"{userData.admin_name} banned {characterData.character_name} with reason {reason} ban {endOfBanString}");
                CommandUtils.sendToAllPlayers($"{AdminUtils.staffPrefix}{playerAdminRank} {userData.admin_name} banned {characterData.character_name} with reason {reason} ban {endOfBanString}");
            }
        }

        [Command("unban", "~r~/unban [username]", GreedyArg = true)]
        public void unbanAplayer(Player player, string accountName)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                bool unbanViaUsername = AdminUtils.unBanCharacter(accountName);

                if (unbanViaUsername)
                {
                    ChatUtils.formatConsolePrint($"{userData.admin_name} unbanned {accountName}");
                    AdminUtils.staffSay(player, $"Unbanned user {accountName}");
                }
                else
                {
                    AdminUtils.staffSay(player, $"No ban for user {accountName} was found.");
                }
            }
        }

        [Command("spw", "~r~/spw [weaponName] [ammo]")]
        public void spawnWeapon(Player player, WeaponHash weaponName, int ammo = 999)
        {
            User userData = player.getPlayerAccountData();
            if (userData == null) return;

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                NAPI.Player.GivePlayerWeapon(player, weaponName, ammo);

                ChatUtils.formatConsolePrint($"{userData.admin_name} spawned in a {weaponName} with {ammo} ammo");
                AdminUtils.staffSay(player, $"You gave yourself a {ChatUtils.yellow}{weaponName}{ChatUtils.White}{AdminUtils.staffSuffixColour} with {ammo} ammo");

                uiHandling.sendNotification(player, $"~r~You spawned in a ~y~{weaponName}~r~ with ~y~{ammo}~r~ ammo", false);
            }
            else AdminUtils.sendNoAuth(player);

        }

        [Command("flip", "~r~/flip [Current Vehicle Or VehicleId]")]
        public void flipVehicle(Player player, int vehicleId = -1)
        {
            User userData = player.getPlayerAccountData();

            if (userData == null) return;

            if (userData.admin_status > 2 && userData.adminDuty || userData.admin_status > (int)AdminRanks.Admin_SeniorAdmin)
            {
                if (vehicleId == -1 && !player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle or specify a vehicle ID.");
                }

                if (player.IsInVehicle)
                {
                    player.Vehicle.Rotation = new Vector3(0, 0, 0);
                    AdminUtils.staffSay(player, "Flipped vehicle.");
                    return;
                }

                Vehicle findById = VehicleSystem.findVehicleById(vehicleId);

                if (findById == null)
                {
                    CommandUtils.errorSay(player, "Vehicle with that ID was not found");
                    return;
                }

                ChatUtils.formatConsolePrint($"{userData.admin_name} flipped a vehicle.");
                findById.Rotation = new Vector3(0, 0, 0);
                AdminUtils.staffSay(player, "Flipped vehicle");

                uiHandling.sendNotification(player, "~r~Flipped vehicle", false);

            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("stv", "~r~/stv [seatId]", Alias = "setintovehicle")]
        public void setIntoVehicle(Player player, int seatId = 0)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Vehicle findVeh = VehicleSystem.getClosestVehicleToPlayer(player, 20);

                if (findVeh == null)
                {
                    CommandUtils.errorSay(player, "There are no vehicles within range to enter");
                    return;
                }

                uiHandling.sendNotification(player, $"~r~Entered vehicle.", false);
                player.SetIntoVehicle(findVeh, seatId);
            }
        }

        [Command("id", "~r~/id [playerIdOrName]")]
        public void idPlayer(Player player, string playerName)
        {
            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(playerName);

                if (findPlayer == null)
                {
                    CommandUtils.errorSay(player, "Player was not found.");
                    return;
                }

                DbCharacter findPlayerCharData = findPlayer.getPlayerCharacterData();

                uiHandling.pushRouterToClient(player, Browsers.StatsPage);

                uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerStats, findPlayerCharData);
                uiHandling.handleObjectUiMutation(player, MutationKeys.PlayerData, player);

                AdminUtils.staffSay(player, $"Viewing {findPlayerCharData.character_name}'s stats");
            }
        }

        [Command("sethp", "~r~/sethp [nameOrId] [health]", Alias = "sethealth")]
        public void setHealth(Player player, string nameOrId, int health)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);
                DbCharacter characterData = findPlayer.getPlayerCharacterData();
                User targetUserData = findPlayer.getPlayerAccountData();

                if (findPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                if (targetUserData != null && targetUserData.adminDuty)
                {
                    CommandUtils.errorSay(player, "You cannot use this command with on duty admins.");
                    return;
                }

                if (findPlayer.isImmuneTo(player)) return;

                findPlayer.Health = health;

                ChatUtils.formatConsolePrint($"{userData.admin_name} set {characterData.character_name} health to {health}");
                AdminUtils.staffSay(player, $"Set {characterData.character_name}'s health to {health}");
                AdminUtils.staffSay(findPlayer, $"Your health was set to {health} by Admin {userData.admin_name}");

                uiHandling.sendNotification(findPlayer, $"~r~Your health was set to {health} by {userData.admin_name}", false);
                uiHandling.sendNotification(player, $"~r~You set {characterData.character_name}'s health to {health}", false);

            }
        }

        [Command("setaname", "~r~/setaname [nameOrId] [adminName]", GreedyArg = true)]
        public void setAdminName(Player player, string nameOrId, string adminName)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_Admin && userData.adminDuty || userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (findPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                User findPlayerData = findPlayer.getPlayerAccountData();

                if (findPlayer.isImmuneTo(player)) return;

                findPlayerData.admin_name = adminName;

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account findAccount = dbContext.accounts.Find(findPlayerData.account_id);

                    findAccount.admin_name = adminName;

                    dbContext.Update(findAccount);
                    dbContext.SaveChanges();
                }

                findPlayer.setPlayerAccountData(userData);
                AdminUtils.staffSay(player, $"Set Player [{findPlayer.Id}]'s admin name to {adminName}.");
                AdminUtils.staffSay(findPlayer, $"Your admin name was set to {adminName} by {userData.admin_name}.");


            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("setadmin", "~r~/setadmin [nameOrId] [adminLevel(0-8)]")]
        public void setAdmin(Player player, string nameOrId, int adminRankSet)
        {
            User userData = player.getPlayerAccountData();

            Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);

            if (player.checkUserData((int)AdminRanks.Admin_SeniorAdmin) || player.checkUserData((int)AdminRanks.Admin_HeadAdmin, false))
            {
                if (findPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                if (adminRankSet > RankList.adminRanksList.Length || adminRankSet < 0)
                {
                    AdminUtils.staffSay(player, "Enter a valid admin rank between 0 and " + RankList.adminRanksList.Length);
                    return;
                }

                if (adminRankSet > 3 && userData.admin_status <= (int)AdminRanks.Admin_SeniorAdmin)
                {
                    AdminUtils.staffSay(player, "You cannot set admin ranks that high. You can set up to moderator and below.");
                    return;
                }

                if (adminRankSet > 6 && userData.admin_status <= (int)AdminRanks.Admin_HeadAdmin)
                {
                    AdminUtils.staffSay(player, "You cannot set admin ranks that high. You can set up to Senior Admin and below.");
                    return;
                }

                if (player.Equals(findPlayer) && userData.admin_status <= (int)AdminRanks.Admin_HeadAdmin)
                {
                    AdminUtils.staffSay(player, "You cannot assign admin ranks to yourself.");
                    return;
                }

                User findPlayerData = findPlayer.getPlayerAccountData();
                DbCharacter findPlayerCharData = findPlayer.getPlayerCharacterData();

                if (findPlayer.isImmuneTo(player)) return;

                if (findPlayerData.admin_status >= (int)AdminRanks.Admin_SeniorAdmin && userData.admin_status <= (int)AdminRanks.Admin_SeniorAdmin)
                {
                    AdminUtils.staffSay(player, "You cannot remove admin ranks from a rank that high.");
                    return;
                }

                findPlayerData.admin_status = adminRankSet;
                findPlayerData.admin_ped = defaultAdminPed;
                findPlayerData.showAdminPed = false;
                findPlayerData.adminDuty = false;
                findPlayerData.isFlying = false;
                player.TriggerEvent("admin:endFly");

                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    Account findAcc = dbContext.accounts.Find(findPlayerData.account_id);

                    if (findAcc == null) return;

                    findAcc.admin_status = adminRankSet;
                    findAcc.admin_ped = defaultAdminPed;

                    dbContext.accounts.Update(findAcc);
                    dbContext.SaveChanges();
                }
                string setAdminRank = AdminUtils.getColouredAdminRank(findPlayerData);

                ChatUtils.formatConsolePrint($"{userData.admin_name} set {findPlayerCharData.character_name}'s admin level to {RankList.adminRanksList[adminRankSet]}");
                findPlayer.setPlayerAccountData(findPlayerData);
                AdminUtils.staffSay(player, $"You set {findPlayerCharData.character_name}'s admin level to {setAdminRank}");
                AdminUtils.staffSay(findPlayer, $"Your admin level was set to {setAdminRank}{AdminUtils.staffSuffixColour} by Admin {userData.admin_name}");
                AdminUtils.sendMessageToAllStaff($"{userData.admin_name} set {findPlayerCharData.character_name}'s admin level to {setAdminRank}");

            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("sendtoinsurance", "~r~/sendtoinsurance [plateOrId]", Alias = "sentov")]
        public void sendToInsurance(Player player, string plateOrId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Vehicle findVehicle = VehicleSystem.vehicleIdOrPlate(plateOrId);

                if (findVehicle != null)
                {
                    findVehicle.sendVehicleToInsurance();
                    ChatUtils.formatConsolePrint($"Admin {userData.admin_name} sent {plateOrId} to insurance.");
                    AdminUtils.staffSay(player, "Sent vehicle " + plateOrId + " to insurance.");
                }
                else
                {
                    AdminUtils.staffSay(player, "Vehicle couldn't be found.");
                    return;
                }
            }
        }

        [Command("gotov", "~r~/gotov [idOrPlate]")]
        public void goToVehicle(Player player, string idOrPlate)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Vehicle findVehicle = VehicleSystem.vehicleIdOrPlate(idOrPlate);

                if (findVehicle != null)
                {
                    player.Position = findVehicle.Position.Around(5);

                    ChatUtils.formatConsolePrint($"{userData.admin_name} teleported to vehicle {idOrPlate}");
                    AdminUtils.staffSay(player, "Teleported to vehicle " + idOrPlate);

                    uiHandling.sendNotification(player, $"~r~Teleported to vehicle", false);
                }
                else
                {
                    CommandUtils.errorSay(player, "Vehicle couldn't be found.");
                }
            }
        }

        [Command("ha", "~r~/headadmin [message]", Alias = "headadmin", GreedyArg = true)]
        public void headAdminChat(Player player, string message)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_SeniorAdmin)
            {
                Dictionary<Player, User> adminGroup = AdminUtils.gatherAdminGroupAbove(AdminRanks.Admin_SeniorAdmin);

                string adminRank = AdminUtils.getColouredAdminRank(userData);
                string prefix = ChatUtils.red + "[HA+] " + ChatUtils.White;

                foreach (KeyValuePair<Player, User> admin in adminGroup)
                {
                    NAPI.Chat.SendChatMessageToPlayer(admin.Key, prefix + adminRank + userData.admin_name + ChatUtils.red + " says: " + ChatUtils.White + message);
                }
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("arefuel", "~r~/arefuel [currentVehicle|id|plate]")]
        public void adminRefuelVehicle(Player player, string vehicleIdOrPlate = null)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Vehicle findVehicle = null;

                if (vehicleIdOrPlate == null && player.IsInVehicle)
                {
                    findVehicle = player.Vehicle;
                }
                else if (!player.IsInVehicle && vehicleIdOrPlate == null)
                {
                    CommandUtils.errorSay(player, "Select the correct parameters (/arefuel [currentVehicle|id|plate]) or enter a vehicle to use this command.");
                    return;
                }

                if (findVehicle == null)
                {
                    findVehicle = VehicleSystem.getVehicleByPlate(vehicleIdOrPlate);

                    if (findVehicle == null)
                    {
                        int? parseId = CommandUtils.tryParse(vehicleIdOrPlate);

                        if (parseId == null)
                        {
                            CommandUtils.errorSay(player, "Vehicle was not found.");
                            return;
                        }

                        findVehicle = VehicleSystem.getVehicleById((int)parseId, null, false);
                    }
                }

                if (findVehicle != null)
                {
                    DbVehicle findVehicleData = findVehicle.getData();

                    if (findVehicleData == null) return;

                    findVehicleData.vehicle_fuel = 100;

                    findVehicle.saveVehicleData(findVehicleData, true);

                    ChatUtils.formatConsolePrint($"{userData.admin_name} refilled {findVehicleData.vehicle_id}'s fuel level to 100.");
                    AdminUtils.staffSay(player, $"You refilled vehicle with id {findVehicleData.vehicle_id}.");

                    uiHandling.sendNotification(player, $"~r~You refuelled vehicle with id {findVehicleData.vehicle_id}", false);
                }
            }
        }

        [Command("emptyfuel", "~r~/emptyfuel [currentVehicle|id|plate]")]
        public void adminEmptyVehicleFuel(Player player, string vehicleIdOrPlate = null)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                Vehicle findVehicle = null;

                if (vehicleIdOrPlate == null && player.IsInVehicle)
                {
                    findVehicle = player.Vehicle;
                }
                else if (!player.IsInVehicle && vehicleIdOrPlate == null)
                {
                    CommandUtils.errorSay(player, "Select the correct parameters (/emptyfuel [currentVehicle|id|plate]) or enter a vehicle to use this command.");
                    return;
                }

                if (findVehicle == null)
                {
                    findVehicle = VehicleSystem.getVehicleByPlate(vehicleIdOrPlate);

                    if (findVehicle == null)
                    {
                        int? parseId = CommandUtils.tryParse(vehicleIdOrPlate);

                        if (parseId == null)
                        {
                            CommandUtils.errorSay(player, "Vehicle was not found.");
                            return;
                        }

                        findVehicle = VehicleSystem.getVehicleById((int)parseId, null, false);
                    }
                }

                if (findVehicle != null)
                {
                    DbVehicle findVehicleData = findVehicle.getData();

                    if (findVehicleData == null) return;

                    findVehicleData.vehicle_fuel = 0;

                    findVehicle.saveVehicleData(findVehicleData, true);

                    ChatUtils.formatConsolePrint($"{userData.admin_name} emptied vehicle {findVehicleData.vehicle_id}'s fuel tank.");
                    AdminUtils.staffSay(player, $"You emptied vehicle with id {findVehicleData.vehicle_id}'s fuel tank.");

                    uiHandling.sendNotification(player, $"~r~You emptied vehicle with id {findVehicleData.vehicle_id}'s fuel tank.", false);
                }

            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("banchar", "~r~/banchar [characterName]", Alias = "bancharacter", GreedyArg = true)]
        public void banCharacter(Player player, string characterName)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                bool bannedCharacter = AdminUtils.banCharacter(characterName);

                if (bannedCharacter)
                {
                    ChatUtils.formatConsolePrint($"{userData.admin_name} banned character {characterName}");
                    AdminUtils.staffSay(player, "You banned character " + characterName + "!");
                }
                else
                {
                    CommandUtils.errorSay(player, "Specified character was not found.");
                }
            }
        }

        [Command("unbanchar", "~r~/unbanchar [characterName]", Alias = "unbancharacter", GreedyArg = true)]
        public void unbanCharacter(Player player, string characterName)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                bool hasUnBanCharacter = AdminUtils.unBanCharacter(characterName);

                if (hasUnBanCharacter)
                {
                    ChatUtils.formatConsolePrint($"{userData.admin_name} unbanned character {characterName}");
                    AdminUtils.staffSay(player, "You unbanned character " + characterName + "!");
                }
                else
                {
                    CommandUtils.errorSay(player, "Specified character ban was not found.");
                }

            }
        }

        [Command("setvplate", "~r~/setvplate [plate]")]
        public void setVPlate(Player player, string numberplate)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_HeadAdmin))
            {
                if (!player.IsInVehicle)
                {
                    CommandUtils.errorSay(player, "You must be in a vehicle to use this command.");
                    return;
                }

                Vehicle pVeh = player.Vehicle;
                DbVehicle vehData = pVeh.getData();
                string formattedPlate = numberplate.ToUpper();

                if (vehData != null)
                {
                    using (DefaultDbContext dbContext = new DefaultDbContext())
                    {
                        DbVehicle findVeh = dbContext.vehicles
                            .Where(veh => veh.numberplate == formattedPlate)
                            .FirstOrDefault();

                        if (findVeh != null)
                        {
                            CommandUtils.errorSay(player, "There is already a vehicle with this plate.");
                            return;
                        }

                        vehData.numberplate = formattedPlate;
                        pVeh.NumberPlate = formattedPlate;

                        dbContext.Update(vehData);
                        dbContext.SaveChanges();

                        pVeh.setVehicleData(vehData);

                        ChatUtils.formatConsolePrint($"{userData.admin_name} has set {vehData.vehicle_id}'s license plate to {formattedPlate}");
                        AdminUtils.staffSay(player, $"You have set vehicle #{vehData.vehicle_id}'s license plate to {formattedPlate}");
                    }
                }
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("gotoc", "~r~/gotoc [x] [y] [z]")]
        public void teleportToCoords(Player player, double x, double y, double z)
        {
            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                player.Position = new Vector3(x, y, z);

                AdminUtils.staffSay(player, $"Teleported to vector {x} {y} {z}");
            }
        }

        [Command("giveamoney", "~r~/giveamoney [nameOrId] [moneyAmount]")]
        public void giveAdminMoney(Player player, string nameOrId, long amount)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);
                if (findPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }

                DbCharacter charData = findPlayer.getPlayerCharacterData();

                charData.money_amount += amount;

                findPlayer.setPlayerCharacterData(charData, false, true);

                ChatUtils.formatConsolePrint($"{userData.admin_name} gave {charData.character_name} {amount.ToString("C")}.");
                AdminUtils.staffSay(player, $"You gave {charData.character_name} {ChatUtils.moneyGreen}{amount.ToString("C")}{AdminUtils.staffSuffixColour} their total money level is at {ChatUtils.moneyGreen}${charData.money_amount.ToString("C")}");
                AdminUtils.staffSay(findPlayer, $"You have been given {ChatUtils.moneyGreen}{amount.ToString("C")}{AdminUtils.staffSuffixColour} from Admin {userData.admin_name}");
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("removeamoney", "~r~/removeamoney [nameOrId] [moneyAmount]")]
        public void removeAdminMoney(Player player, string nameOrId, long amount)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin)
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);
                if (findPlayer == null)
                {
                    CommandUtils.notFound(player);
                    return;
                }
                DbCharacter charData = findPlayer.getPlayerCharacterData();

                if (charData.money_amount - amount < 0)
                {
                    CommandUtils.errorSay(player, "You cannot set money amount below zero. Target's current money amount " + charData.money_amount.ToString("C"));
                    return;
                }

                charData.money_amount -= amount;
                findPlayer.setPlayerCharacterData(charData, false, true);

                ChatUtils.formatConsolePrint($"{userData.admin_name} removed {amount.ToString("C")} from {charData.character_name}.");
                AdminUtils.staffSay(player, $"You removed {ChatUtils.moneyGreen}${amount.ToString("C")}{AdminUtils.staffSuffixColour} from {charData.character_name} their total money level is at {ChatUtils.moneyGreen}{charData.money_amount.ToString("C")}");
                AdminUtils.staffSay(findPlayer, $"You had {ChatUtils.moneyGreen}${amount.ToString("C")}{AdminUtils.staffSuffixColour} removed from you by Admin {userData.admin_name}");
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("slap", "~r~/slap [nameOrId] [units]")]
        public void slapPlayer(Player player, string nameOrId, int units)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status > (int)AdminRanks.Admin_HeadAdmin || userData.adminDuty)
            {
                if (units > 8000 || units < 0)
                {
                    CommandUtils.errorSay(player, "Enter a valid unit amount between 0 and 800.");
                    return;
                }

                Player findP = CommandUtils.getPlayerFromNameOrId(nameOrId);

                if (findP != null)
                {
                    User targetUserData = findP.getPlayerAccountData();

                    if (targetUserData.adminDuty)
                    {
                        CommandUtils.errorSay(player, "You cannot apply this command for on duty admins.");
                        return;
                    }

                    if (findP.isImmuneTo(player)) return;

                    DbCharacter charData = findP.getPlayerCharacterData();

                    if (charData != null)
                    {
                        if (findP.IsInVehicle)
                        {
                            findP.WarpOutOfVehicle();
                        }

                        findP.Position = new Vector3(findP.Position.X, findP.Position.Y, findP.Position.Z + units);
                        findP.Health -= 5;

                        ChatUtils.formatConsolePrint($"{userData.admin_name} slapped {charData.character_name} for {units} units.");
                        AdminUtils.staffSay(player, $"You slapped {charData.character_name} for {units} units");

                        uiHandling.sendNotification(player, $"~r~You slapped {charData.character_name} for {units}", false);
                    }
                }
                else AdminUtils.playerNotFound(player);
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("slay", "~r~/slay [nameOrId]")]
        public void slayCommand(Player player, string nameOrId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Player findPlayer = CommandUtils.getPlayerFromNameOrId(nameOrId);
                DbCharacter findPlayerCharData = findPlayer.getPlayerCharacterData();

                if (findPlayer != null && findPlayerCharData != null)
                {
                    User targetUserData = findPlayer.getPlayerAccountData();

                    if (targetUserData.adminDuty)
                    {
                        CommandUtils.errorSay(player, "You cannot use this command with on duty admins.");
                        return;
                    }

                    if (findPlayer.isImmuneTo(player)) return;


                    DeathEvent.respawnAtHospital(findPlayer);
                    AdminUtils.staffSay(findPlayer, $"You were slain by {userData.admin_name}.");
                    AdminUtils.staffSay(player, $"You slayed {findPlayerCharData.character_name}.");

                    uiHandling.sendNotification(player, $"~r~You slayed {findPlayerCharData.character_name}", false);
                    uiHandling.sendNotification(findPlayer, $"~r~You have been slain by {userData.admin_name}", false);
                }
                else AdminUtils.playerNotFound(player);
            }
        }

        [Command("delcorpse", "~r~/delcorpse [corpseId]")]
        public void deleteCorpse(Player player, int corpseId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                Corpse findCorpse = DeathEvent.corpses
                    .Where(corpse => corpse.corpseId == corpseId)
                    .FirstOrDefault();

                if (findCorpse != null)
                {
                    DeathEvent.removeCorpse(findCorpse);
                    AdminUtils.staffSay(player, "You removed corpse with id " + corpseId);
                }
                else CommandUtils.errorSay(player, "Corpse ID is invalid.");

            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("amarker", "~r~/amarker [text]", GreedyArg = true)]
        public void adminMarker(Player player, string text)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                if (AdminMarker.getAllByAccount(userData.account_id) > _maxAdminMarkers)
                {
                    CommandUtils.errorSay(player, $"You already have the max amount of admin markers ({_maxAdminMarkers}). Use /rmamark or /rmamarks");
                    return;
                }

                if (!AuthUtils.validateNick(text))
                {
                    CommandUtils.errorSay(player, "Certain special characters are not allowed within admin markers.");
                    return;
                }

                AdminMarker newMarker = AdminMarker.add(text, player.Position, userData.account_id);
                AdminUtils.staffSay(player, "Created a new admin marker #" + newMarker.admin_marker_id);
            }
        }

        [Command("delfdo", "~r~/delfdo [fdoId]")]
        public void deleteFdo(Player player, int fdoId)
        {
            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                bool wasDeleted = FloatingDo.deleteById(fdoId);

                if (wasDeleted)
                {
                    AdminUtils.staffSay(player, "Floating do with id #" + fdoId + " was deleted");
                }
                else
                {
                    AdminUtils.staffSay(player, "Floating do with that id wasn't found.");
                }
            }
        }

        [Command("rmamark", "~r~/rmamark [adminMarkId]")]
        public void rmarmar(Player player, int markId)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                if (AdminMarker.getAllByAccount(userData.account_id) == 0)
                {
                    CommandUtils.errorSay(player, $"You haven't created any admin markers.");
                    return;
                }

                if (AdminMarker.deleteById(markId))
                {
                    AdminUtils.staffSay(player, "Admin Marker deleted");
                }
                else
                {
                    AdminUtils.staffSay(player, $"Admin marker with id {markId} was not found");
                }
            }
        }

        [Command("rmamarks", "~r~/rmamarks")]
        public void rmarmars(Player player)
        {
            User userData = player.getPlayerAccountData();

            if (player.checkUserData((int)AdminRanks.Admin_Moderator))
            {
                if (AdminMarker.getAllByAccount(userData.account_id) == 0)
                {
                    CommandUtils.errorSay(player, $"You haven't created any admin markers.");
                    return;
                }

                AdminMarker.deleteAllByAccount(userData.account_id);
                AdminUtils.staffSay(player, "Deleted all admin markers associated with your account.");
            }
        }

        [Command("makeped", "~r~/makeped [pedName]")]
        public void makePed(Player player, string pedName)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status == (int)AdminRanks.Admin_Developer)
            {
                NAPI.Ped.CreatePed(NAPI.Util.GetHashKey(pedName), player.Position, 0, true, true, true);
                AdminUtils.staffSay(player, $"You spawned in a ped {ChatUtils.yellow}{pedName}{ChatUtils.White}");

                uiHandling.sendNotification(player, $"~r~You spawned in a ped ~y~{pedName}", false);
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("makeobj", "~r~/makeobj [objName] [rot]")]
        public void makeObject(Player player, string objName, double rot = 0)
        {
            User userData = player.getPlayerAccountData();

            if (userData.admin_status == (int)AdminRanks.Admin_Developer)
            {
                NAPI.Object.CreateObject(NAPI.Util.GetHashKey(objName), player.Position, new Vector3(0, 0, rot), 255);
                AdminUtils.staffSay(player, $"You spawned in a object {ChatUtils.yellow}{objName}{ChatUtils.White}");

                uiHandling.sendNotification(player, $"~r~You spawned in a ped ~y~{objName}", false);
            }
            else AdminUtils.sendNoAuth(player);
        }

        [Command("getdispname")]
        public void getVehiclesDisplayName(Player player)
        {
            if(player.checkUserData((int)AdminRanks.Admin_Developer))
            {
                if(player.IsInVehicle)
                {
                    try
                    {
                        using (StreamReader sr = new StreamReader(directory + "vehicleData.json"))
                        {
                            Dictionary<string, dynamic> vehicleData = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(sr.ReadToEnd());

                            foreach (KeyValuePair<string, dynamic> item in vehicleData)
                            {
                                long compareModel = long.Parse(item.Key);

                                if(compareModel == player.Vehicle.Model)
                                {
                                    Console.WriteLine("Vehicle data : " + JsonConvert.SerializeObject(item));
                                }
                            }
                        }
                    }
                    catch
                    {
                    }
                }
            }

        }
    }
}
