using CloudRP.Admin;
using CloudRP.Authentication;
using CloudRP.Character;
using CloudRP.Database;
using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.Utils
{
    internal class AdminUtils : Script
    {
        public static string staffPrefix = "!{red}[Staff System]!{white} ";

        public static void sendNoAuth(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[Not Authorized]!{white} " + "you are not authorized to use this command.");
        }

        public static void sendMessageToAllStaff(string message)
        {
            Dictionary<Player, User> onlineStaff = gatherStaff();

            foreach (KeyValuePair<Player, User> entry in onlineStaff)
            {
                Player recievingStaff = entry.Key;

                staffSay(recievingStaff, message);
            }
        }

        public static User getAcBanAdmin()
        {
            User user = new User
            {
                accountId = -1,
                adminName = "[Anti-Cheat]",
                username = "Anti-Cheat",
            };

            return user;
        }

        public static Dictionary<Player, User> gatherStaff()
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();
            Dictionary<Player, User> onlineStaff = new Dictionary<Player, User>();


            foreach(Player entry in onlinePlayers)
            {
                User userData = PlayersData.getPlayerAccountData(entry);
                if (userData != null && userData.adminLevel > (int)AdminRanks.Admin_None)
                {
                    onlineStaff.Add(entry, userData);
                }
            }

            return onlineStaff;
        }

        public static string getColouredAdminRank(User user)
        {
            string adminRank = RankList.adminRanksList[user.adminLevel];
            string adminRankColour = "!{" + RankList.adminRanksColours[user.adminLevel] + "}";


            return $"{adminRankColour}[{adminRank}] " + "!{white}";
        }

        public static void staffSay(Player player, string message)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, staffPrefix + message);
        }

        public static void playerNotFound(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, staffPrefix + "Player was not found.");
        }

        public static bool checkUserData(Player player, User userData)
        {
            if(userData.adminLevel > (int)AdminRanks.Admin_SeniorSupport && userData.adminDuty || userData.adminLevel > (int)AdminRanks.Admin_HeadAdmin)
            {
                return true;
            } else
            {
                sendNoAuth(player);
                return false;
            }
        }

        public static void setPed(Player player, string pedName)
        {
            uint hash = NAPI.Util.GetHashKey(pedName);
            NAPI.Player.SetPlayerSkin(player, hash);
        }

        public static Ban checkPlayerIsBanned(Player player)
        {
            Ban returnBanData = null;
         
            try
            {
                using (DefaultDbContext dbContext = new DefaultDbContext())
                {
                    returnBanData = dbContext.bans.Where(ban => ban.client_serial == player.Serial || ban.social_club_name == player.SocialClubName || ban.social_club_id == player.SocialClubId || ban.ip_address == player.Address).FirstOrDefault();

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
            } catch
            {

            }
            
            return returnBanData;
        }

        public static void setPlayerToBanScreen(Player player, Ban banData)
        {
            player.Dimension = Auth._startDimension;
            PlayersData.flushUserAndCharacterData(player);
            player.TriggerEvent("client:loginCameraStart");
            uiHandling.pushRouterToClient(player, Browsers.BanPage);

            uiHandling.handleObjectUiMutation(player, MutationKeys.BanData, banData);
        }

        public static void banAPlayer(int time, User adminUserData, User banPlayerUserData, Player banPlayer, string reason)
        {
            long minuteSeconds = time * 60;
            long issueDateUnix = CommandUtils.generateUnix();
            long lift_unix_time = time == -1 ? -1 : CommandUtils.generateUnix() + minuteSeconds;

            Ban ban = new Ban
            {
                account_id = banPlayerUserData.accountId,
                admin = adminUserData.adminName,
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
                Account findAccount = dbContext.accounts.Find(banPlayerUserData.accountId);

                if (findAccount != null)
                {
                    findAccount.ban_status = 1;
                    findAccount.auto_login = 0;
                    dbContext.Update(findAccount);
                }

                dbContext.Add(ban);
                dbContext.SaveChanges();
            }

            setPlayerToBanScreen(banPlayer, ban);
        }

        public static bool unbanViaUsername(string username)
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account account = dbContext.accounts.Where(acc => acc.username == username).FirstOrDefault();   
                Ban ban = dbContext.bans.Where(findBan => findBan.username == username).FirstOrDefault();

                if (account != null && ban != null)
                {
                    dbContext.bans.Remove(ban);
                    account.ban_status = 0;

                    dbContext.SaveChanges();
                    return true;
                }
            }

            return false;
        }

        public static void sendToAdminsHandlingReport(Report report, string message, Player excludePlayer)
        {
            Dictionary<Player, User> adminsHandling = report.adminsHandling;

            foreach(KeyValuePair<Player, User> entry in adminsHandling)
            {
                if(entry.Key != null && !entry.Key.Equals(excludePlayer))
                {
                    NAPI.Chat.SendChatMessageToPlayer(entry.Key, message);
                }
            }

        }
    }

    public class Report
    {
        public User userData { get; set; }
        public DbCharacter characterData { get; set; }
        public Player playerReporting { get; set; }
        public ulong discordChannelId { get; set; }
        public string description { get; set; }
        public Dictionary<Player, User> adminsHandling { get; set; } = new Dictionary<Player, User>();
        public List<ulong> discordAdminsHandling { get; set; } = new List<ulong>();
        public long timeCreated { get; set; } = CommandUtils.generateUnix();
        public bool closed { get; set; }
        public ulong discordRefId { get; set; }
    }    
    
    public class SharedReport
    {
        public int playerId { get; set; }
        public int reportId { get; set; }
        public string description { get; set; }
    }
}
