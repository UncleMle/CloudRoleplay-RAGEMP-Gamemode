using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using GTANetworkAPI;

namespace CloudRP.PlayerSystems.VoiceSystem
{
    class VoiceSystem : Script
    {
        [RemoteEvent("server:voiceAddVoiceListener")]
        public void addListener(Player player, Player target)
        {
            if (target != null && Vector3.Distance(player.Position, target.Position) < 60)
            {
                player.EnableVoiceTo(target);
            }
        }

        [RemoteEvent("server:voiceRemoveVoiceListener")]
        public void removeListener(Player player, Player target)
        {
            if (target != null)
            {
                player.DisableVoiceTo(target);
            }
        }

        [RemoteEvent("server:togVoiceStatus")]
        public void toggleVoiceStatus(Player player, bool toggle)
        {
            DbCharacter charData = player.getPlayerCharacterData();

            if (charData != null)
            {
                charData.voiceChatState = toggle;
                player.setPlayerVoiceStatus(toggle);
            }

        }

    }
}
