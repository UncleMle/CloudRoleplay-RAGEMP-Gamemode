using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;
using System.Transactions;

namespace CloudRP.PlayerSystems.AnimationSync
{
    public class AnimSync : Script
    {
        public static readonly string _handsUpAnimIdentifer = "anim:hasHandsUp";
        public static readonly string _crouchingAnimIdentifier = "anim:isCrouching";
        public static readonly string _animationDataKey = "player:animationData:key";

        #region Remote Events
        [RemoteEvent("server:anim:startHandsUp")]
        public void startHandsUpAnim(Player player, bool animState)
        {
            DbCharacter charData = player.getPlayerCharacterData();

            if (charData != null && charData.injured_timer <= 0)
            {
                player.SetCustomData(_handsUpAnimIdentifer, animState);
                player.SetCustomSharedData(_handsUpAnimIdentifer, animState);
            }
        }

        [RemoteEvent("server:anim:toggleCrouching")]
        public void togglePlayerCrouching(Player player)
        {
            if (!player.GetData<bool>(_crouchingAnimIdentifier))
            {
                player.SetCustomData(_crouchingAnimIdentifier, true);
                player.SetCustomSharedData(_crouchingAnimIdentifier, true);
            }
            else
            {
                player.ResetData(_crouchingAnimIdentifier);
                player.ResetSharedData(_crouchingAnimIdentifier);
            }
        }
        #endregion

        #region Global Methods
        public static void playSyncAnimation(Player player, int flag, string dict, string anim, int duration = -1)
        {
            player.SetCustomSharedData(_animationDataKey, new AnimationData
            {
                anim = anim,
                flag = flag,
                dict = dict
            });

            if(duration != -1)
            {
                NAPI.Task.Run(() =>
                {
                    stopSyncAnimation(player);
                }, delayTime: duration);
            }
        }

        public static void stopSyncAnimation(Player player)
        {
            player.ResetSharedData(_animationDataKey);
        }

        #endregion
    }
}
