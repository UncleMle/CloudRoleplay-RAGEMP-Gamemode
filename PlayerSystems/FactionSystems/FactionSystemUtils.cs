using CloudRP.PlayerSystems.Character;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionVehSpawn
    {
        public float vehicleRot { get; set; }
        public Vector3 spawnPos { get; set; }
    }

    public class FactionUniform
    {
        public string uniformName { get; set; }
        public int uniformId { get; set; }
        public Factions faction { get; set; }
        public CharacterClothing uniform {  get; set; }
    }

    public class RankPermissions
    {
        public int[] uniforms { get; set; }
        public string[] vehicles { get; set; }
        public string[] weapons { get; set; }
    }

    public class DbFactionRank
    {
        public int faction { get; set; }
        public int rankId { get; set; }
    }
}
