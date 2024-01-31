using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Character
{
    public static class PlayerExtensions
    {
        public static void addAlicense(this Player player, Licenses license)
        {
            List<Licenses> licenses = player.getAllLicenses();
            DbCharacter character = player.getPlayerCharacterData();
            
            if (licenses == null || character == null) return;

            if(licenses.Contains(license)) return;

            licenses.Add(license);

            character.character_license_data = JsonConvert.SerializeObject(licenses);

            player.setPlayerCharacterData(character, false, true);
        }

        public static List<Licenses> getAllLicenses(this Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return null;

            List<Licenses> licenses = new List<Licenses>();

            if (character.character_license_data != null)
            {
                licenses = JsonConvert.DeserializeObject<List<Licenses>>(character.character_license_data);
            }

            return licenses;
        }

    }
}
