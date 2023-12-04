using System;
using Discord;
using Discord.WebSocket;
using GTANetworkAPI;
using System.Threading.Tasks;
using Discord.Rest;
using System.Collections.Generic;
using CloudRP.Utils;
using CloudRP.DiscordSystem;
using CloudRP.Admin;
using System.Linq;
using System.Threading.Channels;
using CloudRP.Authentication;
using Newtonsoft.Json;

namespace Integration
{
    public class DiscordIntegration : Script
    {
        static DiscordSocketClient discord = null;
        private static string m_strToken = null;
        private static string m_strBotGameName = null;
        private static ActivityType m_eActivityType = ActivityType.Playing;
        private static UserStatus m_eUsterStatus = UserStatus.Online;
        public static Emoji closeReaction = new Emoji("❌");
        public static Emoji joinReaction = new Emoji("✅");


        public static async Task SetUpBotInstance(string strToken, string strBotGameName = null, ActivityType eActivityType = ActivityType.CustomStatus, UserStatus eUserStatus = UserStatus.Online)
        {
            if (!IsSetupCompleted)
            {
                m_strToken = strToken;
                m_strBotGameName = strBotGameName;
                m_eActivityType = eActivityType;
                m_eUsterStatus = eUserStatus;

                await InitAsync();
                IsSetupCompleted = true;

                ChatUtils.discordSysPrint("Bot started throw intergration");
            }
            else
            {
                ThrowErrorMessage("You can only have one bot instance running. You can only call this method once.");
            }
        }

        private static async Task InitAsync()
        {
            if (!string.IsNullOrEmpty(m_strToken))
            {
                discord = new DiscordSocketClient();

                discord.Connected += OnReady;
                discord.MessageReceived += OnMessageReceived;
                discord.ReactionAdded += OnReactionRecieved;

                await discord.LoginAsync(TokenType.Bot, m_strToken).ConfigureAwait(true);
                await discord.StartAsync().ConfigureAwait(true);
            }
            else
            {
                ThrowErrorMessage("Object reference not set to an instance of an object\nUse the 'SetUpBotInstance' to provide your token to be able to start the bot");
            }
        }

        private static Task OnReactionRecieved(Cacheable<IUserMessage, ulong> reactData, ISocketMessageChannel channel, SocketReaction reaction)
        {
            if (IsSetupCompleted)
            {
                NAPI.Task.Run(async () =>
                {
                    try
                    {
                        if (g_lstSubscribedChannels.Contains(channel.Id))
                        {
                            IUserMessage mesg = await reactData.DownloadAsync();

                            Report validReport = AdminSystem.activeReports.Where(rep => rep.discordRefId == mesg.Id).FirstOrDefault();

                            if (validReport != null)
                            {
                                await DiscordSystems.handleReportReaction(validReport, mesg, reaction);
                                return;
                            } else
                            {
                                await removeAMessage(mesg.Id);
                            }
                        }
                    }
                    catch 
                    {
                        
                    }
                });

                Task task = Task.Run(() => { });

                return task;
            }
            return null;
        }

        private static Task OnMessageReceived(SocketMessage message)
        {
            if (IsSetupCompleted)
            {
                NAPI.Task.Run(() =>
                {
                    try
                    {
                        if (message.Author.IsBot) return;

                        Report findValidRep = AdminSystem.activeReports.Where(rep => rep.discordChannelId == message.Channel.Id).FirstOrDefault();

                        if (findValidRep != null)
                        {
                            DiscordSystems.handleReportChannelMessage(findValidRep, message);
                            return;
                        }

                        if (g_lstSubscribedChannels.Contains(message.Channel.Id))
                        {
                            if (message.Content.Length > 0)
                            {
                                string start = message.Content[..1];

                                if (DiscordSystems.discordPrefix != start) return;

                                string[] args = message.Content.Substring(1).Split(" ");

                                DiscordSystems.handleDiscordCommand(args, message.Author);
                            }
                        }
                    }
                    catch
                    {
                    }
                });

                Task task = Task.Run(() => { });

                return task;
            }
            return null;
        }

        public static async Task SendMessage(ulong discordChannelID, string strMessage, bool bStripMentions = true)
        {
            if (IsSetupCompleted)
            {
                try
                {
                    ISocketMessageChannel channel = (ISocketMessageChannel)discord.GetChannel(discordChannelID);

                    if (channel != null)
                    {
                        RestUserMessage msg = await channel.SendMessageAsync(bStripMentions ? CleanFromTags(strMessage) : strMessage).ConfigureAwait(true);
                    }
                    else
                    {
                        ThrowErrorMessage("Object reference not set to an instance of an object\nFailed to find a discord channel with the 'discordChannelID' you provided");
                        return;
                    }
                }
                catch
                {

                }
            }
        }        
        
        public static async Task createAReportChannel(Report report)
        {
            if(IsSetupCompleted)
            {
                try
                {
                    SocketGuild guild = discord.GetGuild(DiscordSystems.guildId);

                    RestTextChannel newChannel = await guild.CreateTextChannelAsync($"Report {AdminSystem.activeReports.IndexOf(report)}", tcp => tcp.CategoryId = DiscordSystems.reportCategory);
                    report.discordChannelId = newChannel.Id;
                    await newChannel.AddPermissionOverwriteAsync(guild.EveryoneRole, OverwritePermissions.DenyAll(newChannel));
                }
                catch
                {
                }
            }
        }       
        
