import React, { useState } from "react";
// import { fetchNui } from "../utils/fetchNui";
import { ConfigInterface, SettingsInterface } from "@/App";
import { Button, Transition } from "@mantine/core";
import { motion } from "framer-motion";
import { Cog, Fuel } from "lucide-react";
import { FaUserAltSlash } from "react-icons/fa";
import "../App.css";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { animateNumber } from "../utils/animateNumber";

interface props {
  userSettings: SettingsInterface;
  scriptConfig: ConfigInterface;
}

interface VehData {
  speed: number | string;
  rpm: number | string;
  gear: number | string;
  fuel: number | string;
  isSeatbeltOn: boolean;
}

const CarHud: React.FC<props> = ({ userSettings, scriptConfig }) => {
  const [vehicleData, setVehicleData] = useState<VehData>({
    speed: 0,
    rpm: 0,
    gear: 0,
    fuel: 100,
    isSeatbeltOn: false,
  });

  const framework = scriptConfig.Framework.toLowerCase();

  const isSeatbeltEnabled =
    framework === "esx" ||
    (framework === "qb" && scriptConfig["Framework Options"].Seatbelt);

  useNuiEvent<VehData>("nui:state:vehdata", (data) => {
    const mphContainer = document.getElementById(
      "vehSpeed"
    ) as HTMLParagraphElement;
    setVehicleData(data);
    animateNumber(mphContainer, data.speed, "", userSettings);
  });
  return (
    <>
      {process.env.NODE_ENV === "development" && (
        <>
          <div className="flex flex-col justify-center items-start ml-5">
            <Button
              className="bg-black rounded p-2 mt-10"
              onClick={() => {
                const updatedData: VehData = {
                  ...vehicleData,
                  isSeatbeltOn: !vehicleData.isSeatbeltOn,
                };
                setVehicleData(updatedData);
              }}
            >
              Toggle seatbelt{" "}
            </Button>
          </div>
        </>
      )}
      <div className="absolute top-[90vh]  left-1/4 -translate-x-2/4 -translate-y-2/4 font-inter text-white">
        <div
          className={`flex justify-center items-center mb-1 h-[40px] font-bold ${
            userSettings.hudMode.toString() === "2" ? "skew-x-6" : ""
          }`}
        >
          {isSeatbeltEnabled && (
            <>
              <Transition
                mounted={!vehicleData.isSeatbeltOn}
                transition="scale-y"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <div
                    style={styles}
                    className="bg-black bg-opacity-80 py-3 px-5 rounded-[2px]"
                  >
                    <FaUserAltSlash className="text-red-600 animate-pulse" />
                  </div>
                )}
              </Transition>
            </>
          )}
        </div>
        <div
          className={`flex flex-row bg-black opacity-80 rounded-[2px] p-2 px-1 font-bold justify-between scale-90 ${
            userSettings.hudMode.toString() == "2" ? "skew-x-6" : ""
          } ${!isSeatbeltEnabled ? "mt-2" : ""}`}
        >
          <div className="flex p-1 gap-2 justify-center items-center">
            <motion.p
              initial={{
                y: 20,
              }}
              animate={{
                y: 0,
              }}
              key={vehicleData.gear}
            >
              {vehicleData.gear}
            </motion.p>
            <Cog size={16} />
          </div>
          <div className="flex justify-center items-center flex-col mr-5 ml-5">
            <p className="" id="vehSpeed">
              0
            </p>
            <p className="text-xs opacity-50">
              {userSettings.measurementSystem === "MPH" ? "MP/H" : "KM/H"}
            </p>
          </div>
          <div className="flex p-1 gap-2 justify-center transition-all">
            <Fuel size={16} strokeWidth={2} className="place-self-center" />
            <div
              className={`w-[7px] rounded-[2px] max-h-full bg-blue-600 transition-all place-self-end`}
              style={{
                height: `${vehicleData.fuel}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarHud;
