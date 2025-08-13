import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Plane,
  Clock,
  Target,
} from "lucide-react";
import NavBar from "../components/NavBar";

const SearchTransportResultScreen = () => {
  const navigate = useNavigate();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous screen
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleSortClick = () => {
    setShowSortModal(true);
  };

  // Sample flight data
  const flightResults = [
    {
      id: 1,
      airline: "Vietnam Airlines",
      airlineLogo:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60",
      flightClass: "Economy",
      departure: {
        time: "07:30",
        airport: "HAN",
      },
      arrival: {
        time: "09:00",
        airport: "DAD",
      },
      duration: "1h30",
      isDirect: true,
      originalPrice: "$198.85",
      discountedPrice: "$114.82",
    },
    {
      id: 2,
      airline: "Vietjet Air",
      airlineLogo:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/84eae4b7e9c0cfce666b479e4f79966618556919?width=58",
      flightClass: "Economy",
      departure: {
        time: "08:15",
        airport: "HAN",
      },
      arrival: {
        time: "09:45",
        airport: "DAD",
      },
      duration: "1h30",
      isDirect: true,
      originalPrice: "$134.68",
      discountedPrice: "$102.46",
    },
    {
      id: 3,
      airline: "Vietnam Airlines",
      airlineLogo:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/09ff32f1023213efdabb5fa39bcf904ae6399a28?width=60",
      flightClass: "Economy",
      departure: {
        time: "10:25",
        airport: "HAN",
      },
      arrival: {
        time: "12:10",
        airport: "DAD",
      },
      duration: "1h35",
      isDirect: true,
      originalPrice: "$203.14",
      discountedPrice: "$123.75",
    },
    {
      id: 4,
      airline: "Vietjet Air",
      airlineLogo:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/84eae4b7e9c0cfce666b479e4f79966618556919?width=58",
      flightClass: "Economy",
      departure: {
        time: "08:15",
        airport: "HAN",
      },
      arrival: {
        time: "09:45",
        airport: "DAD",
      },
      duration: "1h30",
      isDirect: true,
      originalPrice: "$134.68",
      discountedPrice: "$102.46",
    },
  ];

  return (
    <div className="relative w-full max-w-[430px] mx-auto h-screen bg-gradient-to-b from-travel-white via-travel-white to-travel-secondary overflow-hidden font-sf-pro">
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

      {/* Header Section */}
      <div className="relative z-30 w-full h-[251px] rounded-[20px] border border-white/80 bg-gradient-to-b from-travel-white via-travel-white to-transparent shadow-lg backdrop-blur-[25px]">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute left-5 top-[72px] w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]"
        >
          <ArrowLeft className="w-5 h-5 text-travel-secondary" />
        </button>

        {/* Title */}
        <h1 className="absolute left-[94px] top-[80px] w-[242px] h-[23px] text-travel-primary text-[32px] font-medium text-center leading-[22px]">
          Transport Results
        </h1>

        {/* Search Bar */}
        <div className="absolute left-5 right-5 top-[121px] h-[70px] flex items-center gap-[10px]">
          <div className="flex-1 flex items-center gap-[10px] h-[50px] px-5 rounded-[15px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
            <Search className="w-5 h-5 text-travel-icons" />
            <input
              type="text"
              placeholder="Find your destination"
              className="flex-1 bg-transparent text-[16px] text-black/30 placeholder-black/30 outline-none"
            />
          </div>
          <button
            onClick={handleFilterClick}
            className="w-[50px] h-[50px] flex items-center justify-center rounded-[15px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]"
          >
            <Filter className="w-6 h-6 text-travel-secondary" />
          </button>
          <button
            onClick={handleSortClick}
            className="w-[50px] h-[50px] flex items-center justify-center rounded-[15px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]"
          >
            <ArrowUpDown className="w-6 h-6 text-travel-secondary" />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="absolute left-5 right-5 top-[191px] h-10 flex gap-[10px]">
          <button className="flex-1 flex items-center justify-center gap-[5px] h-10 rounded-[30px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
            <Calendar className="w-4 h-4 text-travel-secondary" />
            <span className="text-[14px] text-travel-secondary font-normal">
              Change Dates
            </span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-[5px] h-10 rounded-[30px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
            <Plane className="w-4 h-4 text-travel-secondary" />
            <span className="text-[14px] text-travel-secondary font-normal">
              Change Type
            </span>
          </button>
        </div>
      </div>

      {/* Results Content */}
      <div className="relative z-20 px-5 pt-5">
        {/* Results Count */}
        <h2 className="text-[20px] font-normal text-travel-text leading-[22px] mb-[10px]">
          243 tickets found
        </h2>

        {/* Flight List */}
        <div className="flex flex-col gap-[10px] pb-24">
          {flightResults.map((flight) => (
            <div
              key={flight.id}
              className="w-full p-5 rounded-[20px] bg-travel-white shadow-lg backdrop-blur-[10px] flex flex-col gap-5"
            >
              {/* Airline Header */}
              <div className="flex justify-between items-center h-[30px]">
                <div className="flex items-center gap-[10px]">
                  <div className="w-[30px] h-[30px] flex items-center justify-center">
                    <img
                      src={flight.airlineLogo}
                      alt={flight.airline}
                      className="w-[30px] h-[30px] object-contain"
                    />
                  </div>
                  <span className="text-[20px] font-normal text-travel-text leading-[22px]">
                    {flight.airline}
                  </span>
                </div>
                <div className="flex items-center px-[10px] py-[10px] rounded-[20px] border border-travel-primary bg-travel-shadow">
                  <span className="text-[14px] text-travel-primary font-light leading-[22px]">
                    {flight.flightClass}
                  </span>
                </div>
              </div>

              {/* Flight Details */}
              <div className="flex justify-between items-center h-[41px]">
                {/* Flight Info */}
                <div className="flex flex-col gap-[5px]">
                  <div className="flex items-center gap-[5px]">
                    <Target className="w-4 h-4 text-travel-text" />
                    <span className="text-[14px] text-travel-text font-light leading-[22px]">
                      {flight.isDirect ? "Direct" : "Connecting"}
                    </span>
                  </div>
                  <div className="flex items-center gap-[5px]">
                    <Clock className="w-4 h-4 text-travel-text" />
                    <span className="text-[14px] text-travel-text font-light leading-[22px]">
                      {flight.duration}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center justify-center gap-[10px] w-[146px]">
                  <div className="text-[20px] font-normal text-travel-secondary leading-[22px] text-center">
                    {flight.departure.time}
                    <br />
                    {flight.departure.airport}
                  </div>
                  <svg
                    width="16"
                    height="15"
                    viewBox="0 0 18 15"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M1 6.5C0.447715 6.5 0 6.94772 0 7.5C0 8.05228 0.447715 8.5 1 8.5V6.5ZM17.7071 8.20711C18.0976 7.81658 18.0976 7.18342 17.7071 6.79289L11.3431 0.428932C10.9526 0.0384078 10.3195 0.0384078 9.92893 0.428932C9.53841 0.819457 9.53841 1.45262 9.92893 1.84315L15.5858 7.5L9.92893 13.1569C9.53841 13.5474 9.53841 14.1805 9.92893 14.5711C10.3195 14.9616 10.9526 14.9616 11.3431 14.5711L17.7071 8.20711ZM1 7.5V8.5H17V7.5V6.5H1V7.5Z"
                      fill="#2E7B59"
                    />
                  </svg>
                  <div className="text-[20px] font-normal text-travel-secondary leading-[22px] text-center">
                    {flight.arrival.time}
                    <br />
                    {flight.arrival.airport}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-[1px] h-[41px] bg-travel-text-light/10" />

                {/* Pricing */}
                <div className="flex flex-col justify-center items-end gap-2 w-[92px]">
                  <div className="text-[16px] text-travel-text-light line-through leading-[22px] text-right">
                    {flight.originalPrice}
                  </div>
                  <div className="text-[24px] font-bold text-travel-primary leading-[22px] text-right">
                    {flight.discountedPrice}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Magic Wand */}
      <div className="fixed bottom-[185px] right-[20px] w-[60px] h-[60px] rounded-[30px] border border-white/60 bg-gradient-to-br from-travel-pink-light/80 to-travel-pink-accent/80 shadow-lg backdrop-blur-[5px] flex items-center justify-center z-40">
        <svg width="35" height="35" viewBox="0 0 36 36" fill="none">
          <path
            d="M17.1323 14.3031L4.43461 27.011C3.83642 27.6365 3.50697 28.4714 3.51682 29.3368C3.52666 30.2022 3.87503 31.0293 4.48729 31.641C5.09956 32.2527 5.92702 32.6003 6.79244 32.6093C7.65786 32.6184 8.49241 32.2881 9.11732 31.6894L21.8136 18.9844L17.1323 14.3031ZM25.0759 22.3852L24.9271 22.375C24.6628 22.375 24.4074 22.4707 24.2083 22.6445C24.0091 22.8182 23.8795 23.0582 23.8436 23.32L23.8334 23.4688V24.5625H22.7396C22.4753 24.5625 22.2199 24.6582 22.0208 24.832C21.8216 25.0057 21.692 25.2457 21.6561 25.5075L21.6459 25.6563C21.6459 26.2104 22.0571 26.6683 22.5909 26.7398L22.7396 26.75H23.8334V27.8438C23.8334 28.3979 24.2446 28.8558 24.7784 28.9273L24.9271 28.9375C25.1914 28.9375 25.4468 28.8418 25.646 28.6681C25.8452 28.4943 25.9747 28.2544 26.0107 27.9925L26.0209 27.8438V26.75H27.1146C27.3789 26.75 27.6343 26.6543 27.8335 26.4806C28.0327 26.3068 28.1622 26.0669 28.1982 25.805L28.2084 25.6563C28.2083 25.3919 28.1126 25.1366 27.9389 24.9374C27.7652 24.7382 27.5252 24.6087 27.2634 24.5727L27.1146 24.5625H26.0209V23.4688C26.0208 23.2044 25.9251 22.9491 25.7514 22.7499C25.5777 22.5507 25.3377 22.4212 25.0759 22.3852ZM19.9163 11.5323L19.7179 11.716L18.6796 12.7558L23.3609 17.4371L24.3992 16.3958C24.7038 16.091 24.9454 15.7292 25.1102 15.3311C25.2749 14.9329 25.3597 14.5062 25.3595 14.0753C25.3594 13.6444 25.2744 13.2178 25.1094 12.8197C24.9443 12.4217 24.7025 12.06 24.3977 11.7554L24.1688 11.5425C23.5766 11.0362 22.8235 10.7571 22.0444 10.7553C21.2653 10.7534 20.5109 11.0288 19.9163 11.5323ZM10.4925 7.80188L10.3438 7.79167C10.0795 7.79168 9.82411 7.8874 9.62492 8.06112C9.42573 8.23484 9.29618 8.47482 9.26023 8.73667L9.25002 8.88542V9.97917H8.15627C7.89197 9.97918 7.63661 10.0749 7.43742 10.2486C7.23823 10.4223 7.10868 10.6623 7.07273 10.9242L7.06252 11.0729C7.06252 11.6271 7.47377 12.0835 8.00752 12.1565L8.15627 12.1667H9.25002V13.2604C9.25002 13.8146 9.66127 14.271 10.195 14.344L10.3438 14.3542C10.6081 14.3542 10.8634 14.2584 11.0626 14.0847C11.2618 13.911 11.3914 13.671 11.4273 13.4092L11.4375 13.2604V12.1667H12.5313C12.7956 12.1667 13.0509 12.0709 13.2501 11.8972C13.4493 11.7235 13.5789 11.4835 13.6148 11.2217L13.625 11.0729C13.625 10.8086 13.5293 10.5533 13.3556 10.3541C13.1819 10.1549 12.9419 10.0253 12.68 9.98938L12.5313 9.97917H11.4375V8.88542C11.4375 8.62111 11.3418 8.36575 11.1681 8.16656C10.9943 7.96737 10.7544 7.83782 10.4925 7.80188ZM27.9925 4.88521L27.8438 4.875C27.5795 4.87501 27.3241 4.97073 27.1249 5.14445C26.9257 5.31817 26.7962 5.55815 26.7602 5.82L26.75 5.96875V7.0625H25.6563C25.392 7.06251 25.1366 7.15823 24.9374 7.33195C24.7382 7.50568 24.6087 7.74565 24.5727 8.0075L24.5625 8.15625C24.5625 8.71042 24.9738 9.16688 25.5075 9.23979L25.6563 9.25H26.75V10.3438C26.75 10.8979 27.1613 11.3544 27.695 11.4273L27.8438 11.4375C28.1081 11.4375 28.3634 11.3418 28.5626 11.168C28.7618 10.9943 28.8914 10.7544 28.9273 10.4925L28.9375 10.3438V9.25H30.0313C30.2956 9.24999 30.5509 9.15427 30.7501 8.98055C30.9493 8.80683 31.0789 8.56685 31.1148 8.305L31.125 8.15625C31.125 7.89195 31.0293 7.63659 30.8556 7.43739C30.6819 7.2382 30.4419 7.10865 30.18 7.07271L30.0313 7.0625H28.9375V5.96875C28.9375 5.70445 28.8418 5.44908 28.6681 5.24989C28.4944 5.0507 28.2544 4.92115 27.9925 4.88521Z"
            fill="#FCFCFC"
          />
        </svg>
      </div>

      {/* Trip Selection Cards */}
      <div className="fixed bottom-[90px] left-0 right-0 max-w-[430px] mx-auto px-5 z-40">
        <div className="flex items-center gap-[6px] p-[10px] bg-gradient-to-b from-transparent to-travel-secondary backdrop-blur-[5px] rounded-r-[20px]">
          <div className="p-5 rounded-[20px] bg-travel-primary flex flex-col gap-[10px]">
            <div className="text-[16px] text-white font-light leading-[22px]">
              Mon, 23 Jun 2025
            </div>
            <div className="text-[20px] text-white font-normal leading-[22px]">
              Hanoi - Da Nang
            </div>
          </div>
          <div className="p-5 rounded-[20px] border border-travel-primary bg-travel-white flex flex-col gap-[10px]">
            <div className="text-[16px] text-travel-secondary font-light leading-[22px]">
              Mon, 29 Jun 2025
            </div>
            <div className="text-[20px] text-travel-text font-normal leading-[22px]">
              Da Nang - Hanoi
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavBar activeTab="Home" />

      {/* Home Indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-black z-60" />
    </div>
  );
};

export default SearchTransportResultScreen;
