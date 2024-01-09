﻿using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerData
{
    internal class uiHandling : Script
    {
        public static string _sharedMutationStoreSetter = "playerMutationSetter";
        public static int _loadingStateTimeout_seconds = 1;

        public static void togglePlayerChat(Player player, bool toggle)
        {
            string mutationName = "setChatStatus";

            player.TriggerEvent("client:recieveUiMutation", mutationName, "toggle", toggle);
        }

        public static void sendMutationToClient<T>(Player player, string mutationName, string key, T value)
        {
            player.TriggerEvent("client:recieveUiMutation", mutationName, key, value);
        }

        public static void sendObjectToClient(Player player, string mutationName, string key, object value)
        {
            player.TriggerEvent("client:recieveUiMutation", mutationName, key, value);
        }

        public static void handleObjectUiMutation(Player player, string mutationKey, object data)
        {
            player.TriggerEvent("browser:handlePlayerObjectMutation", mutationKey, data);
        }

        public static void handleObjectUiMutationPush(Player player, string mutationKey, object data)
        {
            player.TriggerEvent("browser:handlePlayerObjectMutationPush", mutationKey, data);
        }

        public static void sendNotification(Player player, string text, bool isRp = true, bool isAme = false, string ameText = "")
        {
            player.TriggerEvent("client:addNotif", text, isRp, isAme, ameText);
        }

        public static void setAuthState(Player player, string state)
        {
            player.TriggerEvent("browser:setAuthState", state);
        }

        public static void toggleGui(Player player, bool toggle)
        {
            player.TriggerEvent("gui:toggleHudComplete", toggle);
        }

        public static void sendPushNotifError(Player player, string text, int time, bool resetLoading = false)
        {
            player.TriggerEvent("browser:sendErrorPushNotif", text, time);

            if (resetLoading)
            {

                NAPI.Task.Run(() =>
                {
                    setLoadingState(player, false);
                }, _loadingStateTimeout_seconds * 1000);
            }
        }

        public static void sendPushNotif(Player player, string text, int time, bool progbar = true, bool dragbl = true, bool resetLoading = false)
        {
            player.TriggerEvent("browser:sendNotif", text, progbar, dragbl, time);

            if (resetLoading)
            {

                NAPI.Task.Run(() =>
                {
                    setLoadingState(player, false);
                }, _loadingStateTimeout_seconds * 1000);
            }
        }

        public static void pushRouterToClient(Player player, string route)
        {
            if (route == Browsers.None)
            {
                player.TriggerEvent("browser:resetRouter");
                return;
            }

            player.TriggerEvent("browser:pushRouter", route);
        }

        public static void resetMutationPusher(Player player, string mutationKey)
        {
            player.TriggerEvent("browser:resetMutationPusher", mutationKey);
        }

        public static void resetRouter(Player player)
        {
            player.TriggerEvent("browser:resetRouter");
        }

        public static void setLoadingState(Player player, bool state)
        {
            player.TriggerEvent("client:recieveUiMutation", "setLoadingState", "serverLoading", state);
        }
    }

    public static class Browsers
    {
        public static readonly string None = "/";
        public static readonly string LoginPage = "/login";
        public static readonly string CharacterCreation = "/charcreation";
        public static readonly string StatsPage = "/stats";
        public static readonly string Parking = "/parking";
        public static readonly string BanPage = "/ban";
        public static readonly string ReportsPage = "/reports";
        public static readonly string ModsView = "/vehiclemods";
        public static readonly string Dealership = "/dealerships";
        public static readonly string Refuel = "/refuel";
        public static readonly string Insurance = "/insurance";
        public static readonly string Help = "/help";
        public static readonly string Atm = "/atm";
    }

    public static class AuthStates
    {
        public static readonly string otp = "otp";
        public static readonly string login = "login";
        public static readonly string passReset = "passwordReset";
        public static readonly string resettingPassword = "resettingPassword";
        public static readonly string characterSelection = "charSelect";
    }

    public static class MutationKeys
    {
        public static readonly string PlayerStats = "player_stats";
        public static readonly string BanData = "player_bandata";
        public static readonly string PlayerData = "player_data_server";
        public static readonly string PlayerCharacters = "player_characters";
        public static readonly string VehicleMods = "vehicle_mod_data";
        public static readonly string VehicleModsOld = "vehicle_mod_data_old";
        public static readonly string ParkedVehicles = "parked_vehicles";
        public static readonly string AuthUiState = "auth_ui";
        public static readonly string PlayerReportData = "report_data";
        public static readonly string VehicleFuelData = "vehicle_refuel_data";
        public static readonly string InsuranceVehicles = "insurance_vehicle_data";
        public static readonly string PhoneDataVehicles = "phone_data_player_vehicles";
        public static readonly string AtmData = "atm_data";
        public static readonly string Inventory = "inventory_items";
    }
}