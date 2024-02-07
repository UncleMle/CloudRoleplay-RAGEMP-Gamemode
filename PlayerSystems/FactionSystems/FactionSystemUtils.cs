using CloudRP.PlayerSystems.Character;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.FactionSystems
{
    public class FactionVehSpawn
    {
        public int garageId { get; set; }
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
        public int[] general { get; set; }
        public int[] uniforms { get; set; }
        public string[] vehicles { get; set; }
        public string[] weapons { get; set; }
    }

    public class DbFactionRank
    {
        public int faction { get; set; }
        public int rankId { get; set; }
    }

    public class FactionBlip
    {
        public string blipName { get; set; }
        public int blipType { get; set; }
        public byte blipColour { get; set; }
        public Vector3 blipPos { get; set; }
    }

    public class TrackVehicle
    {
        public string numberPlate { get; set; }
        public Vector3 position { get; set; }
        public int remoteId { get; set; }
        public int blipType { get; set; }
        public float heading { get; set; }
    }
}
