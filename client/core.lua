Script = {
  settings = {},
  standalone = {},
  framework = {},
  fuelFunction = nil,
  visible = true,
  measurementSystem = 2.236936
}

Script.init = function()
  CreateThread(function()
    while not Script.settings do
      Wait(500)
    end

    Debug("Script.settings", json.encode(Script.settings))

    UIMessage("nui:data:cfg", Config)

    xpcall(checkFuelScripts, function(err)
      print("Error when calling the checkFuelScripts function: ", err)
    end)

    while Script.visible do
      local sleep = 1000
      local ped = PlayerPedId()
      local pid = PlayerId()
      -- Status
      local playerStats = {
        health = math.floor((GetEntityHealth(ped) - 100) / (GetEntityMaxHealth(ped) - 100) * 100),
        armor = math.floor(GetPedArmour(ped)),
        mic = NetworkIsPlayerTalking(pid)
      }

      UIMessage("nui:data:playerstats", playerStats)

      -- Speedometer
      local isInVeh = IsPedInAnyVehicle(ped, false)
      if isInVeh then
        UIMessage("nui:state:isinveh", true)
        local currVeh = GetVehiclePedIsIn(ped, false)

        local vehData = {
          speed = math.floor(GetEntitySpeed(currVeh) * Script.measurementSystem),
          rpm = GetVehicleCurrentRpm(currVeh),
          gear = GetVehicleCurrentGear(currVeh),
          fuel = tostring(math.floor(Script:FuelFunction() or 0))
        }

        UIMessage("nui:state:vehdata", vehData)
        Wait(1000)
      else
        UIMessage("nui:state:isinveh", false)
      end

      Wait(sleep)
    end
  end)
end

Script.sendData = function()
  while not PlayerId() do
    Wait(500)
  end

  SetTimeout(2000, function()
    local playerId = GetPlayerServerId(PlayerId())
    UIMessage("nui:state:scriptConfig", Config)

    UIMessage("nui:state:pid", playerId)

    TriggerServerEvent("vhud:cb")

    local hudSettings = GetResourceKvpString("hud:kvp:settings")

    if not hudSettings then
      UIMessage("nui:state:globalsettings", Config["Default Settings"])
      UIMessage("nui:state:settings", Config["Default Settings"])
      Debug("Player didn't have any saved settings, the default ones are being sent to the NUI.")
      Script.settings = Config["Default Settings"]
      return
    end

    local storedHudSettings = json.decode(hudSettings)

    Script.settings = storedHudSettings

    UIMessage("nui:state:globalsettings", storedHudSettings)
    UIMessage("nui:state:settings", storedHudSettings)

    Debug("[nui:state:globalsettings] was called, with the data storedHudSettings: ", json.encode(storedHudSettings))
  end)
end

Script.grabPlayerCount = function()
  CreateThread(function()
    while Script.visible do
      TriggerServerEvent("vhud:cb")
      Wait(60 * 1000)
    end
  end)
end

xpcall(Script.init, function(err)
  return print("Error when calling the Script.init function:", err)
end)

xpcall(Script.sendData, function(err)
  return print("Error when calling the Script.sendData function:", err)
end)

xpcall(Script.grabPlayerCount, function(err)
  return print("Error when calling the Script.GrabPlayerCount function:", err)
end)
