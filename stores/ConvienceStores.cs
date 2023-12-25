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
                NAPI.Blip.CreateBlip(59, store.position, 1.0f, 4, "Store", 255, 1.0f, true, 0, 0);
            });
        }

    }
}
