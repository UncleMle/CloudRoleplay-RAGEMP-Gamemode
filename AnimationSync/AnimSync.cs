using CloudRP.Character;
using CloudRP.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.AnimationSync
{
    public class AnimSync : Script
    {
        public static string _handsUpAnimIdentifer = "anim:hasHandsUp";

        [RemoteEvent("server:anim:startHandsUp")]
        public void startHandsUpAnim(Player player, bool animState)
        {
            DbCharacter charData = PlayersData.getPlayerCharacterData(player);

            if(charData != null)
            {
                player.SetData(_handsUpAnimIdentifer, animState);
                player.SetSharedData(_handsUpAnimIdentifer, animState);
            }
        }

    }
}
