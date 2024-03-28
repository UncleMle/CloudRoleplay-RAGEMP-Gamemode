using CloudRP.PlayerSystems.Character;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionUniforms
    {
        public static List<FactionUniform> factionUniforms = new List<FactionUniform>
        {
            new FactionUniform
            {
                uniformName = "Patrol Officer",
                uniformId = 1,
                faction = Factions.LSPD,
                uniform = new CharacterClothing
                {
                    torso = 11,
                    top = 186,
                    leg = 35,
                    shoes = 25,
                    undershirt = 99,
                    armor = 9
                }
            },
            new FactionUniform
            {
                uniformName = "Patrol Supervisor",
                uniformId = 2,
                faction = Factions.LSPD,
                uniform = new CharacterClothing
                {
                    top = 8,
                    undershirt = 15,
                }
            },
            new FactionUniform
            {
                uniformName = "Patrol Sherrif",
                uniformId = 3,
                faction = Factions.SASD,
                uniform = new CharacterClothing
                {
                    top = 8,
                    undershirt = 15,
                }
            },
            new FactionUniform
            {
                uniformName = "Smart Dress",
                uniformId = 4,
                faction = Factions.Weazel_News,
                uniform = new CharacterClothing
                {
                    top = 10,
                    undershirt = 15,
                }
            },
            new FactionUniform
            {
                uniformName = "Ems",
                uniformId = 5,
                faction = Factions.LSMD,
                uniform = new CharacterClothing
                {
                    top = 15,
                    undershirt = 15,
                }
            },
            new FactionUniform
            {
                uniformName = "Jr. Mechanic",
                uniformId = 6,
                faction = Factions.Bayview,
                uniform = new CharacterClothing
                {
                    top = 10,
                    undershirt = 15,
                }
            },
            new FactionUniform
            {
                uniformName = "Jr. Mechanic",
                uniformId = 7,
                faction = Factions.LS_Customs,
                uniform = new CharacterClothing
                {
                    top = 10,
                    undershirt = 15,
                }
            },
            new FactionUniform
            {
                uniformName = "Sr. Driver",
                uniformId = 8,
                faction = Factions.DCC,
                uniform = new CharacterClothing
                {
                    top = 10,
                    undershirt = 15,
                }
            }
        };

    }
}
