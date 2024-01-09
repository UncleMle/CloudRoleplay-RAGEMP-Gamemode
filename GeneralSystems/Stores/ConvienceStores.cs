using CloudRP.Utils;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.Stores
{
    public class ConvienceStores : Script
    {
        public static readonly string _convienceStoreDataIdentifier = "storePedAndColshapeData";

        public ConvienceStores()
        {
            ConvienceStoreData.convienceStores.ForEach(store =>
            {
                Ped ped = NAPI.Ped.CreatePed(PedHash.Indian01AFO, store.pedPosition, store.pedRot, 0);
                ped.SetSharedData(_convienceStoreDataIdentifier, store);
                ped.SetData(_convienceStoreDataIdentifier, store);

                ColShape storeCol = NAPI.ColShape.CreateSphereColShape(store.colPos, 5f, 0);
                storeCol.SetData(_convienceStoreDataIdentifier, store);
                storeCol.SetSharedData(_convienceStoreDataIdentifier, store);

                NAPI.Blip.CreateBlip(59, store.position, 1.0f, 4, "Store", 255, 1.0f, true, 0, 0);
            });
        }

    }
}
