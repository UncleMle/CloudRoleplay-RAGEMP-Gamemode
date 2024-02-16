using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Admin;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.GeneralCommands
{
    class Events : Script
    {
        public static int afkMaxCalcNum = 10;
        public static readonly string _afkKeyIdentifier = "playerAfkData";
        public static readonly string _ameTextIdentifier = "playerAmeTextMessage";
        public static readonly string _tabbedOutIdentifier = "playerIsTabbedOut";
        public static long kickTime_seconds = 40;

        [RemoteEvent("server:beginAfk")]
        public static void beginAfk(Player player)
        {
            User user = player.getPlayerAccountData();
            DbCharacter characterData = player.getPlayerCharacterData();

            if (user != null && characterData != null && !user.adminDuty && user.admin_status < (int)AdminRanks.Admin_Founder && characterData.injured_timer == 0)
            {
                Random ran = new Random();
                int numOne = ran.Next(1, afkMaxCalcNum);
                int numTwo = ran.Next(1, afkMaxCalcNum);

                player.SetCustomData(_afkKeyIdentifier, new AfkData
                {
                    afkStartPos = player.Position,
                    calcAnswer = numOne + numTwo,
                });

                NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.afk + $"Enter the answer to {numOne} + {numTwo} or you will be kicked for afk in {kickTime_seconds} seconds.");

                NAPI.Task.Run(() =>
                {
                    if (player != null && player.GetData<AfkData>(_afkKeyIdentifier) != null)
                    {
                        player.Kick("Kicked for afk by system.");
                    }
                }, kickTime_seconds * 1000);
            }
        }

        [RemoteEvent("server:createAmeText")]
        public static void createAmeText(Player player, string text)
        {
            DbCharacter characterData = player.getPlayerCharacterData();
            if (characterData == null) return;

            if (text == null)
            {
                player.ResetData(_ameTextIdentifier);
                player.ResetSharedData(_ameTextIdentifier);
                return;
            }

            if (player.GetData<string>(_ameTextIdentifier) != null)
            {
                player.ResetData(_ameTextIdentifier);
                player.ResetSharedData(_ameTextIdentifier);
            }

            player.SetData(_ameTextIdentifier, text);
            player.SetSharedData(_ameTextIdentifier, text);
        }

        [RemoteEvent("server:setPlayerTabbedOut")]
        public static void setPlayerTabbedOut(Player player, bool state )
        {
            player.SetCustomData(_tabbedOutIdentifier, state);
            player.SetCustomSharedData(_tabbedOutIdentifier, state);
        }
    }
}
