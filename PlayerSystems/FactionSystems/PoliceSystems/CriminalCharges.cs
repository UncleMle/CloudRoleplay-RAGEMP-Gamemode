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

            // Infractions 
            { 1, new Charge { chargeCode = "I-1", chargeName = "Disturbing the Peace", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, chargeDescription = "Disruptful behaviour that disturbs the peace, and could provoke an aggressive response." } },
            { 2, new Charge { chargeCode = "I-2", chargeName = "Petty Theft", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, chargeDescription = "Theft of items that value below or equal to $1,000." } },
            { 3, new Charge { chargeCode = "I-3", chargeName = "Prostitution", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, chargeDescription = "Soliciting money, information or favors in exchange for sexual favors." } },
            { 4, new Charge { chargeCode = "I-4", chargeName = "Vandalism", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, chargeDescription = "The act of intentionally damaging, destroying or defacing another person(s) property." } },


            // Misdemeanors 
            { 5, new Charge { chargeCode = "M-0", chargeName = "Failure to pay a fine", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "Failing to pay a fine within three days of receiving it." } },
            { 6, new Charge { chargeCode = "M-1", chargeName = "Resisting Arrest", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "Resisting arrest or detainment by opposing, obstructing or hindering an LEO." } },
            { 7, new Charge { chargeCode = "M-2", chargeName = "Evading Arrest", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.II, chargeDescription = "Evading arrest or detainment by fleeing from a person he [or she] knows is an LEO attempting to lawfully arrest or detain them." } },
            { 8, new Charge { chargeCode = "M-3", chargeName = "Assault", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.II, chargeDescription = "Willful and unlawful use of force or violence upon another person(s)." } },
            { 9, new Charge { chargeCode = "M-4", chargeName = "Criminal Possession of Stolen Property", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.II, chargeDescription = "Knowingly possessing stolen property, that has been acquired through theft, fraud or purchasing." } },
            { 10, new Charge { chargeCode = "M-5", chargeName = "Criminal Threats", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.II, chargeDescription = "Threatening the life of bodily harm onto another person(s), relatives or others." } },
            { 11, new Charge { chargeCode = "M-6", chargeName = "Destruction of Property", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.II, chargeDescription = "Causing damages to private property exceeding $1,000." } },
            { 12, new Charge { chargeCode = "M-7", chargeName = "Fabricating Evidence", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "A person falsifying or fabricating evidence of any kind and using it to prosecute or defend in a trial or hearing." } },
            { 13, new Charge { chargeCode = "M-8", chargeName = "Failure to Comply", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.III, chargeDescription = "Failing to comply with a lawful command by a law enforcement officer." } },
            { 14, new Charge { chargeCode = "M-9", chargeName = "False Imprisonment", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "False imprisonment is the unlawful violation of the personal liberty of another." } },
            { 15, new Charge { chargeCode = "M-10", chargeName = "False Reporting", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.III, chargeDescription = "Reporting of false information or a crime that is fabricated." } },
            { 16, new Charge { chargeCode = "M-11", chargeName = "Indecent exposure", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.III, chargeDescription = "The act of intentionally exposing one's genitals in a public area." } },
            { 17, new Charge { chargeCode = "M-12", chargeName = "Misuse of a Government Hotline", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.III, chargeDescription = "Misusing a government emergency hotline by providing false, frivolous, or misleading information." } },
            { 18, new Charge { chargeCode = "M-13", chargeName = "Providing false information", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.III, chargeDescription = "Giving false information, answers, or other documents to a law enforcement officer." } },
            { 19, new Charge { chargeCode = "M-14", chargeName = "Trespassing", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.II, chargeDescription = "Enters knowingly or remains unlawfully in or upon government premises or private property without authorisation." } },


            // Felonies
            { 20, new Charge { chargeCode = "F-0", chargeName = "Assault with a Weapon", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, chargeDescription = "Attacking a person with a weapon." } },
            { 21, new Charge { chargeCode = "F-1", chargeName = "Grand Theft Auto", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, chargeDescription = "Taking possession of a motor vehicle that is not your own without the consent of the owner." } },
            { 22, new Charge { chargeCode = "F-4", chargeName = "Prison Break", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, chargeDescription = "Attempt to escape prison/jail." } },
            { 23, new Charge { chargeCode = "F-2", chargeName = "Kidnapping", chargeType = ChargeType.Felony, chargeClass = ChargeClass.II, chargeDescription = "The action of abducting someone and holding them captive." } },
            { 24, new Charge { chargeCode = "F-3", chargeName = "Robbery", chargeType = ChargeType.Felony, chargeClass = ChargeClass.II, chargeDescription = "The action of taking property unlawfully from a person or place by force or threat of force." } },
            { 25, new Charge { chargeCode = "F-5", chargeName = "Murder", chargeType = ChargeType.Felony, chargeClass = ChargeClass.II, chargeDescription = "Killing another person." } },
            { 26, new Charge { chargeCode = "F-6", chargeName = "Armed Robbery", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, chargeDescription = "Seizing of personal property in the possession of another, from their person or immediate presence, and against their will, accomplished by means of force or fear, using a weapon." } },
            { 27, new Charge { chargeCode = "F-7", chargeName = "Extortion", chargeType = ChargeType.Felony, chargeClass = ChargeClass.III, chargeDescription = "A person who is obtaining property or other consideration from another, with their consent, or the obtaining of an official act of a public officer, induced by a wrongful use of force or fear." } },
            { 28, new Charge { chargeCode = "F-8", chargeName = "Bribery", chargeType = ChargeType.Felony, chargeClass = ChargeClass.III, chargeDescription = "The offering or receiving of money or an object of monetary value to a government employee with the intent to engage in an illegal activity." } },
            { 29, new Charge { chargeCode = "F-9", chargeName = "Impersonating Emergency Response Personnel", chargeType = ChargeType.Felony, chargeClass = ChargeClass.III, chargeDescription = "The act of fraudulently impersonating a police officer or EMS operative, or inducing the belief that he or she is a police officer or EMS operative, including but not limited to wearing their respective uniforms." } },
            { 30, new Charge { chargeCode = "F-10", chargeName = "Tampering with Evidence", chargeType = ChargeType.Felony, chargeClass = ChargeClass.III, chargeDescription = "The unlawful act of an unauthorized person or officer knowingly contaminating or otherwise destroying evidence." } },
       

            // Weapons Charges
            { 31, new Charge { chargeCode = "W-0", chargeName = "Brandishing of a Firearm", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "Drawing or exhibiting of a weapon." } },
            { 32, new Charge { chargeCode = "W-1", chargeName = "Possession of Illegal weapon modifications", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "Possession of an illegal weapon modification." } },
            { 33, new Charge { chargeCode = "W-2", chargeName = "Sale of a Firearm", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, chargeDescription = "The act of a person selling a weapon illegally." } },
            { 34, new Charge { chargeCode = "W-3", chargeName = "Possession of an Illegal Firearm", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, chargeDescription = "Possession of an unregistered firearm." } },
            { 35, new Charge { chargeCode = "W-4", chargeName = "Criminal Use of a Firearm", chargeType = ChargeType.Felony, chargeClass = ChargeClass.II, chargeDescription = "The act of a person possessing an unregistered firearm in the commission of a crime." } },
            { 36, new Charge { chargeCode = "W-5", chargeName = "Negligent discharge of a firearm", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.III, chargeDescription = "Use of a firearm that is negligent, demonstrating a lack of proper regard or attention to safety, that does not injure, maim or kill another person(s)." } },
            { 37, new Charge { chargeCode = "W-6", chargeName = "Possession of an Unregistered Handgun", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "Possession of an unregistered handgun or possessing a handgun without a permit." } },


            // Drug Charges
            { 38, new Charge { chargeCode = "D-0", chargeName = "Possession of Controlled Substance", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, chargeDescription = "A person in possession of controlled substance." } },
            { 39, new Charge { chargeCode = "D-1", chargeName = "Manufacture of a Controlled Substance", chargeType = ChargeType.Felony, chargeClass = ChargeClass.II, chargeDescription = "The act of a person actively or with intent to engage in the manufacturing of a controlled substance." } },
            { 40, new Charge { chargeCode = "D-2", chargeName = "Sale of Controlled Substance", chargeType = ChargeType.Felony, chargeClass = ChargeClass.II, chargeDescription = "The act of a person attempting to engage in the sale of a controlled substance." } },
            { 41, new Charge { chargeCode = "D-3", chargeName = "Possession of Controlled Substance with Intent to Distribute", chargeType = ChargeType.Felony, chargeClass = ChargeClass.III, chargeDescription = "A person whom is holding an amount too large to be for only personal use, presence of packaging materials, large amounts of money and communications from customers." } },


            // Vehicle charges
            { 42, new Charge { chargeCode = "V-0", chargeName = "Unlicensed Operation of a Vehicle", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 2, chargeDescription = "Operating a motor-vehicle without a valid license or documentation." } },
            { 43, new Charge { chargeCode = "V-1", chargeName = "First Degree Speeding", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 3, chargeDescription = "Driving 1-30 km/hr over the speed limit." } },
            { 44, new Charge { chargeCode = "V-2", chargeName = "Second Degree Speeding", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 4, chargeDescription = "Driving 31-60 km/hr over the speed limit." } },
            { 45, new Charge { chargeCode = "V-3", chargeName = "Third Degree Speeding", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 5, chargeDescription = "Driving 61 km/hr over the speed limit." } },
            { 46, new Charge { chargeCode = "V-4", chargeName = "Street Racing", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, points = 10, chargeDescription = "The act of knowingly and willingly participating or organizing a street race, drag race, or speed contests on public roads, streets, or highways." } },
            { 47, new Charge { chargeCode = "V-5", chargeName = "Driving While Intoxicated or Under Influence", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.I, points = 10, chargeDescription = "The act of a person driving a motor vehicle under the influence of alcohol, narcotics, or pharmaceuticals that detrimentally affect mental or physical capabilities." } },
            { 48, new Charge { chargeCode = "V-6", chargeName = "Reckless Evasion", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, points = 15, chargeDescription = "Fleeing or attempting to elude pursuing police officers in a vehicle while driving in a willful or wanton disregard for the safety of persons or property." } },
            { 49, new Charge { chargeCode = "V-7", chargeName = "Hit and Run", chargeType = ChargeType.Felony, chargeClass = ChargeClass.I, points = 15, chargeDescription = "Leaving a scene of a motor vehicle accident, as an involved party." } },
            { 50, new Charge { chargeCode = "V-8", chargeName = "Distracted Driving", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, points = 3, chargeDescription = "The unlawful use of a cellphone or any other object that may distract you while operating a motor vehicle." } },
            { 51, new Charge { chargeCode = "V-9", chargeName = "Failure to Maintain Lane", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.I, points = 2, chargeDescription = "Failing to maintain your driving lane or crossing a continuous central line." } },
            { 52, new Charge { chargeCode = "V-10", chargeName = "Illegal Parking", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, points = 2, chargeDescription = "Parking your vehicle in any unauthorized parking area." } },
            { 53, new Charge { chargeCode = "V-11", chargeName = "Failure to Yield to Emergency Vehicles", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, points = 2, chargeDescription = "Failing to yield or pull over when an emergency vehicle is trying to pass with their emergency lights." } },
            { 54, new Charge { chargeCode = "V-12", chargeName = "Failure to Obey Traffic Control Devices", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, points = 2, chargeDescription = "Failure to obey traffic control devices (such as stop signs, traffic lights, traffic signages, and other traffic control devices)." } },
            { 55, new Charge { chargeCode = "V-13", chargeName = "Illegal U Turn", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, points = 1, chargeDescription = "Making a prohibited turn at an intersection or other road section." } },
            { 56, new Charge { chargeCode = "V-14", chargeName = "Impeding Traffic", chargeType = ChargeType.Infraction, chargeClass = ChargeClass.II, points = 4, chargeDescription = "Operating a motor-vehicle with the intent to stop or impede the normal flow of traffic." } },
            { 57, new Charge { chargeCode = "V-15", chargeName = "Reckless Driving", chargeType = ChargeType.Misdemeanor, chargeClass = ChargeClass.II, points = 10, chargeDescription = "A person who drives a motor vehicle in willful or wanton disregard for the safety of persons or property." } }
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
