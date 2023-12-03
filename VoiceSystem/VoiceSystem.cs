﻿using CloudRP.Character;
using CloudRP.PlayerData;
using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.VoiceSystem
{
    class VoiceSystem : Script
    {
        [RemoteEvent("server:voiceAddVoiceListener")]
        public void addListener(Player player, Player target)
        {
            if(target != null)
            {
                player.EnableVoiceTo(target);
            }
        }
        
        [RemoteEvent("server:voiceRemoveVoiceListener")]
        public void removeListener(Player player, Player target)
        {
            if(target != null)
            {
                player.DisableVoiceTo(target);
            }
        }

        [RemoteEvent("server:togVoiceStatus")]
        public void toggleVoiceStatus(Player player, bool toggle)
        {
            DbCharacter charData = PlayersData.getPlayerCharacterData(player);

            if(charData != null)
            {
                charData.voiceChatState = toggle;
                PlayersData.setPlayerCharacterData(player, charData);
            }

        }

    }
}