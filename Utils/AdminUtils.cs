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
        public static string staffPrefix = "!{red}[Staff]!{#ffa6a6} ";
        public static string staffSuffixColour = "!{#ffa6a6}";

        public static void sendNoAuth(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, "!{red}[Not Authorized]!{white} " + "you are not authorized to use this command.");
        }

        public static void sendMessageToAllStaff(string message, int rank = (int)AdminRanks.Admin_None, bool sendConsole = false)
        {
            Dictionary<Player, User> onlineStaff = gatherStaff();

            foreach (KeyValuePair<Player, User> entry in onlineStaff)
            {
                if(entry.Value.admin_status > rank)
                {
                    Player recievingStaff = entry.Key;
                    staffSay(recievingStaff, message);
                }
            }

            if(sendConsole)
            {
                ChatUtils.formatConsolePrint(message);
            }
        }

        public static bool unbanViaUsername(string username)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account account = dbContext.accounts
                    .Where(acc => acc.username == username)
                    .FirstOrDefault();

                Ban ban = dbContext.bans
                    .Where(findBan => findBan.username == username)
                    .FirstOrDefault();

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

        public static User getAcBanAdmin()
        {
            User user = new User
            {
                account_id = -1,
                admin_name = "[Anti-Cheat]",
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
                User userData = entry.getPlayerAccountData();
                DbCharacter characterData = entry.getPlayerCharacterData();
                if (characterData != null && userData != null && userData.admin_status > (int)AdminRanks.Admin_None)
                {
                    onlineStaff.Add(entry, userData);
                }
            }

            return onlineStaff;
        }

        public static string getColouredAdminRank(User user)
        {
            string adminRank = RankList.adminRanksList[user.admin_status];
            string adminRankColour = "!{" + RankList.adminRanksColours[user.admin_status] + "}";


            return $"{adminRankColour} {adminRank} " + ChatUtils.White;
        }

        public static void staffSay(Player player, string message)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, staffPrefix + message);
        }

        public static void playerNotFound(Player player)
        {
            NAPI.Chat.SendChatMessageToPlayer(player, staffPrefix + "Player was not found.");
        }

        public static void setPed(Player player, string pedName)
        {
            uint hash = NAPI.Util.GetHashKey(pedName);
            NAPI.Player.SetPlayerSkin(player, hash);
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

        public static Dictionary<Player, User> gatherAdminGroupAbove(AdminRanks adminRank)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();
            Dictionary<Player, User> adminGroup = new Dictionary<Player, User>();

            foreach(Player player in onlinePlayers)
            {
                User playerData = player.getPlayerAccountData();
                DbCharacter characterData = player.getPlayerCharacterData();

                if(playerData != null && characterData != null && playerData.admin_status > (int)adminRank)
                {
                    adminGroup.Add(player, playerData);
                }
            }

            return adminGroup;
        }

        public static bool banCharacter(string characterName)
        {
            string charName = CommandUtils.getCharName(characterName);

            bool wasBanned = false;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbCharacter findCharacter = dbContext.characters.Where(character => characterName.ToLower() == charName.ToLower()).FirstOrDefault(); 

                if(findCharacter != null)
                {
                    List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

                    Account findAccount = dbContext.accounts
                        .Where(acc => acc.account_id == findCharacter.owner_id)
                        .FirstOrDefault();

                    if(findAccount != null)
                    {
                        if(findAccount.admin_status < (int)AdminRanks.Admin_Developer)
                        {
                            foreach (Player p in onlinePlayers)
                            {
                                DbCharacter pCharData = p.getPlayerCharacterData();

                                if (pCharData != null && pCharData.character_id == findCharacter.character_id)
                                {
                                    staffSay(p, "Your character has been character banned.");

                                    p.Kick();
                                }
                            }

                            findCharacter.character_isbanned = 1;

                            dbContext.Update(findCharacter);
                            dbContext.SaveChanges();
                            wasBanned = true;
                        }
                    }
                } 
            }

            return wasBanned;
        }       
        
        public static bool unBanCharacter(string characterName)
        {
            string charName = CommandUtils.getCharName(characterName);

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbCharacter findCharacter = dbContext.characters.Where(character => characterName.ToLower() == charName).FirstOrDefault(); 

                if(findCharacter != null)
                {
                    findCharacter.character_isbanned = 0;
                    
                    dbContext.Update(findCharacter);
                    dbContext.SaveChanges();

                    return true;
                } else
                {
                    return false;
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
