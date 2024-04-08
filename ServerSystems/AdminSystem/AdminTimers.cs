using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using System.Timers;

namespace CloudRP.ServerSystems.AdminSystem.AdminTimers
{
    internal class AdminTimers : Script
    {
        private static int punishmentInterval_seconds = 10;

        public AdminTimers()
        {
            Timer timer = new Timer
            {
                AutoReset = true,
                Enabled = true,
                Interval = punishmentInterval_seconds * 1000
            };

            timer.Elapsed += (elapsed, source) =>
            {
                NAPI.Task.Run(() =>
                {
                    checkForAdminJail();
                    checkForBan();
                });
            };

            ChatUtils.startupPrint($"Started {punishmentInterval_seconds} second admin punishment check.");
        }

        public void checkForBan()
        {
            NAPI.Pools.GetAllPlayers().ForEach(player =>
            {
                User user = player.getPlayerAccountData();

                if (user == null) return;

                Ban ban = player.checkPlayerIsBanned();

            if (ban != null && !player.GetData<bool>(PlayerSystems.PlayerData.PlayerExtensions._atBanScreenIdentifier))
                {
                    player.setPlayerToBanScreen(ban);
                }
            });
        }

        public void checkForAdminJail()
        {
            NAPI.Pools.GetAllPlayers().ForEach(player =>
            {
                User user = player.getPlayerAccountData();

                if (user == null || player.getPlayerCharacterData() == null) return;

                User dbEntity = Account.getById(user.account_id);

                if (dbEntity == null) return;

                if(user.admin_jail_time == 0 && dbEntity.admin_jail_time != 0)
                {
                    player.adminJail(dbEntity.admin_jail_time, dbEntity.admin_jail_reason);
                }
            });
        }
    }
}
