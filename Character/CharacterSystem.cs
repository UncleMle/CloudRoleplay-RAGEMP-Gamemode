using CloudRP.Database;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using System.Timers;

namespace CloudRP.Character
{
    internal class CharacterSystem : Script
    {
        private static Timer saveCharactersTimer;
        private static int _timerInterval = 5000;

        [ServerEvent(Event.ResourceStart)]
        public void onResourceStart()
        {
            beginSaveInterval();
        }

        void beginSaveInterval()
        {
            Chat.charSysPrint("Began saving characters in main thread.");
            NAPI.Task.Run(() =>
            {
                saveCharactersTimer = new Timer();
                saveCharactersTimer.Interval = _timerInterval;
                saveCharactersTimer.Elapsed += saveCharacterPositions;

                saveCharactersTimer.AutoReset = true;
                saveCharactersTimer.Enabled = true;
            });
        }

        public static void saveCharacterPositions(object source, ElapsedEventArgs e)
        {
            List<Player> onlinePlayers = NAPI.Pools.GetAllPlayers();

            foreach (Player player in onlinePlayers)
            {
                saveCharacterPosition(player);

            }
        }

        [ServerEvent(Event.PlayerDisconnected)]
        public void onPlayerDisconect(Player player)
        {
            saveCharacterPosition(player);
        }

        public static void saveCharacterPosition(Player player)
        {
            User userData = PlayersData.getPlayerAccountData(player);
            DbCharacter characterData = PlayersData.getPlayerCharacterData(player);

            if (userData == null || characterData == null) return;

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                characterData.position_x = player.Position.X;
                characterData.position_y = player.Position.Y;
                characterData.position_z = player.Position.Z;

                dbContext.characters.Update(characterData);
                dbContext.SaveChanges();
            }
        }
    }
}
