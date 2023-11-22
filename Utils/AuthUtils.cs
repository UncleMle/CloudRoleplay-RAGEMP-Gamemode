using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace CloudRP.Utils
{
    internal class AuthUtils
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

        public static string generateString(int length)
        {
            string characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            string result = "";

            for (int i = 0; i < length; i++)
            {
                Random r = new Random();
                int rInt = r.Next(0, characters.Length);
                result += characters[rInt];
            }

            return result;
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
        public bool isFlying { get; set; }
        public bool isFrozen { get; set; } = false;
        public bool isOnCharacterCreation { get; set; }
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
    }

    public static class DefaultSpawn
    {
        public static double pos_x { get { return -1035.7; } }
        public static double pos_y { get { return -2733.4; } }
        public static double pos_z { get { return -13.8; } }
    }
}
