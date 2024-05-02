using System;
using System.Collections.Generic;
using System.Text;
using static CloudRP.PlayerSystems.FactionSystems.PoliceSystems.CriminalCharges;

namespace CloudRP.PlayerSystems.FactionSystems.PoliceSystems
{
    public class CriminalCharges
    {
        public static Dictionary<int, Charge> charges = new Dictionary<int, Charge>
        {
            { 43, new Charge { chargeCode = "V-1", chargeName = "First Degree Speeding", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 3, chargeDescription = "Driving 1-30 km/hr over the speed limit." } },
            { 44, new Charge { chargeCode = "V-2", chargeName = "Second Degree Speeding", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 4, chargeDescription = "Driving 31-60 km/hr over the speed limit." } },
            { 45, new Charge { chargeCode = "V-3", chargeName = "Third Degree Speeding", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 5, chargeDescription = "Driving 61 km/hr over the speed limit." } },
        };

        public static List<Charge> convertChargeIdListToCharges(int[] chargeIds)
        {
            List<Charge> playerCharges = new List<Charge>();

            foreach (int chargeId in chargeIds)
            {
                if (charges.ContainsKey(chargeId)) playerCharges.Add(charges[chargeId]);
            }

            return playerCharges;
        } 

        public class Modifier
        {
            public ChargeType chargeType { get; set; }
            public ChargeClass modifierClass { get; set; }
            public int jailTimeMin { get; set; }
            public int jailTimeMax { get; set; }
            public int fineMin { get; set; }
            public int fineMax { get; set; }
        }

        public enum ChargeType
        {
            Infraction,
            Misdemeanor,
            Felony
        }

        public enum ChargeClass
        {
            I,
            II,
            III
        }
    }

    public class Charge
    {
        public string chargeName { get; set; }
        public ChargeType chargeType { get; set; }
        public ChargeClass chargeClass { get; set; }
        public string chargeDescription { get; set; }
        public string chargeCode { get; set; }
        public int points { get; set; }
        public Modifier chargeModifier { get; set; }
    }
}
