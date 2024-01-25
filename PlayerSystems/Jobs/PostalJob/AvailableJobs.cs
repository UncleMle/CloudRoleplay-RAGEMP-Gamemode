using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.Jobs.PostalJob
{
    public class AvailableJobs
    {
        public static List<AvailablePostalJob> availablePostalJobs = new List<AvailablePostalJob>
        {
            new AvailablePostalJob
            {
                description = "Drive a route around the LS Hills delivering packages.",
                jobId = 1,
                jobPay = 4700,
                name = "LS Hills Route",
                deliveryStops = new List<Vector3>
                {
                    new Vector3(373.9, 427.9, 145.7),
                    new Vector3(318.6, 552.1, 156.0),
                    new Vector3(232.2, 672.1, 190.0),
                    new Vector3(8.4, 540.1, 176.0),
                    new Vector3(-355.0, 469.9, 112.6),
                    new Vector3(-520.8, 593.9, 120.8),
                    new Vector3(-580.1, 491.6, 108.9),
                    new Vector3(-968.7, 437.0, 80.8)
                }
            },
            new AvailablePostalJob
            {
                description = "Drive a route around downtown LS delivering packages.",
                jobId = 2,
                jobPay = 3200,
                name = "Downtown Route",
                deliveryStops = new List<Vector3>
                {
                    new Vector3(-80.5, -1607.7, 34.7),
                    new Vector3(-98.0, -1638.9, 35.5),
                    new Vector3(114.2, -1961.1, 21.3),
                    new Vector3(0.4, -1824.1, 29.5),
                    new Vector3(-14.1, -1441.9, 31.1),
                    new Vector3(440.6, -1829.9, 28.4)
                }
            }
        };

    }
}
