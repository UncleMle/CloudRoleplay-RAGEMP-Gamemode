using CloudRP.Admin;
using CloudRP.Authentication;
using CloudRP.Database;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerData
{
    public static class PlayerExtensions
    {
        public static int getId(this Player player)
        {
            int id = -1;

            if(PlayersData.getPlayerAccountData(player) != null)
            {
                id = PlayersData.getPlayerAccountData(player).account_id;
            } 

            return id;
        }
        
        public static int getAdmin(this Player player)
        {
            int adminStatus = -1;

            if(PlayersData.getPlayerAccountData(player) != null)
            {
                adminStatus = PlayersData.getPlayerAccountData(player).admin_status;
            } 

            return adminStatus;
        }

        public static void banPlayer(this Player banPlayer, int time, User adminUserData, User banPlayerUserData, string reason)
        {
            long minuteSeconds = time * 60;
            long issueDateUnix = CommandUtils.generateUnix();
            long lift_unix_time = time == -1 ? -1 : CommandUtils.generateUnix() + minuteSeconds;

            Ban ban = new Ban
            {
                account_id = banPlayerUserData.account_id,
                admin = adminUserData.admin_name,
                ban_reason = reason,
                ip_address = banPlayer.Address,
                lift_unix_time = lift_unix_time,
                social_club_id = banPlayer.SocialClubId,
                social_club_name = banPlayer.SocialClubName,
                client_serial = banPlayer.Serial,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                issue_unix_date = issueDateUnix,
                username = banPlayerUserData.username
            };

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findAccount = dbContext.accounts.Find(banPlayerUserData.account_id);

                if (findAccount != null)
                {
                    findAccount.ban_status = 1;
                    findAccount.auto_login = 0;
                    dbContext.Update(findAccount);
                }

                dbContext.Add(ban);
                dbContext.SaveChanges();
            }

            banPlayer.setPlayerToBanScreen(ban);
        }

        public static Ban checkPlayerIsBanned(this Player player)
        {
            Ban returnBanData = null;

            try
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    returnBanData = dbContext.bans.Where(ban =>
                            ban.client_serial == player.Serial ||
                            ban.social_club_name == player.SocialClubName ||
                            ban.social_club_id == player.SocialClubId ||
                            ban.ip_address == player.Address)
                        .FirstOrDefault();

                    if (returnBanData != null && returnBanData.lift_unix_time < CommandUtils.generateUnix() && returnBanData.lift_unix_time != -1)
                    {
                        Account findUserAccount = dbContext.accounts.Find(returnBanData.account_id);

                        if (findUserAccount != null)
                        {
                            findUserAccount.ban_status = 0;
                            dbContext.accounts.Update(findUserAccount);
                        }

                        dbContext.bans.Remove(returnBanData);
                        dbContext.SaveChanges();
                        returnBanData = null;
                    }
                }
            }
            catch
            {
            }

            return returnBanData;
        }

        public static bool isImmuneTo(this Player target, Player player)
        {
            User targetData = PlayersData.getPlayerAccountData(target);
            User playerData = PlayersData.getPlayerAccountData(player);

            if (targetData != null && playerData != null && targetData.admin_status >= (int)AdminRanks.Admin_Developer && targetData.account_id != playerData.account_id)
            {
                return true;
            } else if(targetData.account_id != playerData.account_id)
            {
                CommandUtils.errorSay(player, "This player is immune to this command!");
            }
            return false;
        }

        public static void setPlayerToBanScreen(this Player player, Ban banData)
        {
            player.Dimension = Auth._startDimension;
            PlayersData.flushUserAndCharacterData(player);
            player.TriggerEvent("client:loginCameraStart");
            uiHandling.pushRouterToClient(player, Browsers.BanPage);

            uiHandling.handleObjectUiMutation(player, MutationKeys.BanData, banData);
        }

        public static bool checkUserData(this Player player, int adminRank, bool checkAduty = true)
        {
            User userData = PlayersData.getPlayerAccountData(player);

            if (userData != null && userData.admin_status >= adminRank || checkAduty && userData.adminDuty)
            {
                return true;
            }
            
            AdminUtils.sendNoAuth(player);
            return false;
        }
    }
}
