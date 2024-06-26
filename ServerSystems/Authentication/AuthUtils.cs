﻿using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Linq;
using GTANetworkAPI;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Runtime.InteropServices;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.PlayerSystems.Character;
using CloudRP.ServerSystems.Database;
using CloudRP.ServerSystems.Utils;
using CloudRP.VehicleSystems.Vehicles;
using Newtonsoft.Json;
using System.IO;

namespace CloudRP.ServerSystems.Authentication
{
    internal class AuthUtils : Script
    {
        public static string hashPasword(string password)
        {
            byte[] salt = new byte[16];
            new RNGCryptoServiceProvider().GetBytes(salt);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100000);
            byte[] hash = pbkdf2.GetBytes(20);

            byte[] hashBytes = new byte[36];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            string savedPasswordHash = Convert.ToBase64String(hashBytes);
            return savedPasswordHash;
        }

        public static bool comparePassword(string savedHash, string passwordTwo)
        {
            bool isTheSame = true;

            byte[] hashBytes = Convert.FromBase64String(savedHash);
            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);
            var pbkdf2 = new Rfc2898DeriveBytes(passwordTwo, salt, 100000);
            byte[] hash = pbkdf2.GetBytes(20);
            for (int i = 0; i < 20; i++)
                if (hashBytes[i + 16] != hash[i])
                    isTheSame = false;

