# CloudRP RageMP Gamemode

Created using the RAGE:MP C# Server Side API, EF Core, TS & VueJS.

### Contact

You can contact me at

-Discord unclemole <br>
-[Gamemodes discord server](https://discord.gg/6WKZt68qJT)

### Credits

- For the vehicle images used within the gamemode https://www.gta5-mods.com/misc/preview-images-for-add-on-vehicle-spawner-v1-4-2-all-original-dlc-support-for-custom-add-on-vehicles
- For help with some of the lucky wheel logic https://rage.mp/files/file/374-lucky-wheel/
- For help with the discord intergration logic https://rage.mp/files/file/325-cragemp-discord-integration/
- For the icons used within the gamemode https://www.flaticon.com/
- For some of the fonts used within the gamemode https://www.dafont.com/
- For the weapon data json (Root Cause)[https://gist.github.com/root-cause] https://gist.github.com/root-cause/3f29d38179b12245a003fb4fff615335
 
- (If I missed anything please let me know)
### Contributing and bug reporting

To contribute please contact me on my discord ``unclemole`` and include why you wish to contribute. <br>
To report a bug you can open an issue on the github repo (Don't contact me on discord about any bugs.) <b>(bear in mind there is no licensing with this software and it is free to use).</b>

### Features not implemented or full completed yet.

* Full inventory system.

* Being able to call / message through the phone (Only the UI for it is finished).

* Full watchdog system

* Full casino system (still missing features etc Roulette Table)

### Features

* Fully synced vehicle systems (sirens, interactions, WI menu, Dirt, fuel, indicators, stalling system, tyres, windows, distance calculation)

* Character creation system

* Nickname system

* Housing system (still needs work as there is no furniture system yet)

* Full admin system w/ discord intergrated report system

* Custom chat system

* Authentication and ban system with OTP emailing

* Custom death and injury system

* Nametagging system

* VOIP system

* Weapon display system

* Bullet fragments (temp disabled)

* Vehicle Stalling (temp disabled)

* Custom clothing system with clothing shops

* Custom door control

* Job Center

* Bus Driver, Garbage Job, Gruppe Six Job, Lawn Mower Job, Postal Job, Trucker Job. Complete Freelance Job System

* Barber Shop

* Rentable Vehicles

* NPC Interaction & Raycast interaction system

* DMV System

* Lucky Wheel

* Speedcameras 

* Full in-game discord intergration

* Toll Booths (Still need work)

* Attachment & Animation sync

* Banking system with ATMs and Bank Deposit and withdrawl.

* Player Phone system

* Over 130+ roleplay commands

* Animation menu

* UCP (user control panel) Written in with the next framework.

* Full vehicle system

* Parking System

* Insurance System

* Faction System

* Full Anti Cheat

* Weather system synced to location of your choice

### How to Install

###### 1. First navigate to ``meta.example.xml`` and setup your credentials (for getting channel ID's make sure your discord is in developer mode then right click on a channel and "Copy ID").
```c#
<meta>
    <info name="CloudRP" description="Cloud RP Server" />
    <script src="bin/Debug/netcoreapp3.1/CloudRP.dll" />
	<settings>
		<setting name="jsonentrypoint" value="/dotnet/resources/CloudRP/Json/"/>
		<setting name="host" value="localhost"/>
		<setting name="username" value="dbuser"/>
		<setting name="password" value="dbpass"/>
		<setting name="database" value="cloud_rp"/>
		<setting name="gmailuser" value="smptpuser"/>
		<setting name="gmailpass" value="smptppass"/>
		<setting name="discordtoken" value="discordapptoken"/>
		<setting name="discordstaffchannel" value="discordstaffchannelid"/>
		<setting name="discordreportalertchannel" value="discordreportalertchannelid"/>
		<setting name="discordguildid" value="discordguildid"/>
		<setting name="discordreportcat" value="discordreportcategory"/>
		<setting name="weatherapikey" value="weatherapikey"/>
		<setting name="vpnapikey" value="vpnapikey" />
		<setting name="banwebhookaddress" value="banswebhookaddress" />
		<setting name="production" value="true" />
	</settings>
</meta>
```

For setting up ``gmailuser`` & ``gmailpass`` 
[Good Tutorial](https://www.youtube.com/watch?v=yuOK6D7deTo)

**After setting it all up ensure to rename ``meta.example.xml`` to ``meta.xml``**

###### 2. Acquire the RAGEMP server binary and build the solution.
<img src="https://i.imgur.com/dQudDwL.png">

[Good Tutorial for setting up working enviroment](https://www.youtube.com/watch?v=M25qVHzh_70&pp=ygUkc2V0dGluZyB1cCB3b3JraW5nIGVudmlyb21lbnQgcmFnZW1w)

###### 3. Building the client-side.

Head over to ``ClientSide\client`` and use ``npm i`` to install the required modules. After doing so you can run the command ``npm run build`` and copy the ``index.js`` file over to your ``client_packages`` folder.

###### 4. Building the client-side-ui

Head over to ``ClientSide\client-ui`` and use ``npm i`` to install the required modules. After doing so you can run the command ``npm run build`` and copy the ``dist`` file over to client_packages. Ensure to rename the ``dist`` file to ``package2`` as this is the protocol I used for the UI's you can learn more about it [here](https://wiki.rage.mp/index.php?title=Package_Protocol).

###### 5. Applying the first migration.

After you have correctly setup your working enviroment you will need to commit your first migration over to the database as the ORM EF Core is used. Head over to your PMC (Package Manager Console) located in the bottom left side of your VS IDE.
And enter the commands ``add-migration "first migration"`` then ``update-database`` and if database credentials are setup correctly it should migrate all entities into your DB.  

###### 6. Running the server.

After the setup is completed you should be able to run the ``RAGEMP-Server.exe`` and start the server. 

# Misc

If your hosting this gamemode from a server external from your local network ensure to port forward so you can connect. [Getting started with server RAGE:MP](https://wiki.rage.mp/index.php?title=Getting_Started_with_Server)

Web Panel: ``UserControlPanel``

To use the web panel setup your DB credentials in ``UserControlPanel\.env.example``

```
DATABASE_USERNAME="db username"
DATABASE_HOST="server host name"
DATABASE_PASSWORD="db password"
DATABASE_DATABASE="database"
RAGEMP_SERVERIP="server ip seperated with commas etc 123,124,4,22"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="recaptcha client key"
RECAPTCHA_SECRET_KEY="recaptcha server key"
DISCORD_BANS_WEBHOOK="discord bans webhook"
```

You can find more about google recaptcha [here](https://www.google.com/recaptcha/about/)

To edit the UI you must run the VueJS dev server (located in ``ClientSide\client-ui``) once your changes are made simply build the UI with ``npm run build`` and repeat step 4.

# In game images
<img src="https://i.imgur.com/07HxrFc.png">
<img src="https://i.imgur.com/mXZHVeG.png">
<img src="https://i.imgur.com/XkrfcAT.png">
<img src="https://i.imgur.com/2WRREeN.png">
<img src="https://i.imgur.com/SiQxB22.png">
<img src="https://i.imgur.com/Y7OAFmi.png">
<img src="https://i.imgur.com/GdrY9zi.png">
<img src="https://i.imgur.com/TDdEAlQ.png">
<img src="https://i.imgur.com/hnZwqOT.png">
<img src="https://i.imgur.com/vmWRkMH.png">
<img src="https://i.imgur.com/bnHcJOl.png">
<img src="https://i.imgur.com/QlBHJsu.png">
<img src="https://i.imgur.com/FMO6vLu.png">
<img src="https://i.imgur.com/QlBHJsu.png">
<img src="https://i.imgur.com/ebFg4Dx.png">
<img src="https://i.imgur.com/aKBrbSK.png">
** + More **
