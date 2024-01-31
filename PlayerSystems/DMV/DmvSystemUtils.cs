using CloudRP.PlayerSystems.Character;
using GTANetworkAPI;
using System.Collections.Generic;

namespace CloudRP.PlayerSystems.DMV
{
    public class DmvLicenseCourse
    {
        public int courseId {  get; set; }
        public Licenses license { get; set; }
        public List<Vector3> stops { get; set; }
        public long finishWithin_seconds { get; set; }
        public int coursePrice { get; set; }
        public float vehicleSpawnRot { get; set; }
        public Vector3 vehicleSpawn { get; set; }
        public string vehicleName { get; set; }
    }

    public class DmvLicensePlayer
    {
        public DmvLicenseCourse course { get; set; }
        public int courseLevel { get; set; }
        public bool courseFinished { get; set; }
    }
    
    public class DmvLicenseVehicle
    {
        public int characterOwnerId { get; set; }
        public DmvLicenseCourse course { get; set; }
    }
}
