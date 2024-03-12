using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Authentication;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Watchdog
{
    public class WatchdogSystem : Script
    {
        private static Dictionary<int, List<WatchTransaction>> transactionWatcher = new Dictionary<int, List<WatchTransaction>>();

        private WatchdogSystem()
        {
            Auth.onCharacterLogin += addNewWatchDog;
            Main.playerDisconnect += handleDisconnect;
        }

        private static void handleDisconnect(Player player)
        {
            if (player.getPlayerCharacterData() == null) return;

            transactionWatcher.Remove(player.getPlayerCharacterData().character_id);
        }

        private static void addNewWatchDog(Player player, DbCharacter character)
        {
            if(transactionWatcher.ContainsKey(character.character_id)) transactionWatcher.Remove(character.character_id);

            transactionWatcher.Add(character.character_id, new List<WatchTransaction>());
        }

        public static void handleTransactionAdd(Player player, WatchTransaction transaction)
        {

        }

    }
}
