using CloudRP.World;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.BanksAtms
{
    public class Banks : Script
    {
        public static List<Bank> banks = new List<Bank>
        {
            new Bank
            {
                blipPos = new Vector3(239.8, 218.7, 185.7),
                tellers = new List<Vector3>
                {
                    new Vector3(242.0, 224.0, 106.3),
                    new Vector3(247.1, 224.0, 106.3),
                    new Vector3(252.4, 224.0, 106.3)
                }
            }
        };

        public Banks()
        {
            banks.ForEach(bank =>
            {
                NAPI.Blip.CreateBlip(374, bank.blipPos, 1.0f, 5, "Bank", 255, 1.0f, true, 0, 0);
                
                bank.tellers.ForEach(teller =>
                {
                    MarkersAndLabels.setTextLabel(teller, "Use ~y~Y~w~ to interact with bank.", 5f);
                    MarkersAndLabels.setPlaceMarker(teller);
                });
            });
        }
    }
}
