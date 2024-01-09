using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.Stores
{
    public class ConvienceStoreData
    {
        public static List<ConvienceStore> convienceStores = new List<ConvienceStore>
        {
            new ConvienceStore
            {
                pedRot = 18,
                colPos = new Vector3(25.8, -1345.6, 29.5),
                pedPosition = new Vector3(-3040.6, 584.1, 7.9),
                position = new Vector3(-3043.4, 587.8, 15.0)
            },
            new ConvienceStore
            {
                pedRot = -91,
                colPos = new Vector3(25.7, -1345.7, 29.5),
                pedPosition = new Vector3(24.5, -1345.6, 29.5),
                position = new Vector3(24.5, -1345.6, 29.5)
            },
            new ConvienceStore
            {
                pedRot = -105,
                colPos = new Vector3(374.8, 327.8, 103.6),
                pedPosition = new Vector3(373.0, 328.2, 103.6),
                position = new Vector3(373.0, 328.2, 103.6)
            },
        };
    }


    public class ConvienceStore
    {
        public float pedRot { get; set; }
        public Vector3 colPos { get; set; }
        public Vector3 pedPosition { get; set; }
        public Vector3 position { get; set; }
    }
}
