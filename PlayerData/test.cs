using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerData
{
    class IPlayer : Player
    {
        public static IPlayer player;

        public IPlayer(NetHandle handle) : base(handle)
        {
            player = new Player(handle) as IPlayer;
        }
    }
}
