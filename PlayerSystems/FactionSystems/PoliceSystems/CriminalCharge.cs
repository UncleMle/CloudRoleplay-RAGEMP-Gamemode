using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems.PoliceSystems
{
    public class CriminalCharge : BaseEntity
    {
        [Key]
        public int criminal_charge_id { get; set; }

        [Required]
        public int owner_id { get; set; }
        public string criminal_charge_ids { get; set; }
        public int totalTime { get; set; }
        public int totalFine { get; set; }
    }

    public class CriminalChargeSystem : Script
    {
        public static void addPlayerCharge(int characterId, int[] charges, int totalTime, int totalFine)
        {
            CriminalCharge charge = new CriminalCharge
            {
                criminal_charge_ids = JsonConvert.SerializeObject(charges),
                owner_id = characterId,
                totalTime = totalTime,
                totalFine = totalFine
            };

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.criminal_charges.Add(charge);
                dbContext.SaveChanges();
            }

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                DbCharacter character = p.getPlayerCharacterData();

                if(character != null && character.character_id == characterId)
                {
                    character.criminalCharges.Add(charge);
                    p.setPlayerCharacterData(character);
                }
            });
        }
        
        public static void removePlayerCharge(int characterId, int chargeId)
        {
            CriminalCharge charge = null;
            
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                charge = dbContext.criminal_charges.Find(chargeId);

                if (charge != null) dbContext.criminal_charges.Remove(charge);

                dbContext.SaveChanges();
            }

            NAPI.Pools.GetAllPlayers().ForEach(p =>
            {
                DbCharacter character = p.getPlayerCharacterData();

                if(character != null && character.character_id == characterId)
                {
                    charge = character.criminalCharges.Where(c => c.criminal_charge_id == chargeId).FirstOrDefault();
                    if (charge == null) return;

                    character.criminalCharges.Remove(charge);
                    p.setPlayerCharacterData(character);
                }
            });
        }
    }

    public class CriminalChargeUiData
    {
        public int chargeId { get; set; }
        public List<Charge> charges { get; set; } = new List<Charge>();
        public int totalTime { get; set; }
        public int totalFine { get; set; }
    }
}
