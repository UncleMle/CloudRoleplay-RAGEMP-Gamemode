using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace CloudRP.WeaponSystem
{
    public class AttachmentSystem : Script
    {
        public static readonly string directory = Directory.GetCurrentDirectory() + "/json/";

        public AttachmentSystem()
        {
            using (StreamReader sr = new StreamReader(directory + "weaponData.json"))
            {
                string line;
                while ((line = sr.ReadLine()) != null)
                {
                    Console.WriteLine(line);
                }
            }
        }

    }
}
