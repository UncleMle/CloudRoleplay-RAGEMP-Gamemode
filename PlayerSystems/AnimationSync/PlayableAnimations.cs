using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.PlayerSystems.AnimationSync
{
    public class PlayableAnimations
    {
        public static List<AnimationData> playableAnims = new List<AnimationData>
        {
            new AnimationData { anim = "base", flag = 33, dict = "special_ped@mountain_dancer@base", name = "Dancing" },
            new AnimationData { anim = "mnt_dnc_angel", flag = 33, dict = "special_ped@mountain_dancer@monologue_2@monologue_2a", name = "Groovy 1" },
            new AnimationData { anim = "mnt_dnc_buttwag", flag = 33, dict = "special_ped@mountain_dancer@monologue_3@monologue_3a", name = "Groovy 2" },
            new AnimationData { anim = "mnt_dnc_verse", flag = 33,dict = "special_ped@mountain_dancer@monologue_4@monologue_4a", name = "Tap dancing" },
            new AnimationData { anim = "lift_hands_in_air_loop", dict = "rcmpaparazzo_4", flag = 49, name = "Hands up" },
            new AnimationData { anim = "idle_c", dict = "random@arrests@busted", flag = 49, name = "Hands behind head" },
            new AnimationData { anim = "base", dict = "amb@world_human_cheering@male_a", flag = 49, name = "Clapping" },
            new AnimationData { anim = "middle_finger", dict = "nm@hands", flag = 33, name = "T-Pose" },
            new AnimationData { anim = "idle_a", flag = 49, dict = "mini@hookers_sp", name = "Blow a kiss" },
            new AnimationData { anim = "mp_player_int_finger_02", flag = 49, dict = "mp_player_int_upperfinger", name = "Flip Off" },
        };
    }
}
