import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Minus,
  Plus,
  Hotel,
  Plane,
  Compass,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HotelSearch = () => {
  const navigate = useNavigate();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  const handleBackClick = () => {
    navigate("/");
  };

  const handleSearchClick = () => {
    navigate("/hotel-results");
  };

  return (
    <div className="relative w-full max-w-[430px] mx-auto h-screen overflow-hidden font-sf-pro">
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #FCFCFC 0%, #002817 100%)",
        }}
      />

      {/* Background Blur Blob */}
      <div
        className="absolute w-[562px] h-[562px] rounded-full opacity-60 blur-0"
        style={{
          left: "1px",
          top: "428px",
          transform: "rotate(-30deg)",
          background:
            "linear-gradient(164deg, rgba(46, 123, 89, 0.30) 7.92%, rgba(255, 255, 255, 0.00) 92.08%)",
        }}
      />

      {/* Main Glass Card */}
      <div
        className="absolute top-0 left-0 w-full h-[526px] rounded-[40px] border border-white/80 backdrop-blur-[25px] shadow-lg"
        style={{
          background:
            "linear-gradient(180deg, #FCFCFC 0%, rgba(252, 252, 252, 0.80) 100%)",
          boxShadow: "0px 10px 20px 0px rgba(0, 28, 8, 0.10)",
        }}
      />

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

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between px-5 pt-4">
        <button
          onClick={handleBackClick}
          className="flex items-center justify-center w-[40px] h-[40px] rounded-[20px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px]"
        >
          <ArrowLeft className="w-5 h-5 text-travel-secondary" />
        </button>
        <h1 className="text-[32px] font-medium text-travel-primary leading-[22px]">
          Find Hotel
        </h1>
        <div className="w-[40px]" />
      </div>

      {/* Search Form */}
      <div className="relative z-30 px-5 pt-8">
        <div className="flex flex-col gap-5">
          {/* Location Input */}
          <div className="flex items-center gap-[10px] h-[50px] px-5 rounded-[15px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px]">
            <MapPin className="w-5 h-5 text-travel-secondary" />
            <input
              type="text"
              placeholder="Choose Your Location"
              className="flex-1 bg-transparent text-[16px] text-travel-text-light placeholder-travel-text-light outline-none"
            />
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-black/10" />

          {/* Date Inputs */}
          <div className="flex gap-[10px]">
            <div className="flex-1 flex items-center justify-between h-[50px] px-5 rounded-[15px] border border-travel-chip-border bg-white/40 backdrop-blur-[10px]">
              <span className="text-[16px] text-travel-text-light">
                Check-in Date
              </span>
              <Calendar className="w-5 h-5 text-travel-secondary" />
            </div>
            <div className="flex-1 flex items-center justify-between h-[50px] px-5 rounded-[15px] border border-travel-chip-border bg-white/40 backdrop-blur-[10px]">
              <span className="text-[16px] text-travel-text-light">
                Check-out Date
              </span>
              <Calendar className="w-5 h-5 text-travel-secondary" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-black/10" />

          {/* Guest Selection */}
          <div className="flex flex-col gap-[10px]">
            {/* Adults */}
            <div className="flex items-center justify-between px-5">
              <div className="flex flex-col">
                <span className="text-[20px] font-normal text-travel-text-dark leading-[22px]">
                  Adults
                </span>
                <span className="text-[14px] font-light text-travel-text-light leading-[22px]">
                  12+
                </span>
              </div>
              <div className="flex items-center justify-between w-[120px] p-[5px] rounded-[20px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px]">
                <button
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="flex items-center justify-center w-[30px] h-[30px] rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Minus className="w-[15px] h-[15px] text-white" />
                </button>
                <span className="text-[20px] font-normal text-travel-text-dark leading-[22px]">
                  {adults}
                </span>
                <button
                  onClick={() => setAdults(adults + 1)}
                  className="flex items-center justify-center w-[30px] h-[30px] rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Plus className="w-[15px] h-[15px] text-white" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between px-5">
              <div className="flex flex-col">
                <span className="text-[20px] font-normal text-travel-text-dark leading-[22px]">
                  Children
                </span>
                <span className="text-[14px] font-light text-travel-text-light leading-[22px]">
                  Under 12
                </span>
              </div>
              <div className="flex items-center justify-between w-[120px] p-[5px] rounded-[20px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px]">
                <button
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="flex items-center justify-center w-[30px] h-[30px] rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Minus className="w-[15px] h-[15px] text-white" />
                </button>
                <span className="text-[20px] font-normal text-travel-text-dark leading-[22px]">
                  {children}
                </span>
                <button
                  onClick={() => setChildren(children + 1)}
                  className="flex items-center justify-center w-[30px] h-[30px] rounded-[20px] bg-travel-primary backdrop-blur-[5px]"
                >
                  <Plus className="w-[15px] h-[15px] text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-black/10" />

          {/* Search Button */}
          <div className="flex justify-center items-center h-[64px] backdrop-blur-[10px]">
            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center w-full h-[64px] px-5 rounded-[20px] bg-travel-primary"
            >
              <span className="text-[20px] font-medium text-white leading-[22px]">
                Search
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-[34px] left-0 right-0 px-5 z-50">
        <div className="flex gap-[10px]">
          <button className="flex-1 flex items-center justify-center gap-[10px] h-[56px] px-5 rounded-[20px] bg-travel-primary">
            <Hotel className="w-4 h-4 text-white" />
            <span className="text-[16px] font-normal text-white leading-[22px]">
              Hotel
            </span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-[10px] h-[56px] px-5 rounded-[20px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px]">
            <Plane className="w-[18px] h-4 text-travel-icons" />
            <span className="text-[16px] font-normal text-travel-icons leading-[22px]">
              Transport
            </span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-[10px] h-[56px] px-5 rounded-[20px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px]">
            <Compass className="w-4 h-4 text-travel-icons" />
            <span className="text-[16px] font-normal text-travel-icons leading-[22px]">
              Tour
            </span>
          </button>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center items-center gap-[5px] mt-4">
          <div className="w-[5px] h-[5px] rounded-full bg-white" />
          <div className="w-[5px] h-[5px] rounded-full bg-white/30" />
          <div className="w-[5px] h-[5px] rounded-full bg-white/30" />
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-white z-60" />
    </div>
  );
};

export default HotelSearch;
