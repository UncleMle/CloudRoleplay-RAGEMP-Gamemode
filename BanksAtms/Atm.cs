﻿using CloudRP.World;
using GTANetworkAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace CloudRP.BanksAtms
{
    public class Atm : Script
    {
        public static string _atmDataIdentifier = "atmColshapeData";
        List<Atm> Atms = new List<Atm>();

        public int Id { get; set; }
        public int OwnerId { get; set; }
        public Vector3 Vector3 { get; set; }
        public string Name { get; set; }
        public int LastRobbery { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        [ServerEvent(Event.ResourceStart)]
        public void loadAtms()
        {
            Atms.Add(new Atm
            {
                Id = 1,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -2072.4326171875f, Y = -317.276123046875f, Z = 13.315979957580566f },
                Name = "Pacific Atm",
            });

            Atms.Add(new Atm
            {
                Id = 2,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -258.7763366699219f, Y = -723.3988037109375f, Z = 33.467262268066406f },
                Name = "PillBox",
            });

            Atms.Add(new Atm
            {
                Id = 3,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -256.1478576660156f, Y = -716.0738525390625f, Z = 33.51643371582031f },
                Name = "PillBox",
            });

            Atms.Add(new Atm
            {
                Id = 4,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -254.31884765625f, Y = -692.4165649414062f, Z = 33.61027908325195f },
                Name = "PillBox",
            });

            Atms.Add(new Atm
            {
                Id = 5,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -2295.475830078125f, Y = 358.1181640625f, Z = 174.60171508789062f },
                Name = "Quartz Center",
            });

            Atms.Add(new Atm
            {
                Id = 6,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -2294.67529296875f, Y = 356.5382995605469f, Z = 174.60171508789062f },
                Name = "Quartz Center",
            });

            Atms.Add(new Atm
            {
                Id = 7,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -2293.8984375f, Y = 354.8272705078125f, Z = 174.60171508789062f },
                Name = "Quartz Center",
            });

            Atms.Add(new Atm
            {
                Id = 8,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -3044.10546875f, Y = 594.6197509765625f, Z = 7.736138820648193f },
                Name = "Chumas",
            });

            Atms.Add(new Atm
            {
                Id = 9,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 238.3200225830078f, Y = 215.9827117919922f, Z = 106.28675842285156f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 10,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 237.8886260986328f, Y = 216.87991333007812f, Z = 106.28675842285156f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 11,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 237.44927978515625f, Y = 217.8021240234375f, Z = 106.28675842285156f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 12,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 237.04400634765625f, Y = 218.7077178955078f, Z = 106.28675842285156f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 13,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 236.62030029296875f, Y = 219.65756225585938f, Z = 106.28675842285156f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 14,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 264.3638610839844f, Y = 210.0670928955078f, Z = 106.28313446044922f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 15,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 264.81817626953125f, Y = 211.02896118164062f, Z = 106.28313446044922f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 16,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 265.15997314453125f, Y = 211.97935485839844f, Z = 106.28313446044922f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 17,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 265.4615783691406f, Y = 212.9705047607422f, Z = 106.28313446044922f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 18,
                OwnerId = 1,
                Vector3 = new Vector3 { X = 265.8057861328125f, Y = 213.86923217773438f, Z = 106.28313446044922f },
                Name = "Pacific Main",
            });

            Atms.Add(new Atm
            {
                Id = 19,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -97.3278579711914f, Y = 6455.30615234375f, Z = 31.466419219970703f },
                Name = "Blaine County",
            });

            Atms.Add(new Atm
            {
                Id = 20,
                OwnerId = 1,
                Vector3 = new Vector3 { X = -95.53550720214844f, Y = 6457.14697265625f, Z = 31.460538864135742f },
                Name = "Blaine County",
            });

            Atms.ForEach(atm =>
            {
                atm.init();
            });
        }

        public void init()
        {
            NAPI.Blip.CreateBlip(434, Vector3, 1.0f, 43, "ATM", 255, 1.0f, true, 0, 0);
            MarkersAndLabels.setTextLabel(Vector3, "Use ~y~Y~w~ to interact with this ATM", 2f);
            MarkersAndLabels.setPlaceMarker(Vector3);
            setData();
        }

        public void setData()
        {
            ColShape atmColshape = NAPI.ColShape.CreateSphereColShape(Vector3, 0.5f, 0);
            atmColshape.SetData(_atmDataIdentifier, this);
            atmColshape.SetSharedData(_atmDataIdentifier, this);
        }

        [ServerEvent(Event.PlayerEnterColshape)]
        public void setAtmData(ColShape colshape, Player player)
        {
            Atm colshapeData = colshape.GetData<Atm>(_atmDataIdentifier);

            if(colshapeData != null)
            {
                player.SetData(_atmDataIdentifier, colshapeData);
                player.SetSharedData(_atmDataIdentifier, colshapeData);
            }
        }
        
        [ServerEvent(Event.PlayerExitColshape)]
        public void removeAtmData(ColShape colshape, Player player)
        {
            Atm colshapeData = colshape.GetData<Atm>(_atmDataIdentifier);

            if(colshapeData != null)
            {
                player.ResetData(_atmDataIdentifier);
                player.ResetSharedData(_atmDataIdentifier);
            }
        }

    }
}