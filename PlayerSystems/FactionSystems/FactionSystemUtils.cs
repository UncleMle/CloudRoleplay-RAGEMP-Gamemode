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
        public int uniformId { get; set; }
        public Factions faction { get; set; }
        public CharacterClothing uniform {  get; set; }
    }
}
