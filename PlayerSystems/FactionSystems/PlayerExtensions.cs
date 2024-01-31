using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public static class PlayerExtensions
    {
        public static List<Factions> getPlayerFactions(this Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return null;

            return JsonConvert.DeserializeObject<List<Factions>>(character.character_faction_data);
        }

        public static void addPlayerFaction(this Player player, Factions faction)
        {
            DbCharacter character = player.getPlayerCharacterData();
            if (character == null) return;

            List<Factions> factions = new List<Factions>();

            if(character.character_faction_data != null)
            {
                factions = JsonConvert.DeserializeObject<List<Factions>>(character.character_faction_data);
            }

            if (factions.Contains(faction)) return;

            factions.Add(faction);

            character.character_faction_data = JsonConvert.SerializeObject(factions);
            player.setPlayerCharacterData(character, false, true);
        }

    }
}
