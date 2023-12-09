using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralCommands
{
    class Events : Script
    {
        public static int afkMaxCalcNum = 10;
        public static string _afkKeyIdentifier = "playerAfkData";
        public static long kickTime_seconds = 40;

        [RemoteEvent("server:beginAfk")]
        public static void beginAfk(Player player)
        {
            User user = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (user != null && characterData != null && !user.adminDuty && characterData.injured_timer == 0)
            {
                Random ran = new Random();
                int numOne = ran.Next(1, afkMaxCalcNum);
                int numTwo = ran.Next(1, afkMaxCalcNum);

                player.SetData(_afkKeyIdentifier, new AfkData
                {
                    afkStartPos = player.Position,
                    calcAnswer = numOne + numTwo,
                });

                NAPI.Chat.SendChatMessageToPlayer(player, ChatUtils.afk + $"Enter the answer to {numOne} + {numTwo} or you will be kicked for afk in {kickTime_seconds} seconds.");

                NAPI.Task.Run(() =>
                {
                    if (player != null && player.GetData<AfkData>(_afkKeyIdentifier) != null)
                    {
                        player.Kick("Kicked by AFK script.");
                    }
                }, kickTime_seconds * 1000);
            }
        }
    }
}
