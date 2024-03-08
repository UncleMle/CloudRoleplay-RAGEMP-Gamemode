using CloudRP.PlayerSystems.Character;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Authentication;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using CloudRP.World.MarkersLabels;
using GTANetworkAPI;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.CasinoSystems.LuckyWheel
{
    public class LuckyWheelSystem : Script
    {
        private static readonly string _spinningWheelDataKey = "casinoSystem:spinningWheel:winDataKey";
        private static readonly Vector3 spawnVehicleAt = new Vector3(935.2, -0.9, 78.8);
        private static readonly Vector3 wheelObjectPosition = new Vector3(1111.052, 229.8579, -49.133);
        private static readonly int spinWheelCost = 400;
        private static bool wheelIsSpinning = false;
        string[] winListNames = new string[]
        {
            "clothing",
            "2,500 RP",
            "$20,000",
            "10,000 chips",
            "discount",
            "5,000 RP",
            "$30,000",
            "15,000 chips",
            "clothing",
            "7,500 RP",
            "20,000 chips",
            "mystery",
            "clothing",
            "10,000 RP",
            "$40,000",
            "25,000 chips",
            "clothing",
            "15,000 RP",
            "vehicle",
            "$50,000"
        };
        private static string[] winVehicles = new string[]
        {
            "adder", "autarch", "banshee2", "bullet", "cheetah", "emerus", "italigtb2"
        };
        private static int[] winMoneyAmounts = new int[]
        {
            -1, 2500, 20000, 10000, 2000, 5000, 30000, 15000, -1, 7500, 20000, -1, -1, 10000, 40000, 25000, -1, 15000, -1, 50000
        };
        private static int winVehicleIndex = 0;

        public LuckyWheelSystem()
        {
            Main.playerConnect += spawnClientPodiumVehicle;
            Main.playerDisconnect += (player) =>
            {
                if (player.HasData(_spinningWheelDataKey)) wheelIsSpinning = false;
            };

            Main.resourceStart += () => ChatUtils.startupPrint("Loaded in Lucky Wheel System");
        }

        #region Global Methods
        private static void spawnClientPodiumVehicle(Player player)
        {
            player.TriggerEvent("client:luckyWheel:spawnPrizeVeh", winVehicles[winVehicleIndex]);
        }

        public void startWheelWelcome(Player player, object callback)
        {
            if(wheelIsSpinning)
            {
                uiHandling.sendPushNotifError(player, "The wheel is already spinning. Please wait.", 6600);
                return;
            }

            wheelIsSpinning = true;

            User user = player.getPlayerAccountData();

            if(!player.processPayment(spinWheelCost, "Casino - Lucky Wheel Spin Cost"))
            {
                uiHandling.sendPushNotifError(player, "You don't have money to spin the wheel.", 5000);
                return;
            }

            int win = user.adminDuty ? 18 : new Random().Next(winListNames.Length);

            player.SetCustomData(_spinningWheelDataKey, win);

            player.TriggerEvent("client:luckywheel:arriveToWheel", win);
        }

        public static string cyclePrizeVehicle()
        {
            if (winVehicleIndex + 1 > winVehicles.Length - 1) winVehicleIndex = 0;
            else winVehicleIndex++;

            NAPI.Pools.GetAllPlayers().ForEach(p => spawnClientPodiumVehicle(p));

            return winVehicles[winVehicleIndex];
        }

        public static void handleWin(Player player, int win)
        {
            DbCharacter character = player.getPlayerCharacterData();

            if (character == null) return;

            player.ResetData(_spinningWheelDataKey);

            int winMoneyAmount = winMoneyAmounts[win];

            if (winMoneyAmount != -1)
            {
                player.SendChatMessage(ChatUtils.Success + $"You have succesfully won ${winMoneyAmount.ToString("N0")}.");
                player.addPlayerMoney(winMoneyAmount, "Casino - Lucky Wheel");
                return;
            }

            switch ((PossibleWins)win)
            {
                case PossibleWins.vehicle:
                    {
                        string winVeh = winVehicles[winVehicleIndex];

                        cyclePrizeVehicle();

                        int colour = new Random().Next(0, 159);

                        VehicleSystem.buildVehicle(winVeh, spawnVehicleAt, 145.2f, character.character_id, colour, colour, character.character_name);

                        player.SendChatMessage(ChatUtils.Success + $"You have won an {winVeh}! It has been parked outside the casino and marked on the GPS.");
                        MarkersAndLabels.addBlipForClient(player, 523, "Your new vehicle", spawnVehicleAt, 4, 255, 55);

                        player.TriggerEvent("client:luckyWheel:vehiclePrizeAnim");
                        break;
                    }
                case PossibleWins.mystery:
                    {
                        handleWin(player, new Random().Next(0, 11));
                        break;
                    }
            }
        }
        #endregion

        #region Remote Events
        [RemoteEvent("server:casinoSystems:luckywheel:arriveTo")]
        public void handleArriveToWheel(Player player)
        {
            if (player.getPlayerCharacterData() == null || player.HasData(_spinningWheelDataKey)) return;

            if (Vector3.Distance(player.Position, wheelObjectPosition) > 10) return;
            
            uiHandling.sendPrompt(player, "fa-solid fa-money-bill", "Lucky Wheel", $"Are you sure you want to spin the lucky wheel? It will cost ${spinWheelCost.ToString("N0")}.", startWheelWelcome);
        }

        [RemoteEvent("server:casinoSystems:luckyWheel:spin")]
        public void handleWheelSpin(Player player)
        {
            if (!player.HasData(_spinningWheelDataKey)) return;

            NAPI.ClientEvent.TriggerClientEventInRange(player.Position, 50f, "client:luckyWheel:spinWheel", player.GetData<int>(_spinningWheelDataKey));
        }

        [RemoteEvent("server:casinoSystems:luckyWheel:finishSpin")]
        public void handleFinishWheelSpin(Player player)
        {
            if (!player.HasData(_spinningWheelDataKey) || player.getPlayerCharacterData() == null) return;

            wheelIsSpinning = false;

            handleWin(player, player.GetData<int>(_spinningWheelDataKey));
        }
        #endregion
    }

    public enum PossibleWins
    {
        clothing,
        _2500Rp,
        _20000,
        _10000Chips,
        discount,
        _5000Rp,
        _30000,
        _15000Chips,
        clothing2,
        _7500Rp,
        _20000Chips,
        mystery,
        clothing3,
        _10000Rp,
        _40000,
        _25000Chips,
        clothing4,
        _15000Rp,
        vehicle,
        _50000
    }
}
