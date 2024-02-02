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
                uniformId = 2,
                faction = Factions.LSPD,
                uniform = new CharacterClothing
                {
                    top = 26
                }
            }
        };

    }
}
