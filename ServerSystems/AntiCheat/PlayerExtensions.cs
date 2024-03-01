using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Authentication;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.AntiCheat
{
    public static class PlayerExtensions
    {
        public static int _maxVecRange = 5;

        public static bool checkForLoginCheat(this Player player)
        {
            bool isAtLogin = false;
            Vector3 pos = player.Position;
            Vector3 defaultLogin = PlayersData.defaultLoginPosition;

            if (checkVecRange(pos, defaultLogin) && (player.getPlayerCharacterData() == null || player.getPlayerAccountData() == null) && player.Dimension != Auth._startDimension)
            {
                isAtLogin = true;
            }

            return isAtLogin;
        }

        public static bool checkVecRange(Vector3 vector, Vector3 compareVec)
        {
            bool exceeded = false;

            if (vector.X - compareVec.X > _maxVecRange || vector.Y - compareVec.Y > _maxVecRange || vector.Z - compareVec.Z > _maxVecRange)
            {
                exceeded = true;
            }

            return exceeded;
        }

        public static void sleepClientAc(this Player player, int timeMiliseconds = 4500)
        {
            Console.WriteLine($"Player [{player.Id}] ac client was slept for {timeMiliseconds} miliseconds.");
            player.TriggerEvent("client:ac:sleepClient", timeMiliseconds);
        }
    }
}
