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

            if (character == null || character.character_faction_data == null) return null;

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

        public static bool isPartOfFaction(this Player player, Factions compareFaction, bool checkForDuty = false)
        {
            bool isPart = false;

            List<Factions> playerFactions = player.getPlayerFactions();
            DbCharacter character = player.getPlayerCharacterData();

            if(playerFactions != null && character != null && playerFactions.Contains(compareFaction))
            {
                if(checkForDuty && character.faction_duty_status != (int)compareFaction)
                {
                    uiHandling.sendPushNotifError(player, "You must be on faction duty to use this.", 6500);
                }

                if(checkForDuty && character.faction_duty_status == (int)compareFaction)
                {
                    isPart = true;
                }
                else if(!checkForDuty)
                {
                    isPart = true;
                }
            }

            Console.WriteLine("is part " + isPart);

            return isPart;
        }

    }
}
