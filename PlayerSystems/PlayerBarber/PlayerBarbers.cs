using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerBarber
{
    public class PlayerBarbers : Script
    {
        public List<Vector3> barberShops = new List<Vector3>
        {
            new Vector3(325.477f, -1612.978f, 29.291f),
            new Vector3(-34.693f, -150.966f, 57.077f),
            new Vector3(-813.22f, -183.25f, 37.568f),
            new Vector3(-814.308f, -184.974f, 37.568f),
            new Vector3(-1282.604f, -1114.754f, 6.990f)
        };

        public PlayerBarbers()
        {
            barberShops.ForEach(shop =>
            {
                NAPI.Blip.CreateBlip(106, shop, 1f, 4, "Barber Shop", 255, 1f, true, 0, 0);
            });
        }
    }
}
