﻿using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.PlayerData
{
    internal class uiHandling : Script
    {
        public static readonly string _sharedMutationStoreSetter = "playerMutationSetter";
        public static readonly string _promptMenuCallbackDataKey = "server:uiHandling:promptMenuCallbackData";
        public static int _loadingStateTimeout_seconds = 1;

        #region Global Methods
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

        public static void sendHintNotif(Player player, string message, int type, int timeOut = -1)
        {
            player.TriggerEvent("client:addHintNotif", message, type, timeOut);
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

        public static void pushRouterToClient(Player player, string route, bool freezeCursor = false)
        {
            player.setRouteFrozen(freezeCursor);

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

        public static void setLoadingState(Player player, bool state, bool resetRoute = false)
        {
            player.TriggerEvent("client:recieveUiMutation", "setLoadingState", "serverLoading", state);
        
            if(resetRoute)
            {
                resetRouter(player);
            }
        }
        
        public static void sendPrompt(Player player, string icon, string title, string message, Action<Player, object> callback, object data = null) 
        {
            pushRouterToClient(player, Browsers.PromptScreen, true);

            handleObjectUiMutation(player, MutationKeys.PromptData, JsonConvert.SerializeObject(new PromptUiData
            {
                icon = icon,
                message = message,
                title = title
            }));

            player.SetCustomData(_promptMenuCallbackDataKey, new PromptCallback
            {
                callback = callback,
                data = data
            });
        }

        public static void sendSound(Player player, string soundName, string soundSetName)
            => player.TriggerEvent("browser:playerFrontendSound", soundName, soundSetName);

        public static void toggleBlur(Player player, bool toggle)
            => player.TriggerEvent("browser:toggleClientBlur", toggle);

        #endregion

        #region Remote Events
        [RemoteEvent("server:uiHandling:handleAccept")]
        public void handlePromptMenuAccept(Player player)
        {
            PromptCallback callback = player.GetData<PromptCallback>(_promptMenuCallbackDataKey);
            if (callback == null) return;

            callback.callback.Invoke(player, callback.data == null ? new object { } : callback.data);
            player.ResetData(_promptMenuCallbackDataKey);
        }
        #endregion
    }

    public static class HintKeys
    {
        public static readonly string LCTRL_KEY = "~INPUT_VEH_MOVE_UD~";
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
        public static readonly string ViewBusRoutes = "/busroutes";
        public static readonly string TruckerViewUI = "/truckerjobs";
        public static readonly string PostalJobView = "/postaljobview";
        public static readonly string GruppeSixJobView = "/gruppesixview";
        public static readonly string LicensePage = "/licenseview";
        public static readonly string DmvCourseView = "/dmvcourseview";
        public static readonly string FactionUniforms = "/factionuniform";
        public static readonly string BarberShop = "/barbershop";
        public static readonly string PromptScreen = "/promptscreen";
        public static readonly string JobCenter = "/jobcenter";
        public static readonly string FineMenu = "/viewfines";
        public static readonly string AnimationMenu = "/animations";
        public static readonly string Quiz = "/quiz";
    }

    public static class AuthStates
    {
        public static readonly string otp = "otp";
        public static readonly string login = "login";
        public static readonly string passReset = "passwordReset";
        public static readonly string resettingPassword = "resettingPassword";
        public static readonly string characterSelection = "charSelect";
        public static readonly string accountOtpState = "accountOtp";
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
        public static readonly string PlayerVehDealer = "is_in_player_dealer";
        public static readonly string PlayerAccountData = "player_account_info";
        public static readonly string BusDriverJobRoutes = "player_bus_job_routes";
        public static readonly string TruckerJobs = "trucker_jobs";
        public static readonly string PostalJobView = "postal_jobs";
        public static readonly string GruppeSixJobs = "gruppe_six_jobs";
        public static readonly string DmvCourses = "dmv_courses";
        public static readonly string FactionUniforms = "faction_uniforms";
        public static readonly string UninsuredVehicles = "uninsured_vehicle_data";
        public static readonly string Barber = "barber_data";
        public static readonly string DCCPhone = "dcc_data";
        public static readonly string FactionDispatch = "faction_dispatch_calls";
        public static readonly string PromptData = "player_prompt_data";
        public static readonly string MaskStoreState = "in_mask_store";
        public static readonly string JobCenterJobs = "job_center_jobs";
        public static readonly string AutoLogin = "auto_auth_data";
        public static readonly string Admin = "admin_data";
        public static readonly string CriminalCharges = "criminal_charges";
        public static readonly string Animations = "animations_data";
        public static readonly string QuizQuestions = "quiz_question_data";
        public static readonly string QuizAnswerData = "quiz_given_answers_data";
    }

    public class PromptUiData
    {
        public string icon { get; set; }
        public string title { get; set; }
        public string message { get; set; }
        public string callBackEvent { get; set; }
        public object callBackObject { get; set; }
        public string callBackRoute { get; set; }
    }

    public class AutoAuth
    {
        public string username { get; set; }
        public string email { get; set; }
    }

    public class PromptCallback
    {
        public object data { get; set; }
        public Action<Player, object> callback { get; set; }
    }
}
