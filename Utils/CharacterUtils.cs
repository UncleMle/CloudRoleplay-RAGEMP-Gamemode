using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Utils
{
    internal class CharacterUtils
    {
        public static ulong playTimeToDays(ulong playTime)
        {
            return playTime / 86400;
        }

    }
}
