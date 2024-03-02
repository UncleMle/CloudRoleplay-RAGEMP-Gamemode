using CloudRP.PlayerSystems.Character;
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
                if(!player.GetData<bool>(CharacterSystem.startedCharacterCreationKey)) isAtLogin = true;
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
           => player.TriggerEvent("client:ac:sleepClient", timeMiliseconds);

        public static void safeSetDimension(this Player player, uint dimension)
        {
            player.Dimension = dimension;

            player.SetData(AntiCheatSystem._safeDimensionChangingKey, true);

            NAPI.Task.Run(() =>
            {
                if (!NAPI.Player.IsPlayerConnected(player)) return;

                player.ResetData(AntiCheatSystem._safeDimensionChangingKey);
            }, 1500);
        }
        
        public static void safePutIntoVehicle(this Player player, Vehicle veh, int seatId)
        {
            player.sleepClientAc();
            player.SetIntoVehicle(veh, seatId);
        }
    }
}