        public static async Task removeAChannel(ulong channelId)
        {
            if(IsSetupCompleted)
            {
                try
                {
                    NAPI.Task.Run(async () =>
                    {
                        SocketGuildChannel socketGuildChannel = discord.GetChannel(channelId) as SocketGuildChannel;

                        if (socketGuildChannel != null)
                        {
                            await socketGuildChannel.DeleteAsync();
                        }
                    });
                }
                catch
                {

                }
            }
        }

        public static async Task removeAMessage(ulong messageId)
        {
            if (IsSetupCompleted)
            {
                try
                {
                    NAPI.Task.Run(async () =>
                    {
                        SocketTextChannel socketChannel = discord.GetChannel(DiscordSystems.staffChannel) as SocketTextChannel;

                        IMessage message = await socketChannel.GetMessageAsync(messageId);

                        if (message != null)
                        {
                            await message.DeleteAsync();
                        }
                    });
                }
                catch
                {

                }
            }
        }

        public static async Task SendMessageToUser(ulong discordId, string strMessage)
        {
            if (IsSetupCompleted)
            {
                try
                {

                    SocketUser user = discord.GetUser(discordId);

                    if (user != null)
                    {
                        await user.SendMessageAsync(strMessage).ConfigureAwait(true);
                    }
                    else
                    {
                        ThrowErrorMessage("Object reference not set to an instance of an object\nFailed to find a discord channel with the 'discordChannelID' you provided");
                    }
                }
                catch
                {

                }
            }
        }

        public static async Task SendEmbed(ulong discordChannelID, EmbedBuilder embed, Report report = null)
        {
            try
            {
                NAPI.Task.Run(async () =>
                {
                    ISocketMessageChannel channel = (ISocketMessageChannel)discord.GetChannel(discordChannelID);
                    if (channel != null)
                    {
                        IUserMessage msg = await channel.SendMessageAsync(null, false, embed.Build());

                        if (report != null)
                        {
                            IEmote[] reactions = { joinReaction, closeReaction };
                            msg.AddReactionsAsync(reactions);
                            report.discordRefId = msg.Id;
                        }
                    }
                    else
                    {
                        ThrowErrorMessage("Object reference not set to an instance of an object\nFailed to find a discord channel with the 'discordChannelID' you provided");
                    }
                });
            } catch
            {
            }
        }

        public static async Task flushOldReports()
        {
            if (!IsSetupCompleted) return;

            try
            {
                NAPI.Task.Run(async () =>
                {
                    SocketGuild guild = discord.GetGuild(DiscordSystems.guildId);

                    SocketCategoryChannel newChannel = guild.GetCategoryChannel(DiscordSystems.reportCategory);

                    foreach(SocketTextChannel channel in newChannel.Channels)
                    {
                        await channel.DeleteAsync();
                    }

                    ChatUtils.discordSysPrint("Flushed old reports.");
                });
            }
            catch
            {

            }
        }

        private static async Task OnReady()
        {
            await UpdateStatus(m_strBotGameName, m_eActivityType, m_eUsterStatus).ConfigureAwait(true);
        }

        public static async Task UpdateStatus(string strBotGameName, ActivityType eActivityType, UserStatus eUserStatus)
        {
            m_strBotGameName = strBotGameName;
            m_eActivityType = eActivityType;
            m_eUsterStatus = eUserStatus;

            Game game = new Game(m_strBotGameName, m_eActivityType);
            await discord.SetStatusAsync(m_eUsterStatus).ConfigureAwait(true);
            await discord.SetActivityAsync(game).ConfigureAwait(true);
        }


        public static bool RegisterChannelForListenting(ulong channelID)
        {
            if (g_lstSubscribedChannels.Contains(channelID))
            {
                ThrowErrorMessage("Couldn't add the channel to the list as it already exists there. Remove it or check the channel ID");
                return false;
            }

            ISocketMessageChannel channel = (ISocketMessageChannel)discord.GetChannel(channelID);
            if (channel != null)
            {
                g_lstSubscribedChannels.Add(channelID);
                return true;
            }
            else
            {
                ThrowErrorMessage("Object reference not set to an instance of an object\nDiscord channel not found. Can't add a null reference to the list of subscribed channels.");
            }

            return false;
        }


        public static bool RemoveChannelFromListening(ulong channelID)
        {
            if (g_lstSubscribedChannels.Contains(channelID))
            {
                g_lstSubscribedChannels.Remove(channelID);
                return true;
            }
            else
            {
                ThrowErrorMessage("Couldn't remove the channel from the list because it doesn't exist in it. Add it or check the channel ID");
            }

            return false;
        }

        private static string CleanFromTags(string strInput)
        {
            return strInput.Replace("@", "@‎‏‏‎ ‎");
        }

        private static void ThrowErrorMessage(string StrErrorMessage)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(StrErrorMessage);
            Console.ResetColor();
        }


        public static bool IsSetupCompleted { get; private set; } = false;
        private static List<ulong> g_lstSubscribedChannels = new List<ulong>();
    }
}