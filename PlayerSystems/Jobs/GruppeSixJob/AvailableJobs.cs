using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.GruppeSixJob
{
    public class AvailableJobs
    {
        public static List<GruppeSixAvailableJob> gruppeSixJobs = new List<GruppeSixAvailableJob>
        {
            new GruppeSixAvailableJob
            {
                jobId = 1,
                jobPay = 5145,
                name = "LS - Grapeseed",
                description = "Fill up some atms on the way driving through LS towards grapeseed",
                deliveryStops = new List<Vector3>
                {
                    new Vector3(-258.7, -723.5, 33.5),
                    new Vector3(-256.1, -716.1, 33.5),
                    new Vector3(-254.4, -692.3, 33.6),
                    new Vector3(380.9, 323.4, 103.6),
                    new Vector3(1686.8, 4815.8, 42.0),
                    new Vector3(1702.9, 4933.5, 42.1),
                    new Vector3(2682.9, 3286.7, 55.2)
                }
            },
            new GruppeSixAvailableJob
            {
                jobId = 2,
                jobPay = 3990,
                name = "LS Main",
                description = "Do a ring around the city filling up all the ATMS.",
                deliveryStops = new List<Vector3>
                {
                    new Vector3(-717.6, -915.7, 19.2),
                    new Vector3(-1314.9, -836.0, 17.0),
                    new Vector3(-1315.8, -834.8, 17.0),
                    new Vector3(-1571.0, 547.3, 35.0),
                    new Vector3(-1570.2, 546.7, 35.0),
                    new Vector3(-1205.0, -326.2, 37.8),
                    new Vector3(-1205.7, -324.8, 37.9),
                    new Vector3(-846.9, -340.2, 38.7),
                    new Vector3(-846.2, -341.2, 38.7)
                }
            }
        };

    }
}
