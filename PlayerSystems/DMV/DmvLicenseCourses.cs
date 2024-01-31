using CloudRP.PlayerSystems.Character;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.DMV
{
    public class DmvLicenseCourses
    {
        public static List<DmvLicenseCourse> availableCourses = new List<DmvLicenseCourse>
        {
            new DmvLicenseCourse {
                courseId = 1,
                finishWithin_seconds = 600000,
                license = Licenses.Car,
                coursePrice = 60,
                vehicleName = "asbo",
                vehicleSpawn = new Vector3(780.4, -2980.3, 5.8),
                vehicleSpawnRot = 70.9f,
                stops = new List<Vector3>
                {
                    new Vector3(758.8, -2993.0, 5.8),
                    new Vector3(753.2, -2485.0, 20.1)
                }
            }
        };
    }
}
