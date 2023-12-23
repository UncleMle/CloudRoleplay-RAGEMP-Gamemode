using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.stores
{
    public class ConvienceStoreData
    {
        public static List<ConvienceStore> convienceStores = new List<ConvienceStore>
        {
            new ConvienceStore
            {
                pedPosition = new Vector3(-3040.6, 584.1, 7.9),
                position = new Vector3(-3043.4, 587.8, 15.0)
            }
        };
    }


    public class ConvienceStore
    {
        public Vector3 pedPosition {  get; set; }
        public Vector3 position { get; set; }
    }
}
