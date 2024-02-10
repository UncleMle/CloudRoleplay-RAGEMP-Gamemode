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
        public int blipColour { get; set; }
    }

    public class DispatchCall
    {
        public string callDesc { get; set; }
        public string characterName { get; set; }
        public Vector3 location { get; set; }
        public Factions forFaction { get; set; }
        public List<string> units { get; set; } = new List<string>();
        public long createdAt { get; set; }
    }
}
