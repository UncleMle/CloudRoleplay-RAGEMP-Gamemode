using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.AntiCheat
{
    public class IPAddressInfo
    {
        public string ip { get; set; }
        public SecurityInfo security { get; set; }
        public LocationInfo location { get; set; }
        public NetworkInfo network { get; set; }
    }

    public class SecurityInfo
    {
        public bool vpn { get; set; }
        public bool proxy { get; set; }
        public bool tor { get; set; }
        public bool relay { get; set; }
    }

    public class LocationInfo
    {
        public string city { get; set; }
        public string region { get; set; }
        public string country { get; set; }
        public string continent { get; set; }
        public string region_code { get; set; }
        public string country_code { get; set; }
        public string continent_code { get; set; }
        public string latitude { get; set; }
        public string longitude { get; set; }
        public string time_zone { get; set; }
        public string locale_code { get; set; }
        public string metro_code { get; set; }
        public bool is_in_european_union { get; set; }
    }

    public class NetworkInfo
    {
        public string network { get; set; }
        public string autonomous_system_number { get; set; }
        public string autonomous_system_organization { get; set; }
    }
}
