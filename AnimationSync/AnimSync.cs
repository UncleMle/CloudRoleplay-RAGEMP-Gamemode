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
            DbCharacter charData = player.getPlayerCharacterData();

            if(charData != null && charData.injured_timer <= 0)
            {
                player.SetCustomData(_handsUpAnimIdentifer, animState);
                player.SetCustomSharedData(_handsUpAnimIdentifer, animState);
            }
        }

    }
}
