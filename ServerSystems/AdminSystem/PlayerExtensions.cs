using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.AntiCheat;
using CloudRP.ServerSystems.Authentication;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudRP.ServerSystems.Admin
{
    public static class PlayerExtensions
    {
        public static void setAdminDuty(this Player player, bool toggle)
        {
            User userData = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (userData != null && characterData != null && userData.admin_status > (int)AdminRanks.Admin_SeniorSupport)
            {
                userData.adminDuty = toggle;

                if (userData.admin_ped != "none")
                {
                    userData.showAdminPed = userData.adminDuty;
                }
                else
                {
                    userData.showAdminPed = false;
                }

                player.setPlayerAccountData(userData);

                if (userData.adminDuty)
                {
                    player.SetData(AdminSystem._adminLastPositionKey, player.Position);
                }
                else
                {
                    userData.isFlying = false;
                    player.TriggerEvent("admin:endFly");

                    if (userData.admin_ped != "none")
                    {
                        player.setCharacterModel(characterData.characterModel);
                        player.setCharacterClothes(characterData.characterClothing);
                    }
                }

                player.setPlayerAccountData(userData);
            }
        }

        public static void adminJail(this Player player, int time, string reason)
        {
            User user = player.getPlayerAccountData();

            if (user == null) return;

            if(user.adminDuty && user.admin_status <= (int)AdminRanks.Admin_HeadAdmin)
            {
                player.setAdminDuty(false);
            }

            user.admin_jail_time = time;
            user.admin_jail_reason = reason;

            player.setPlayerAccountData(user, true, true);

            if (AdminSystem.adminJailTimers.ContainsKey(user.account_id))
            {
                AdminSystem.adminJailTimers[user.account_id].Dispose();
                AdminSystem.adminJailTimers.Remove(user.account_id);
            }

            System.Timers.Timer removeTime = new System.Timers.Timer
            {
                AutoReset = true,
                Enabled = true,
                Interval = 10000
            };

            player.sleepClientAc();
            player.safeSetDimension((uint)player.Id + 1);
            player.Position = AdminSystem.adminJailLocation;
            AdminSystem.adminJailTimers.Add(user.account_id, removeTime);
            removeTime.Elapsed += (source, elapsed) => NAPI.Task.Run(() => AdminSystem.adminJailInterval(player));

            player.TriggerEvent("client:adminSystem:adminJail:start", time);
        }

        public static void endAdminJail(this Player player)
        {
            User user = player.getPlayerAccountData();

            if(user == null) return;

            AdminSystem.adminJailTimers[user.account_id].Dispose();
            AdminSystem.adminJailTimers.Remove(user.account_id);

            player.sleepClientAc();
            player.safeSetDimension(0);
            player.Position = PlayersData.defaultSpawnPosition;
            user.admin_jail_time = 0;
            player.setPlayerAccountData(user, false, true);
            player.TriggerEvent("client:adminSystem:adminJail:end");
        }

        public static void safeSetDimension(this Player player, uint dimension)
        {
            player.Dimension = dimension;

            player.SetData(AntiCheatSystem._safeDimensionChangingKey, true);
            
            NAPI.Task.Run(() =>
            {
                if (!NAPI.Player.IsPlayerConnected(player)) return;

                player.ResetData(AntiCheatSystem._safeDimensionChangingKey);
            }, 1500);
        }
    }
}
