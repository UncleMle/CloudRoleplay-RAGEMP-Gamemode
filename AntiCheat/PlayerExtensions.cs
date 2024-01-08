using CloudRP.Authentication;
using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.AntiCheat
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

            if(((vector.X - compareVec.X) > _maxVecRange) || ((vector.Y - compareVec.Y) > _maxVecRange) || ((vector.Z - compareVec.Z) > _maxVecRange))
            {
                exceeded = true;
            }

            return exceeded;
        }

    }
}
