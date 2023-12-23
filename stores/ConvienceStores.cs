using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.stores
{
    public class ConvienceStores : Script
    {
        public ConvienceStores()
        {
            ConvienceStoreData.convienceStores.ForEach(store =>
            {
                NAPI.Blip.CreateBlip(59, store.position, 1.0f, 1, "Store", 255, 1.0f, true, 0, 0);
                NAPI.Ped.CreatePed(PedHash.Indian01AFO, store.pedPosition, 0, 0);
            });
        }

    }
}
