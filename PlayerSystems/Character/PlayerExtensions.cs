using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Logging;
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

        public static bool hasLicense(this Player player, Licenses license)
        {
            bool has = false;
            List<PlayerLicense> licenses = player.getAllLicenses();

            if(licenses.Where(l => l.license.Equals(license)).FirstOrDefault() != null)
            {
                has = true;
            }

            return has;
        }

        public static bool processPayment(this Player player, int amount, string recieveReason)
        {
            DbCharacter character = player.getPlayerCharacterData();
            bool completedTransation = false;

            if(character != null)
            {
                if((character.money_amount - amount) > 0)
                {
                    completedTransation = true;
                    character.money_amount -= amount;

                    player.setPlayerCharacterData(character, false, true);

                    ChatUtils.formatConsolePrint($"[Payment Process | Money] {character.character_name} has been charged ${amount.ToString("N0")} their balance is now at ${character.money_amount.ToString("N0")}.");

                    ServerLogging.addNewLog(character.character_id, "Payment Process | Money", $"{character.character_name} paid ${amount.ToString("N0")} with reason {recieveReason}", LogTypes.CashAndMoneyLog);
                }

            }

            return completedTransation;
        }
        
        public static bool processCashPayment(this Player player, int amount, string recieveReason)
        {
            DbCharacter character = player.getPlayerCharacterData();
            bool completedTransation = false;

            if(character != null)
            {
                if((character.money_amount - amount) > 0)
                {
                    completedTransation = true;
                    character.cash_amount -= amount;

                    player.setPlayerCharacterData(character, false, true);

                    ChatUtils.formatConsolePrint($"[Payment Process | Cash] {character.character_name} has been charged ${amount.ToString("N0")} their balance is now at ${character.money_amount.ToString("N0")}.");

                    ServerLogging.addNewLog(character.character_id, "Payment Process | Cash", $"{character.character_name} paid ${amount.ToString("N0")} with reason {recieveReason}", LogTypes.CashAndMoneyLog);
                }

            }

            return completedTransation;
        }
        
        public static bool addPlayerCash(this Player player, int amount, string reason)
        {
            DbCharacter character = player.getPlayerCharacterData();
            bool completedTransation = false;

            if(character != null)
            {
                completedTransation = true;
                character.cash_amount += amount;
                player.setPlayerCharacterData(character, false, true);

                ServerLogging.addNewLog(character.character_id, "Player Cash Added", $"{character.character_name} was given ${amount.ToString("N0")} with reason {reason}", LogTypes.CashAndMoneyLog);
            }

            return completedTransation;
        }
        
        public static bool addPlayerMoney(this Player player, int amount, string reason)
        {
            DbCharacter character = player.getPlayerCharacterData();
            bool completedTransation = false;

            if(character != null)
            {
                completedTransation = true;
                character.money_amount += amount;
                player.setPlayerCharacterData(character, false, true);

                ServerLogging.addNewLog(character.character_id, "Player Money Added", $"{character.character_name} was given ${amount.ToString("N0")} with reason {reason}", LogTypes.CashAndMoneyLog);
            }

            return completedTransation;
        }
        
        public static bool addPlayerSalary(this Player player, int amount, string reason)
        {
            DbCharacter character = player.getPlayerCharacterData();
            bool completedTransation = false;

            if(character != null)
            {
                completedTransation = true;
                character.salary_amount += amount;
                player.setPlayerCharacterData(character, false, true);

                ServerLogging.addNewLog(character.character_id, "Player Salary Added", $"{character.character_name} was given ${amount.ToString("N0")} with reason {reason}", LogTypes.CashAndMoneyLog);
            }

            return completedTransation;
        }

    }
}
