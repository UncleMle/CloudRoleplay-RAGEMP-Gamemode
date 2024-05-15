using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace CloudRP.ServerSystems.JsonParser
{
    public class JsonParser : Script
    {
        public static List<string> jsonFiles = new List<string>();

        public JsonParser()
        {
            Main.resourceStart += () =>
            {
                jsonFiles.ForEach(file =>
                {
                    if (!File.Exists(Main.jsonDirectory + file))
                    {
                        ChatUtils.formatConsolePrint($"[ERROR] Json File {file} wasn't found.");
                    }
                });
            };
        }

        public static void addJson(string fileName)
            => jsonFiles.Add(fileName);

        public static T parseJson<T>(string fileName)
        {
            T jsonReturn;

            using (StreamReader sr = new StreamReader(Main.jsonDirectory + fileName))
            {
                jsonReturn = JsonConvert.DeserializeObject<T>(sr.ReadToEnd());
            }

            return jsonReturn;  
        }

        public static void setToJson<T>(string fileName, T value)
        => File.WriteAllText(Main.jsonDirectory + fileName, JsonConvert.SerializeObject(value));

    }
}
