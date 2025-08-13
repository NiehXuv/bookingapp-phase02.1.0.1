import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  MapPin,
  ArrowUpDown,
  Calendar,
  Plane,
  Train,
  Bus,
  Car,
  Plus,
  Minus,
} from "lucide-react";
import NavBar from "../components/NavBar";

const SearchTransportScreen = () => {
  const navigate = useNavigate();
  const [isOneWay, setIsOneWay] = useState(true);
  const [selectedTransport, setSelectedTransport] = useState("Flight");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSearchClick = () => {
    navigate("/transport-results");
  };

  const handleSwapLocations = () => {
    // Handle swapping from/to locations
  };

  const transportTypes = [
    { name: "Flight", icon: Plane },
    { name: "Train", icon: Train },
    { name: "Bus", icon: Bus },
    { name: "Ferry", icon: Car },
    { name: "Car", icon: Car },
  ];

  return (
    <div className="relative w-full max-w-[430px] mx-auto h-screen bg-gradient-to-b from-travel-white to-travel-text overflow-hidden font-sf-pro">
      {/* Background Gradient Blob */}
      <div
        className="absolute w-[562px] h-[562px] rounded-full"
        style={{
          left: "1px",
          top: "428px",
          transform: "rotate(-30deg)",
          background:
            "linear-gradient(164deg, rgba(46, 123, 89, 0.30) 7.92%, rgba(255, 255, 255, 0.00) 92.08%)",
          filter: "blur(0px)",
        }}
      />

      {/* Main Container */}
      <div className="w-full h-[788px] rounded-[40px] border border-white/80 bg-gradient-to-b from-travel-white via-travel-white to-travel-white/80 shadow-lg backdrop-blur-[25px]">
        {/* Status Bar */}
        <div className="relative z-10 flex justify-between items-center w-full h-[50px] pt-[21px] px-4">
          <div className="text-black text-[17px] font-medium">9:41</div>
          <div className="w-[124px] h-[10px]" />
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-black rounded-sm" />
              <div className="w-1 h-3 bg-black rounded-sm" />
              <div className="w-1 h-3 bg-black rounded-sm" />
              <div className="w-1 h-3 bg-black opacity-35 rounded-sm" />
            </div>
            <svg width="24" height="12" viewBox="0 0 24 12" className="ml-2">
              <rect
                x="0"
                y="2"
                width="21"
                height="8"
                rx="2"
                stroke="black"
                strokeOpacity="0.35"
                fill="none"
              />
              <rect x="2" y="4" width="17" height="4" rx="1" fill="black" />
              <path
                d="M22 4v4c1 0 2-1 2-2s-1-2-2-2z"
                fill="black"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute left-5 top-[72px] w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]"
        >
          <ArrowLeft className="w-5 h-5 text-travel-secondary" />
        </button>

        {/* Title */}
        <h1 className="absolute left-[113px] top-[80px] w-[205px] h-[23px] text-travel-primary text-[32px] font-medium text-center leading-[22px]">
          Find Transport
        </h1>

        {/* Form Content */}
        <div className="absolute left-5 right-5 top-[132px] flex flex-col justify-center items-center gap-5 h-[636px]">
          {/* From/To Section */}
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col items-start gap-[10px] flex-1">
              {/* From Field */}
              <div className="flex h-[50px] px-5 justify-between items-center w-full rounded-[15px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
                <div className="flex items-center gap-[10px]">
                  <Home className="w-[18px] h-4 text-travel-secondary" />
                  <span className="text-[16px] text-travel-text/30 font-light leading-[22px]">
                    From
                  </span>
                </div>
                <MapPin className="w-5 h-5 text-travel-secondary" />
              </div>

              {/* To Field */}
              <div className="flex h-[50px] px-5 items-center gap-[10px] w-full rounded-[15px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
                <MapPin className="w-5 h-5 text-travel-secondary" />
                <span className="text-[16px] text-travel-text/30 font-light leading-[22px]">
                  To
                </span>
              </div>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLocations}
              className="w-[30px] h-[30px] p-[5px] flex justify-center items-center rounded-[30px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]"
            >
              <ArrowUpDown className="w-5 h-5 text-travel-secondary" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-travel-text/10" />

          {/* Trip Type Toggle */}
          <div className="flex items-center gap-[10px] w-full">
            <button
              onClick={() => setIsOneWay(true)}
              className={`flex-1 flex justify-center items-center gap-[5px] h-10 rounded-[30px] px-5 py-[15px] ${
                isOneWay
                  ? "bg-travel-primary text-white"
                  : "border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px] text-travel-secondary"
              }`}
            >
              <span className="text-[14px] font-normal leading-[22px]">
                One-way
              </span>
            </button>
            <button
              onClick={() => setIsOneWay(false)}
              className={`flex-1 flex justify-center items-center gap-[5px] h-10 rounded-[30px] px-5 py-[15px] ${
                !isOneWay
                  ? "bg-travel-primary text-white"
                  : "border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px] text-travel-secondary"
              }`}
            >
              <span className="text-[14px] font-normal leading-[22px]">
                Round-trip
              </span>
            </button>
          </div>

          {/* Date Fields */}
          <div className="flex justify-center items-center gap-[10px] w-full">
            <div className="flex h-[50px] px-5 py-[10px] justify-between items-center flex-1 rounded-[15px] border border-travel-chip-border bg-travel-white/40 backdrop-blur-[10px]">
              <span className="text-[16px] text-travel-text/30 font-light leading-[22px]">
                Arrival Date
              </span>
              <Calendar className="w-5 h-5 text-travel-secondary" />
            </div>
            <div
              className={`flex h-[50px] px-5 py-[10px] justify-between items-center flex-1 rounded-[15px] border border-travel-text/30 bg-travel-white/40 backdrop-blur-[10px] ${
                isOneWay ? "opacity-30" : "opacity-100"
              }`}
            >
              <span className="text-[16px] text-travel-text/30 font-light leading-[22px]">
                Return Date
              </span>
              <Calendar
                className={`w-5 h-5 ${
                  isOneWay ? "text-travel-text/30" : "text-travel-secondary"
                }`}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-travel-text/10" />

          {/* Transport Type Selection */}
          <div className="flex justify-center items-center flex-wrap gap-[10px] w-full">
            <button
              onClick={() => setSelectedTransport("Flight")}
              className={`flex px-5 py-[15px] justify-center items-center gap-[10px] rounded-[30px] backdrop-blur-[5px] ${
                selectedTransport === "Flight"
                  ? "bg-travel-primary text-white"
                  : "border border-travel-chip-border bg-travel-white/50 text-travel-secondary"
              }`}
            >
              <Plane className="w-[18px] h-4" />
              <span className="text-[16px] font-normal leading-[22px]">
                Flight
              </span>
            </button>
            <button
              onClick={() => setSelectedTransport("Train")}
              className={`flex px-5 py-[15px] justify-center items-center gap-[10px] rounded-[30px] backdrop-blur-[5px] ${
                selectedTransport === "Train"
                  ? "bg-travel-primary text-white"
                  : "border border-travel-chip-border bg-travel-white/50 text-travel-secondary"
              }`}
            >
              <Train className="w-4 h-4" />
              <span className="text-[16px] font-normal leading-[22px]">
                Train
              </span>
            </button>
            <button
              onClick={() => setSelectedTransport("Bus")}
              className={`flex px-5 py-[15px] justify-center items-center gap-[10px] rounded-[30px] backdrop-blur-[5px] ${
                selectedTransport === "Bus"
                  ? "bg-travel-primary text-white"
                  : "border border-travel-chip-border bg-travel-white/50 text-travel-secondary"
              }`}
            >
              <Bus className="w-4 h-4" />
              <span className="text-[16px] font-normal leading-[22px]">
                Bus
              </span>
            </button>
            <button
              onClick={() => setSelectedTransport("Ferry")}
              className={`flex px-5 py-[15px] justify-center items-center gap-[10px] rounded-[30px] backdrop-blur-[5px] ${
                selectedTransport === "Ferry"
                  ? "bg-travel-primary text-white"
                  : "border border-travel-chip-border bg-travel-white/50 text-travel-secondary"
              }`}
            >
              <Car className="w-4 h-4" />
              <span className="text-[16px] font-normal leading-[22px]">
                Ferry
              </span>
            </button>
            <button
              onClick={() => setSelectedTransport("Car")}
              className={`flex px-5 py-[15px] justify-center items-center gap-[10px] rounded-[30px] backdrop-blur-[5px] ${
                selectedTransport === "Car"
                  ? "bg-travel-primary text-white"
                  : "border border-travel-chip-border bg-travel-white/50 text-travel-secondary"
              }`}
            >
              <Car className="w-5 h-5" />
              <span className="text-[16px] font-normal leading-[22px]">
                Car
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-travel-text/10" />

          {/* Passenger Selection */}
          <div className="flex h-[90px] flex-col items-center gap-[10px] w-full">
            {/* Adults */}
            <div className="flex px-5 justify-between items-center w-full">
              <div className="flex h-[34px] flex-col justify-center items-start gap-[10px]">
                <div className="text-[20px] text-travel-text font-normal leading-[22px]">
                  Adults
                </div>
                <div className="text-[14px] text-travel-text/30 font-light leading-[22px]">
                  12+
                </div>
              </div>
              <div className="flex w-[120px] p-[5px] justify-between items-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
                <button
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="flex w-[30px] h-[30px] p-[10px] justify-center items-center gap-[10px] rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Minus className="w-[15px] h-[15px] text-white" />
                </button>
                <div className="text-[20px] text-travel-text font-normal text-center leading-[22px]">
                  {adults}
                </div>
                <button
                  onClick={() => setAdults(adults + 1)}
                  className="flex w-[30px] h-[30px] p-[10px] justify-between items-center rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Plus className="w-[15px] h-[15px] text-white" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex px-5 justify-between items-center w-full">
              <div className="flex h-[34px] flex-col justify-center items-start gap-[10px]">
                <div className="text-[20px] text-travel-text font-normal leading-[22px]">
                  Children
                </div>
                <div className="text-[14px] text-travel-text/30 font-light leading-[22px]">
                  Under 12
                </div>
              </div>
              <div className="flex w-[120px] p-[5px] justify-between items-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
                <button
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="flex w-[30px] h-[30px] p-[10px] justify-center items-center gap-[10px] rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Minus className="w-[15px] h-[15px] text-white" />
                </button>
                <div className="text-[20px] text-travel-text font-normal text-center leading-[22px]">
                  {children}
                </div>
                <button
                  onClick={() => setChildren(children + 1)}
                  className="flex w-[30px] h-[30px] p-[10px] justify-between items-center rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Plus className="w-[15px] h-[15px] text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-travel-text/10" />

          {/* Search Button */}
          <div className="flex h-16 justify-center items-center gap-5 backdrop-blur-[10px] w-full">
            <button
              onClick={handleSearchClick}
              className="flex w-full h-16 px-5 py-5 justify-center items-center gap-5 rounded-[20px] bg-travel-primary"
            >
              <span className="text-[20px] text-white font-medium leading-[22px]">
                Search
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="absolute bottom-[56px] left-0 right-0 w-full px-5">
        <div className="flex justify-center items-center gap-[10px] h-14">
          <div className="flex px-5 py-5 justify-center items-center gap-[10px] flex-1 rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
            <Home className="w-4 h-4 text-travel-icons" />
            <span className="text-[16px] text-travel-icons font-normal leading-[22px]">
              Hotel
            </span>
          </div>
          <div className="flex px-5 py-5 justify-center items-center gap-[10px] flex-1 rounded-[20px] bg-travel-primary">
            <Plane className="w-[18px] h-4 text-white" />
            <span className="text-[16px] text-white font-normal leading-[22px]">
              Transport
            </span>
          </div>
          <div className="flex px-5 py-5 justify-center items-center gap-[10px] flex-1 rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              className="w-4 h-4"
            >
              <path
                d="M8.33341 1.33333C12.0154 1.33333 15.0001 4.31799 15.0001 7.99999C15.0001 11.682 12.0154 14.6667 8.33341 14.6667C4.65141 14.6667 1.66675 11.682 1.66675 7.99999C1.66675 4.31799 4.65141 1.33333 8.33341 1.33333ZM11.1621 5.17133C10.9261 4.93599 7.86208 5.64266 6.91941 6.58599C5.97675 7.52866 5.26941 10.5927 5.50475 10.8287C5.74075 11.064 8.80475 10.3573 9.74741 9.41399C10.6907 8.47133 11.3974 5.40733 11.1621 5.17133ZM8.33341 7.33333C8.51023 7.33333 8.67979 7.40357 8.80482 7.52859C8.92984 7.65361 9.00008 7.82318 9.00008 7.99999C9.00008 8.17681 8.92984 8.34637 8.80482 8.4714C8.67979 8.59642 8.51023 8.66666 8.33341 8.66666C8.1566 8.66666 7.98703 8.59642 7.86201 8.4714C7.73699 8.34637 7.66675 8.17681 7.66675 7.99999C7.66675 7.82318 7.73699 7.65361 7.86201 7.52859C7.98703 7.40357 8.1566 7.33333 8.33341 7.33333Z"
                fill="#245D3C"
                fillOpacity="0.6"
              />
            </svg>
            <span className="text-[16px] text-travel-icons font-normal leading-[22px]">
              Tour
            </span>
          </div>
        </div>
      </div>

      {/* Page Indicators */}
      <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-[5px] w-[25px] h-[5px]">
        <div className="w-[5px] h-[5px] rounded-full bg-white/30" />
        <div className="w-[5px] h-[5px] rounded-full bg-white" />
        <div className="w-[5px] h-[5px] rounded-full bg-white/30" />
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-white z-60" />
    </div>
  );
};

export default SearchTransportScreen;
