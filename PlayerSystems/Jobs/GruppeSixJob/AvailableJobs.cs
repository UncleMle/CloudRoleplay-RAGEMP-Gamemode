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
                name = "LS Circle",
                description = "Do a ring around the city filling up all the ATMS.",
                deliveryStops = new List<Vector3>
                {
                    new Vector3(-258.7763366699219f, -723.3988037109375f, 33.467262268066406f),
                    new Vector3(-256.1478576660156f, -716.0738525390625f, 33.51643371582031f),
                    new Vector3(-254.31884765625f, -692.4165649414062f, 33.61027908325195f),
                    new Vector3(-2295.475830078125f, 358.1181640625f, 174.60171508789062f),
                    new Vector3(-2294.67529296875f, 356.5382995605469f, 174.60171508789062f),
                    new Vector3(-2293.8984375f, 354.8272705078125f, 174.60171508789062f),
                    new Vector3(-3044.10546875f, 594.6197509765625f, 7.736138820648193f)
                }
            }
        };

    }
}
