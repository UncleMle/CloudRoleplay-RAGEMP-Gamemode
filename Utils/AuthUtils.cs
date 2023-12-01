using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using VisualStudioConfiguration;
using CloudRP.Authentication;
using CloudRP.Database;
using CloudRP.PlayerData;
using System.Linq;
using GTANetworkAPI;
using CloudRP.Character;

namespace CloudRP.Utils
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

            return result;
        }

        public static void sendEmail(string targetEmail, string subject, string body)
        {
            try
            {
                string smtpClientUsername = Env._gmailSmtpUser;
                string smtpClientPassword = Env._gmailSmtpPass;

                if (smtpClientUsername == null || smtpClientPassword == null)
                {
                    Console.WriteLine("Email Client enviroment variables couldn't be found.");
                    return;
                }

                SmtpClient smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(smtpClientUsername, smtpClientPassword),
                    EnableSsl = true,
                };

                MailMessage msg = new MailMessage(smtpClientUsername, targetEmail, subject, body)
                {
                    IsBodyHtml = true
                };

                smtpClient.Send(msg);
            } catch
            {

            }
        }

        public static bool checkCharacterName(string name)
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                DbCharacter findChar = dbContext.characters.Where(charac => charac.character_name == name).FirstOrDefault();

                if(findChar != null)
                {
                    return false;
                }

            }
            return true;
        }

        public static string getEmailWithContext(string context)
        {
            string email = $"<h1>{context}<h1>";

            return email;
        }

        public static bool isEmailValid(string email)
        {
            string regex = @"^[^@\s]+@[^@\s]+\.(com|net|org|gov)$";

            return Regex.IsMatch(email, regex, RegexOptions.IgnoreCase);
        }

        public static bool validateString(string input)
        {
            string specialChar = @"\|!#$%&/()=?»«@£§€{}.-;'<>_,0123456789 ";

            foreach (var item in specialChar)
            {
                if (input.Contains(item) || string.IsNullOrWhiteSpace(input)) return false;
            }

            return true;
        }

        public static string firstCharToUpper(string input)
        {
            return string.Concat(input[0].ToString().ToUpper(), input.AsSpan(1));
        }

        public static bool registerDetailsValid(Player player, Register registeringData)
        {
            if (registeringData.registerPassword != registeringData.registerPasswordConfirm)
            {
                uiHandling.sendPushNotifError(player, "Ensure password confirmation matches password.", 4000);
                return false;
            }

            if (!isEmailValid(registeringData.registerEmail))
            {
                uiHandling.sendPushNotifError(player, "Entered email is invalid.", 6000);
                return false;
            }

            if (!validateString(registeringData.registerUsername) || registeringData.registerUsername.Length > 20 || registeringData.registerUsername.Length < 4)
            {
                uiHandling.sendPushNotifError(player, "Username is invalid. Ensure it contains no special characters or numbers.", 6000);
                return false;
            }

            if (registeringData.registerPassword.Length < 8)
            {
                uiHandling.sendPushNotifError(player, "Ensure your password's length is greater than 8.", 6000);
                return false;
            }

            using (DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account findWithEmail = dbContext.accounts.Where(acc => acc.email_address == registeringData.registerEmail).FirstOrDefault();
                if (findWithEmail != null)
                {
                    uiHandling.sendPushNotifError(player, "Email is already taken.", 4000);
                    return false;
                }


                Account findWithUser = dbContext.accounts.Where(acc => acc.username == registeringData.registerUsername).FirstOrDefault();
                if (findWithUser != null)
                {
                    uiHandling.sendPushNotifError(player, "Username is already taken.", 4000);
                    return false;
                }
            }


            return true;
        }
    }

    class UserCredentials
    {
        public string username { get; set; }
        public string password { get; set; }
        public bool rememberMe { get; set; }
    }

    class User
    {
        public int accountId { get; set; }
        public int playerId { get; set; }
        public string username { get; set; }
        public int adminLevel { get; set; }
        public bool adminDuty { get; set; } = false;
        public string adminName { get; set; }
        public string emailAddress { get; set; }
        public string adminPed { get; set; }
        public bool isFlying { get; set; }
        public bool isFrozen { get; set; } = false;
        public uint playerDimension { get; set; }
        public int maxCharacters { get; set; }
    }

    class SharedDataAccount
    {
        public int accountId { get; set; }
        public int playerId { get; set; }
        public string username { get; set; }
        public int adminLevel { get; set; }
        public bool adminDuty { get; set; } = false;
        public string adminName { get; set; }
        public bool isFlying { get; set; }
        public bool isFrozen {get; set;}
        public bool isOnCharacterCreation { get; set; }
    }

    class SharedDataCharacter
    {
        public int characterId { get; set; }
        public string characterName { get; set; }
        public CharacterModel characterModel { get; set; }
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


    public static class DefaultSpawn
    {
        public static double pos_x { get { return -1035.7; } }
        public static double pos_y { get { return -2733.4; } }
        public static double pos_z { get { return -13.8; } }
    }
}
