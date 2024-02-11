using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.GeneralSystems.Stores
{
    public class ClothingStore
    {
        public Vector3 position {  get; set; }
        public string name {  get; set; }
        public int id {  get; set; }
        public string displayName {  get; set; }
        public bool maskStore { get; set; }
    }
}