            return isTheSame;
        }

        public static string generateString(int length, bool onlyNumbers = false)
        {
            string characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            if (onlyNumbers)
            {
                characters = "0123456789";
            }

            string result = "";

            for (int i = 0; i < length; i++)
            {
                Random r = new Random();
                int rInt = r.Next(0, characters.Length);
                result += characters[rInt];
            }

            return result.ToUpper();
        }

        public static void sendEmail(string targetEmail, string subject, string body)
        {
            try
            {
                string smtpClientUsername = Main._gmailUser;
                string smtpClientPassword = Main._gmailPass;

                if (smtpClientUsername == null || smtpClientPassword == null)
                {
                    ChatUtils.formatConsolePrint("Email Client enviroment variables couldn't be found.");
                    return;
                }


                SmtpClient smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(smtpClientUsername, smtpClientPassword),
                    EnableSsl = true,
                };

                MailMessage msg = new MailMessage(smtpClientUsername, targetEmail, subject, getEmailContext(body))
                {
                    IsBodyHtml = true
                };

                smtpClient.Send(msg);
            }
            catch
            {

            }
        }
        
        public static bool checkCharacterName(string name)
        {
            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbCharacter findChar = dbContext.characters.Where(charac => charac.character_name == name).FirstOrDefault();

                if (findChar != null)
                {
                    return false;
                }

            }
            return true;
        }

        public static string getEmailContext(string context)
        {
            string editedContext = "";

            using (StreamReader sr = new StreamReader(Main.jsonDirectory + "emailFormat.json"))
            {
                HtmlEmailFormat emailFormat = JsonConvert.DeserializeObject<HtmlEmailFormat>(sr.ReadToEnd());

                if(emailFormat != null)
                {
                    int currentYear = DateTime.Now.Year;

                    editedContext = emailFormat.html_content_first + context + string.Format(emailFormat.html_content_second, currentYear);
                }

            }

            return editedContext;
        }

        public static bool isEmailValid(string email)
        {
            string regex = @"^[^@\s]+@[^@\s]+\.(com|net|org|gov)$";

            return Regex.IsMatch(email, regex, RegexOptions.IgnoreCase);
        }

        public static bool validateString(string input)
        {
            string specialChar = @"\|!#$%&/()=?»«@£§€{}~.-;'<>_,0123456789 ";

            foreach (var item in specialChar)
            {
                if (input.Contains(item) || string.IsNullOrWhiteSpace(input)) return false;
            }

            return true;
        }

        public static bool validateNick(string input)
        {
            string specialChar = @"\|!#$%&/()=?»«@£§€{}~;<>_";

            foreach (var item in specialChar)
            {
                if (input.Contains(item) || string.IsNullOrWhiteSpace(input)) return false;
            }

            return true;
        }

        public static string firstCharToUpper(string input)
        {
            return string.Concat(input[0].ToString().ToUpper(), input.AsSpan(1).ToString().ToLower());
        }

        public static bool registerDetailsValid(Player player, Register registeringData)
        {
            if (registeringData.registerPassword != registeringData.registerPasswordConfirm)
            {
                uiHandling.sendPushNotifError(player, "Ensure password confirmation matches password.", 4000, true);
                return false;
            }

            if (!isEmailValid(registeringData.registerEmail))
            {
                uiHandling.sendPushNotifError(player, "Entered email is invalid.", 6000, true);
                return false;
            }

            if (!validateString(registeringData.registerUsername) || registeringData.registerUsername.Length > 20 || registeringData.registerUsername.Length < 4)
            {
                uiHandling.sendPushNotifError(player, "Username is invalid. Ensure it contains no special characters or numbers.", 6000, true);
                return false;
            }

            if (registeringData.registerPassword.Length < 8)
            {
                uiHandling.sendPushNotifError(player, "Ensure your password's length is greater than 8.", 6000, true);
                return false;
            }

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findWithEmail = dbContext.accounts.Where(acc => acc.email_address == registeringData.registerEmail).FirstOrDefault();
                if (findWithEmail != null)
                {
                    uiHandling.sendPushNotifError(player, "Email is already taken.", 4000, true);
                    return false;
                }

                Account findWithUser = dbContext.accounts.Where(acc => acc.username == registeringData.registerUsername).FirstOrDefault();
                if (findWithUser != null)
                {
                    uiHandling.sendPushNotifError(player, "Username is already taken.", 4000, true);
                    return false;
                }

                Account hasAccount = dbContext.accounts.Where(acc => acc.user_ip == player.Address || acc.social_club_id == player.SocialClubId || acc.client_serial == player.Serial).FirstOrDefault();

                if (hasAccount != null)
                {
                    uiHandling.sendPushNotifError(player, "You already have an account.", 5500, true);
                    return false;
                }
            }


            return true;
        }
    }

    class HtmlEmailFormat
    {
        public string html_content_first { get; set; }
        public string html_content_second { get; set; }
    }

    class UserCredentials
    {
        public string username { get; set; }
        public string password { get; set; }
        public bool rememberMe { get; set; }
    }

    public class User
    {
        public int account_id { get; set; }
        public int auto_login { get; set; }
        public string username { get; set; }
        public int admin_status { get; set; }
        public bool adminDuty { get; set; } = false;
        public string admin_name { get; set; }
        public bool vip_status { get; set; }
        public string email_address { get; set; }
        public string admin_ped { get; set; }
        public bool isFlying { get; set; }
        public bool isFrozen { get; set; } = false;
        public uint playerDimension { get; set; }
        public int max_characters { get; set; }
        public bool admin_esp { get; set; } = true;
        public string redeem_code { get; set; }
        public bool showAdminPed { get; set; } = false;
        public long vip_unix_expires { get; set; }
        public int admin_jail_time { get; set; }
        public string admin_jail_reason { get; set; }
        public bool has_passed_quiz { get; set; }
        public long quiz_fail_unix { get; set; }
        public long admin_reports_completed { get; set; }
    }

    class SharedDataAccount
    {
        public int account_id { get; set; }
        public string username { get; set; }
        public int admin_status { get; set; }
        public bool adminDuty { get; set; } = false;
        public string admin_ped { get; set; }
        public string admin_name { get; set; }
        public bool isFlying { get; set; }
        public bool isFrozen { get; set; }
        public bool isOnCharacterCreation { get; set; }
        public bool admin_esp { get; set; }
        public bool showAdminPed { get; set; }
        public int admin_jail_time { get; set; }
        public string admin_jail_reason { get; set; }
    }

    class SharedDataCharacter
    {
        public int character_id { get; set; }
        public double character_water { get; set; }
        public double character_hunger { get; set; }
        public string character_name { get; set; }
        public int injured_timer { get; set; }
        public CharacterModel characterModel { get; set; }
        public CharacterClothing characterClothing { get; set; }
        public bool voiceChatState { get; set; }
        public bool loggingOut { get; set; }
        public bool routeIsFrozen { get; set; }
        public int faction_duty_status { get; set; }
    }

    class Register
    {
        public string registerUsername { get; set; }
        public string registerPassword { get; set; }
        public string registerPasswordConfirm { get; set; }
        public string registerEmail { get; set; }
    }

    class OtpStore
    {
        public string otp { get; set; }
        public int otpTries { get; set; }
        public Register registeringData { get; set; }
        public long unixMade { get; set; }
    }

    class AccountOtpStore
    {
        public int accountId { get; set; }
        public string username { get; set; }
        public long createdAt { get; set; }
        public int otpTries { get; set; }
        public string otpCode { get; set; }
        public bool rememberMe { get; set; }
    }

    class ResetPass
    {
        public string password { get; set; }
        public string otpCode { get; set; }
        public string passwordConfirm { get; set; }
    }

    public class AutoLoginData
    {
        public int targetAccountId { get; set; }
        public long createdAt { get; set; } = CommandUtils.generateUnix();
        public string targetUsername { get; set; }
    }

    public class QuizQuestion
    {
        public int questionId { get; set; }
        public string question { get; set; }
        public List<string> answers { get; set; }
        [JsonIgnore]
        public int answerId { get; set; }
    }

    public class ClientQuizAnswerData
    {
        public int questionId { get; set; }
        public int answerId { get; set; }
    }

    public class QuizGivenAnswersData
    {
        public bool passedQuiz { get; set; }
        public int questionsWrong { get; set; }
    }
}
