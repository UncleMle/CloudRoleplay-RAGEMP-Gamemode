using CloudRP.PlayerSystems.Character;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
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
                    new Vector3(753.2, -2485.0, 20.1),
                    new Vector3(838.6, -1773.6, 29.1),
                    new Vector3(804.1, -1162.6, 28.8),
                    new Vector3(620.8, -373.3, 43.5),
                    new Vector3(333.5, -389.2, 45.3),
                    new Vector3(180.8, -797.4, 31.3),
                    new Vector3(392.2, -859.7, 29.3),
                    new Vector3(1150.6, -853.2, 54.8),
                    new Vector3(816.0, -1438.5, 27.3),
                    new Vector3(768.5, -2041.7, 29.2),
                    new Vector3(1092.0, -3330.0, 5.9),
                    new Vector3(806.9, -3110.0, 5.9),
                    new Vector3(765.0, -2992.0, 5.8)
                }
            },
            new DmvLicenseCourse {
                courseId = 2,
                finishWithin_seconds = 600000,
                license = Licenses.HeavyGoods,
                coursePrice = 145,
                vehicleName = "rubble",
                vehicleSpawn = new Vector3(775.6, -2947.3, 5.8),
                vehicleSpawnRot = -179.4f,
                stops = new List<Vector3>
                {
                    new Vector3(753.5, -2483.8, 20.1),
                    new Vector3(1028.1, -2470.7, 28.5),
                    new Vector3(1105.4, -2087.4, 38.5),
                    new Vector3(1188.1, -2587.2, 37.3),
                    new Vector3(1978.6, -926.1, 79.2)
                }
            }
        };
    }
}
