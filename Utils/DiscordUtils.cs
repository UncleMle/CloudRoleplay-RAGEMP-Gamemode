using CloudRP.AntiCheat;
using CloudRP.Character;
using CloudRP.Database;
using Discord;
using GTANetworkAPI;
using Integration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CloudRP.Utils
{
    public class DiscordUtils : Script
    {
        public static CharacterConnection getJoinLog(string nameOrId, long unixTime)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                string characterName = string.Join("_", nameOrId.Split(" "));

                List<CharacterConnection> getAllResults = dbContext.server_connections.Where(connection => connection.character_name == characterName).ToList();

                if (getAllResults.Count == 0)
                {
                    int? playerId = CommandUtils.tryParse(nameOrId);

                    if (playerId == null) return null;

                    getAllResults = dbContext.server_connections.Where(connection => connection.player_id == playerId).ToList();
                }


                if (getAllResults.Count < 2) return null;

                CharacterConnection firstEntry = getAllResults[0];
                CharacterConnection lastEntry = getAllResults[getAllResults.Count - 1];

                return unixTime >= firstEntry.unix && unixTime <= lastEntry.unix ? firstEntry : null;
            }
        }

        public static string getSplicedArgument(string[] args)
        {
            string message = string.Join(" ", args);
            message = message[(message.Split()[0].Length + 1)..];

            return message;
        }

        public static void creationConnection(Player player, DbCharacter character, LogCreation creationType)
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                CharacterConnection joinLog = new CharacterConnection
                {
                    character_id = character.character_id,
                    character_name = character.character_name,
                    connection_type = (int)creationType,
                    player_id = player.Id,
                    unix = CommandUtils.generateUnix()
                };

                dbContext.server_connections.Add(joinLog);
                dbContext.SaveChanges();
            }
        }

        public static bool checkArgs(string[] args, string cmdName, int requiredLength = 2, string missing = "")
        {
            if (args.Length < requiredLength)
            {
                missingArgs(cmdName, missing);
                return false;
            }

            return true;
        }

        public static async Task missingArgs(string commandName, string missingArgs)
        {
            EmbedBuilder builder = new EmbedBuilder()
            {
                Color = Discord.Color.Red,
                Description = "Missing arguments " + "[" + missingArgs + "]",
                Title = $" Missing potential arguments in command {commandName} :("
            };

            await DiscordIntegration.SendEmbed(DiscordSystem.DiscordSystems.staffChannel, builder);
        }

        public static async Task mentionUser(ulong userId)
        {
            DiscordIntegration.SendMessage(DiscordSystem.DiscordSystems.staffChannel, Discord.MentionUtils.MentionUser(userId), false);
        }
    }

    public enum LogCreation
    {
        Join = 1,
        Leave = 0
    }

    public class Command
    {
        public Action action;
        public string name;
        public string description;
    }
}
