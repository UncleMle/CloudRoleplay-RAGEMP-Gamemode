using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Utils;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.Character
{
    public static class PlayerExtensions
    {
        public static void addAlicense(this Player player, Licenses license)
        {
            List<PlayerLicense> licenses = player.getAllLicenses();
            DbCharacter character = player.getPlayerCharacterData();
            
            if (licenses == null || character == null) return;

            if (licenses.Where(l => l.license.Equals(license)).Count() > 0) return;

            licenses.Add(new PlayerLicense
            {
                givenAt = CommandUtils.generateUnix(),
                license = license,
                valid = true
            });

            character.character_license_data = JsonConvert.SerializeObject(licenses);

            player.setPlayerCharacterData(character, false, true);
        }

        public static List<PlayerLicense> getAllLicenses(this Player player)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return null;

            List<PlayerLicense> licenses = new List<PlayerLicense>();

            if (character.character_license_data != null)
            {
                licenses = JsonConvert.DeserializeObject<List<PlayerLicense>>(character.character_license_data);
            }

            return licenses;
        }

        public static void suspendLicense(this Player player, Licenses license)
        {
            List<PlayerLicense> licenses = player.getAllLicenses();
            DbCharacter character = player.getPlayerCharacterData();

            if (licenses == null || character == null) return;

            PlayerLicense selectLicense = licenses.Where(l => l.license.Equals(license)).FirstOrDefault();

            if(selectLicense != null)
            {
                selectLicense.valid = false;
            }

            character.character_license_data = JsonConvert.SerializeObject(licenses);
        }

    }
}
