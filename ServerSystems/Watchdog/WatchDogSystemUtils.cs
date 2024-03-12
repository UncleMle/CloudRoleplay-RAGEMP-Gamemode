using CloudRP.ServerSystems.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Watchdog
{
    public class WatchTransaction
    {
        public long createdAt { get; } = CommandUtils.generateUnix();
        public int amount { get; set; }
    }
    
    public class WatchAsset
    {
        public long createdAt { get; } = CommandUtils.generateUnix();
        public int assetValue { get; set; }
        public string assetDesc { get; set; }
    }
}
