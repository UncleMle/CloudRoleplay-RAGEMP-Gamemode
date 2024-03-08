-- cloud_rp.accounts definition

CREATE TABLE `accounts` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `account_uuid` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `username` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `email_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `user_ip` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `auto_login_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `auto_login` int NOT NULL,
  `admin_status` int NOT NULL,
  `vip_status` tinyint(1) NOT NULL,
  `admin_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `admin_ped` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `client_serial` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `ban_status` int NOT NULL,
  `social_club_id` bigint unsigned NOT NULL,
  `max_characters` int NOT NULL,
  `admin_esp` tinyint(1) NOT NULL,
  `redeem_code` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `has_first_login` tinyint(1) NOT NULL DEFAULT '0',
  `vip_unix_expires` bigint NOT NULL DEFAULT '0',
  `admin_jail_time` int NOT NULL DEFAULT '0',
  `admin_jail_reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `has_passed_quiz` tinyint(1) NOT NULL DEFAULT '0',
  `quiz_fail_unix` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.admin_markers definition

CREATE TABLE `admin_markers` (
  `admin_marker_id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `text` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `pos_x` float NOT NULL,
  `pos_y` float NOT NULL,
  `pos_z` float NOT NULL,
  PRIMARY KEY (`admin_marker_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.admin_punishments definition

CREATE TABLE `admin_punishments` (
  `admin_punishment_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `owner_account_id` int NOT NULL,
  `punishment_type` int NOT NULL,
  `admin_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `punishment_reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `is_void` tinyint(1) NOT NULL,
  `unix_expires` bigint NOT NULL,
  PRIMARY KEY (`admin_punishment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.bans definition

CREATE TABLE `bans` (
  `ban_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `ip_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `client_serial` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `social_club_id` bigint unsigned NOT NULL,
  `social_club_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `account_id` int NOT NULL,
  `ban_reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `admin` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `lift_unix_time` bigint NOT NULL,
  `issue_unix_date` bigint NOT NULL,
  PRIMARY KEY (`ban_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.character_clothes definition

CREATE TABLE `character_clothes` (
  `clothing_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `character_id` int NOT NULL,
  `mask` int NOT NULL,
  `mask_texture` int NOT NULL,
  `torso` int NOT NULL,
  `torso_texture` int NOT NULL,
  `leg` int NOT NULL,
  `leg_texture` int NOT NULL,
  `bags` int NOT NULL,
  `bag_texture` int NOT NULL,
  `shoes` int NOT NULL,
  `shoes_texture` int NOT NULL,
  `access` int NOT NULL,
  `access_texture` int NOT NULL,
  `undershirt` int NOT NULL,
  `undershirt_texture` int NOT NULL,
  `armor` int NOT NULL,
  `armor_texture` int NOT NULL,
  `decals` int NOT NULL,
  `decals_texture` int NOT NULL,
  `top` int NOT NULL,
  `top_texture` int NOT NULL,
  PRIMARY KEY (`clothing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.character_models definition

CREATE TABLE `character_models` (
  `character_model_id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `rotation` int NOT NULL,
  `firstHeadShape` int NOT NULL,
  `secondHeadShape` int NOT NULL,
  `firstSkinTone` int NOT NULL,
  `secondSkinTone` int NOT NULL,
  `headMix` int NOT NULL,
  `skinMix` int NOT NULL,
  `sex` tinyint(1) NOT NULL,
  `noseWidth` int NOT NULL,
  `noseLength` int NOT NULL,
  `noseTip` int NOT NULL,
  `browHeight` int NOT NULL,
  `cheekBoneHeight` int NOT NULL,
  `cheeksWidth` int NOT NULL,
  `lips` int NOT NULL,
  `lipstick` int NOT NULL,
  `jawHeight` int NOT NULL,
  `chinPosition` int NOT NULL,
  `chinShape` int NOT NULL,
  `noseHeight` int NOT NULL,
  `noseBridge` int NOT NULL,
  `noseBridgeShift` int NOT NULL,
  `browWidth` int NOT NULL,
  `cheekBoneWidth` int NOT NULL,
  `eyes` int NOT NULL,
  `jawWidth` int NOT NULL,
  `chinLength` int NOT NULL,
  `chinWidth` int NOT NULL,
  `neckWidth` int NOT NULL,
  `eyeColour` int NOT NULL,
  `blemishes` int NOT NULL,
  `ageing` int NOT NULL,
  `facialHairStyle` int NOT NULL,
  `facialHairColour` int NOT NULL,
  `chestHairStyle` int NOT NULL,
  `hairStyle` int NOT NULL,
  `hairColour` int NOT NULL,
  `hairHighlights` int NOT NULL,
  `eyebrowsStyle` int NOT NULL,
  `eyebrowsColour` int NOT NULL,
  `complexion` int NOT NULL,
  `sunDamage` int NOT NULL,
  `molesFreckles` int NOT NULL,
  `blushStyle` int NOT NULL,
  `makeup` int NOT NULL,
  PRIMARY KEY (`character_model_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.`characters` definition

CREATE TABLE `characters` (
  `character_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `owner_id` int NOT NULL,
  `character_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `position_x` float NOT NULL,
  `position_y` float NOT NULL,
  `position_z` float NOT NULL,
  `last_login` datetime(6) NOT NULL,
  `character_health` int NOT NULL,
  `character_water` double NOT NULL,
  `character_hunger` double NOT NULL,
  `character_isbanned` bigint unsigned NOT NULL,
  `money_amount` bigint NOT NULL,
  `play_time_seconds` bigint unsigned NOT NULL,
  `player_dimension` int unsigned NOT NULL,
  `player_exp` bigint unsigned NOT NULL,
  `injured_timer` int NOT NULL,
  `cash_amount` bigint NOT NULL DEFAULT '0',
  `freelance_job_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `character_license_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `character_faction_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `faction_duty_status` int NOT NULL,
  `faction_duty_uniform` int NOT NULL DEFAULT '0',
  `freelance_job_uniform` int NOT NULL DEFAULT '0',
  `faction_ranks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `salary_amount` bigint NOT NULL DEFAULT '0',
  `last_spun_luckywheel` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`character_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.criminal_charges definition

CREATE TABLE `criminal_charges` (
  `criminal_charge_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `owner_id` int NOT NULL,
  `criminal_charge_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `totalTime` int NOT NULL,
  `totalFine` int NOT NULL,
  PRIMARY KEY (`criminal_charge_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.faction_ranks definition

CREATE TABLE `faction_ranks` (
  `faction_rank_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `faction_owner_id` int NOT NULL,
  `rank_salary` int NOT NULL,
  `rank_permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `allowed_uniforms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `allowed_vehicles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `allowed_weapons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `rank_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`faction_rank_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.factions definition

CREATE TABLE `factions` (
  `faction_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `faction_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `owner_id` int NOT NULL,
  `faction_allowed_vehicles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`faction_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.floating_dos definition

CREATE TABLE `floating_dos` (
  `float_do_id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `pos_x` float NOT NULL,
  `pos_y` float NOT NULL,
  `pos_z` float NOT NULL,
  `text` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`float_do_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.houses definition

CREATE TABLE `houses` (
  `house_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `house_owner_id` int NOT NULL,
  `house_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `house_position_x` float NOT NULL,
  `house_position_y` float NOT NULL,
  `house_position_z` float NOT NULL,
  `house_price` int NOT NULL,
  `blip_visible` tinyint(1) NOT NULL DEFAULT '0',
  `garage_size` int NOT NULL DEFAULT '0',
  `house_interior_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`house_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.inventory_items definition

CREATE TABLE `inventory_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `displayName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.nicknames definition

CREATE TABLE `nicknames` (
  `nickname_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `owner_id` int NOT NULL,
  `target_character_id` int NOT NULL,
  `nickname` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`nickname_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.player_tattoos definition

CREATE TABLE `player_tattoos` (
  `tattoo_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `tattoo_owner_id` int NOT NULL,
  `tattoo_lib` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `tattoo_collection` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`tattoo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=195 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.roulette_tables definition

CREATE TABLE `roulette_tables` (
  `roulette_table_id` int NOT NULL AUTO_INCREMENT,
  `pos_x` float NOT NULL,
  `pos_y` float NOT NULL,
  `pos_z` float NOT NULL,
  `heading` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`roulette_table_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.server_connections definition

CREATE TABLE `server_connections` (
  `join_log_id` int NOT NULL AUTO_INCREMENT,
  `unix` bigint NOT NULL,
  `connection_type` int NOT NULL,
  `character_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `character_id` int NOT NULL,
  `player_id` int NOT NULL,
  PRIMARY KEY (`join_log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2823 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.server_logs definition

CREATE TABLE `server_logs` (
  `server_log_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `server_log_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `server_log_description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `character_owner_id` int NOT NULL,
  `log_type` int NOT NULL,
  `account_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`server_log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.vehicle_garages definition

CREATE TABLE `vehicle_garages` (
  `garage_id` int NOT NULL AUTO_INCREMENT,
  `garage_owner_id` int NOT NULL,
  `vehicle_slots` int NOT NULL,
  `pos_x` float NOT NULL,
  `pos_y` float NOT NULL,
  `pos_z` float NOT NULL,
  `garage_sell_price` int NOT NULL,
  PRIMARY KEY (`garage_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.vehicle_keys definition

CREATE TABLE `vehicle_keys` (
  `vehicle_key_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `vehicle_id` int NOT NULL,
  `target_character_id` int NOT NULL,
  `vehicle_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `nickname` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`vehicle_key_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.vehicle_mods definition

CREATE TABLE `vehicle_mods` (
  `vehicle_mod_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `vehicle_owner_id` int NOT NULL,
  `armor` int NOT NULL DEFAULT '0',
  `back_wheels` int NOT NULL DEFAULT '0',
  `boost` int NOT NULL DEFAULT '0',
  `brakes` int NOT NULL DEFAULT '0',
  `colour_1` int NOT NULL DEFAULT '0',
  `colour_2` int NOT NULL DEFAULT '0',
  `dial_design` int NOT NULL DEFAULT '0',
  `engine` int NOT NULL DEFAULT '0',
  `exhaust` int NOT NULL DEFAULT '0',
  `fender` int NOT NULL DEFAULT '0',
  `frame` int NOT NULL DEFAULT '0',
  `front_bumper` int NOT NULL DEFAULT '0',
  `front_wheels` int NOT NULL DEFAULT '0',
  `grille` int NOT NULL DEFAULT '0',
  `hood` int NOT NULL DEFAULT '0',
  `horns` int NOT NULL DEFAULT '0',
  `hydraulics` int NOT NULL DEFAULT '0',
  `livery` int NOT NULL DEFAULT '0',
  `ornaments` int NOT NULL DEFAULT '0',
  `plaques` int NOT NULL DEFAULT '0',
  `plate` int NOT NULL DEFAULT '0',
  `plate_holders` int NOT NULL DEFAULT '0',
  `rear_bumper` int NOT NULL DEFAULT '0',
  `right_fender` int NOT NULL DEFAULT '0',
  `roof` int NOT NULL DEFAULT '0',
  `shift_lever` int NOT NULL DEFAULT '0',
  `side_skirt` int NOT NULL DEFAULT '0',
  `spoilers` int NOT NULL DEFAULT '0',
  `steering_wheel` int NOT NULL DEFAULT '0',
  `suspension` int NOT NULL DEFAULT '0',
  `transmission` int NOT NULL DEFAULT '0',
  `trim_design` int NOT NULL DEFAULT '0',
  `turbo` int NOT NULL DEFAULT '0',
  `window_tint` int NOT NULL DEFAULT '0',
  `xenon` int NOT NULL DEFAULT '0',
  `wheel_type` int NOT NULL DEFAULT '0',
  `pearleascent` int NOT NULL DEFAULT '0',
  `wheel_colour` int NOT NULL DEFAULT '0',
  `neon_colour_b` int NOT NULL DEFAULT '0',
  `neon_colour_g` int NOT NULL DEFAULT '0',
  `neon_colour_r` int NOT NULL DEFAULT '0',
  `headlight_colour` int NOT NULL DEFAULT '0',
  `tyre_smoke_b` int NOT NULL DEFAULT '0',
  `tyre_smoke_g` int NOT NULL DEFAULT '0',
  `tyre_smoke_r` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`vehicle_mod_id`)
) ENGINE=InnoDB AUTO_INCREMENT=292 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- cloud_rp.vehicles definition

CREATE TABLE `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `CreatedDate` datetime(6) NOT NULL,
  `UpdatedDate` datetime(6) NOT NULL,
  `vehicle_uuid` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `owner_id` int NOT NULL,
  `vehicle_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `vehicle_locked` tinyint(1) NOT NULL,
  `vehicle_spawn_hash` int unsigned NOT NULL,
  `numberplate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `position_x` float NOT NULL,
  `position_y` float NOT NULL,
  `position_z` float NOT NULL,
  `rotation` float NOT NULL,
  `vehicle_dimension` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `vehicle_insurance_id` int NOT NULL,
  `vehicle_garage_id` int NOT NULL,
  `vehicle_fuel` double NOT NULL,
  `vehicle_distance` bigint unsigned NOT NULL,
  `vehicle_health` float NOT NULL DEFAULT '0',
  `owner_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `rotation_x` float NOT NULL DEFAULT '0',
  `rotation_y` float NOT NULL DEFAULT '0',
  `rotation_z` float NOT NULL DEFAULT '0',
  `dealership_id` int NOT NULL DEFAULT '0',
  `dealership_spot_id` int NOT NULL DEFAULT '0',
  `dealership_price` int NOT NULL,
  `dealership_description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `vehicle_display_name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `vehicle_class_id` int NOT NULL DEFAULT '0',
  `faction_owner_id` int NOT NULL DEFAULT '0',
  `insurance_status` tinyint(1) NOT NULL DEFAULT '0',
  `vehicle_parking_lot_id` int NOT NULL DEFAULT '0',
  `tyre_states` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`vehicle_id`)
) ENGINE=InnoDB AUTO_INCREMENT=297 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;