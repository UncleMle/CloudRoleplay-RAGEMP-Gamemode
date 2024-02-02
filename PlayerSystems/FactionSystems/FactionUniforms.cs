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
                    top = 26,
                    undershirt = 15,
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
            }
        };

    }
}
