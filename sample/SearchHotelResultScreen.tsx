import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Map,
  X,
  Minus,
  Plus,
} from "lucide-react";
import NavBar from "../components/NavBar";

const SearchHotelResultScreen = () => {
  const navigate = useNavigate();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [guests, setGuests] = useState(4);
  const [selectedAmenities, setSelectedAmenities] = useState([
    "Wifi",
    "Air conditioner",
  ]);
  const [selectedSort, setSelectedSort] = useState("Default");

  const handleBackClick = () => {
    navigate("/hotel-search");
  };

  const handleHotelClick = (hotelId: number) => {
    navigate(`/hotel-detail/${hotelId}`);
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  const handleSortClick = () => {
    setShowSortModal(true);
  };

  const handleCloseSort = () => {
    setShowSortModal(false);
  };

  const handleSortSelect = (sortOption: string) => {
    setSelectedSort(sortOption);
  };

  const handleApplySort = () => {
    // Apply sort logic here
    setShowSortModal(false);
  };

  const handleClearFilters = () => {
    setPriceRange([0, 1000]);
    setGuests(4);
    setSelectedAmenities([]);
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
    setShowFilterModal(false);
  };

  const amenitiesList = [
    "Wifi",
    "Pool",
    "Spa",
    "Gym",
    "Restaurant",
    "Beach access",
    "Free parking",
    "Pet friendly",
    "Air conditioner",
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const hotelResults = [
    {
      id: 1,
      name: "Sunset Hotel",
      location: "Duong Dong",
      rating: "4.8",
      price: "$219/night",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/8838af215a9f6c8280419f20451434ce36c3032a?width=420",
    },
    {
      id: 2,
      name: "Seaside Resort",
      location: "Duong Dong",
      rating: "4.8",
      price: "$187/night",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/2c95ad1a7d2e3677ce961c14c2d5b2d6e0f5d659?width=420",
    },
    {
      id: 3,
      name: "Palm Tree Beach Hotel",
      location: "An Thoi",
      rating: "4.8",
      price: "$94/night",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/047710ae9bad7149f7bbbf272d88d6be033dcea4?width=420",
    },
    {
      id: 4,
      name: "Sunset Hotel",
      location: "Duong Dong",
      rating: "4.8",
      price: "$219/night",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/8838af215a9f6c8280419f20451434ce36c3032a?width=420",
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
      <div className="relative z-30 w-full h-[251px] rounded-[20px] bg-gradient-to-b from-travel-white to-travel-white/50 shadow-lg backdrop-blur-[5px] border-b border-white/50">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute left-5 top-[72px] w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]"
        >
          <ArrowLeft className="w-5 h-5 text-travel-secondary" />
        </button>

        {/* Title */}
        <h1 className="absolute left-[121px] top-[80px] w-[188px] h-[23px] text-travel-primary text-[32px] font-medium text-center leading-[22px]">
          Hotel Results
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
            <Map className="w-4 h-4 text-travel-secondary" />
            <span className="text-[14px] text-travel-secondary font-normal">
              Map
            </span>
          </button>
        </div>
      </div>

      {/* Results Content */}
      <div className="relative z-20 px-5 pt-5">
        {/* Results Count */}
        <h2 className="text-[20px] font-normal text-travel-text-dark leading-[22px] mb-[10px]">
          243 hotels found
        </h2>

        {/* Hotel List */}
        <div className="flex flex-col gap-[10px] pb-24">
          {hotelResults.map((hotel) => (
            <div
              key={hotel.id}
              onClick={() => handleHotelClick(hotel.id)}
              className="w-full h-[140px] rounded-[20px] bg-travel-white shadow-lg backdrop-blur-[10px] flex overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            >
              {/* Hotel Image */}
              <div className="w-[140px] h-[140px] flex items-center justify-center rounded-l-[20px] overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-[210px] h-[140px] object-cover -ml-[35px]"
                />
              </div>

              {/* Hotel Info */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-[18px] font-medium text-travel-text-muted leading-[22px] mb-[10px]">
                    {hotel.name}
                  </h3>
                  <p className="text-[14px] font-light text-travel-text-light leading-[22px]">
                    {hotel.location}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  {/* Rating */}
                  <div className="flex items-center gap-[5px]">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M5.72053 3.38C6.5124 1.96 6.90803 1.25 7.4999 1.25C8.09178 1.25 8.4874 1.96 9.27928 3.38L9.48428 3.7475C9.70928 4.15125 9.82178 4.35313 9.99678 4.48625C10.1718 4.61938 10.3905 4.66875 10.828 4.7675L11.2255 4.8575C12.763 5.20563 13.5312 5.37938 13.7143 5.9675C13.8968 6.555 13.373 7.16813 12.3249 8.39375L12.0537 8.71063C11.7562 9.05875 11.6068 9.23313 11.5399 9.44813C11.473 9.66375 11.4955 9.89625 11.5405 10.3606L11.5818 10.7838C11.7399 12.4194 11.8193 13.2369 11.3405 13.6C10.8618 13.9631 10.1418 13.6319 8.70303 12.9694L8.3299 12.7981C7.92115 12.6094 7.71678 12.5156 7.4999 12.5156C7.28303 12.5156 7.07865 12.6094 6.6699 12.7981L6.2974 12.9694C4.85803 13.6319 4.13803 13.9631 3.6599 13.6006C3.18053 13.2369 3.2599 12.4194 3.41803 10.7838L3.45928 10.3612C3.50428 9.89625 3.52678 9.66375 3.45928 9.44875C3.39303 9.23313 3.24365 9.05875 2.94615 8.71125L2.6749 8.39375C1.62678 7.16875 1.10303 6.55563 1.28553 5.9675C1.46803 5.37938 2.2374 5.205 3.7749 4.8575L4.1724 4.7675C4.60928 4.66875 4.8274 4.61938 5.00303 4.48625C5.17865 4.35313 5.29053 4.15125 5.51553 3.7475L5.72053 3.38Z"
                        fill="#FFACC6"
                      />
                    </svg>
                    <span className="text-[14px] text-travel-pink-light font-normal leading-[22px]">
                      {hotel.rating}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="text-[12px] text-travel-text-light">
                      from
                    </span>
                    <span className="text-[20px] font-bold text-travel-primary ml-1">
                      {hotel.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div
        className="absolute bottom-[170px] right-[20px] w-[60px] h-[60px] rounded-[30px] border border-white/60 shadow-lg backdrop-blur-[5px] flex items-center justify-center z-40"
        style={{
          background:
            "radial-gradient(127.67% 127.67% at 18.33% 0%, rgba(255, 172, 198, 0.80) 50.85%, rgba(255, 116, 160, 0.80) 100%)",
        }}
      >
        <svg width="35" height="35" viewBox="0 0 36 36" fill="none">
          <path
            d="M17.1323 14.3031L4.43461 27.011C3.83642 27.6365 3.50697 28.4714 3.51682 29.3368C3.52666 30.2022 3.87503 31.0293 4.48729 31.641C5.09956 32.2527 5.92702 32.6003 6.79244 32.6093C7.65786 32.6184 8.49241 32.2881 9.11732 31.6894L21.8136 18.9844L17.1323 14.3031ZM25.0759 22.3852L24.9271 22.375C24.6628 22.375 24.4074 22.4707 24.2083 22.6445C24.0091 22.8182 23.8795 23.0582 23.8436 23.32L23.8334 23.4688V24.5625H22.7396C22.4753 24.5625 22.2199 24.6582 22.0208 24.832C21.8216 25.0057 21.692 25.2457 21.6561 25.5075L21.6459 25.6563C21.6459 26.2104 22.0571 26.6683 22.5909 26.7398L22.7396 26.75H23.8334V27.8438C23.8334 28.3979 24.2446 28.8558 24.7784 28.9273L24.9271 28.9375C25.1914 28.9375 25.4468 28.8418 25.646 28.6681C25.8452 28.4943 25.9747 28.2544 26.0107 27.9925L26.0209 27.8438V26.75H27.1146C27.3789 26.75 27.6343 26.6543 27.8335 26.4806C28.0327 26.3068 28.1622 26.0669 28.1982 25.805L28.2084 25.6563C28.2083 25.3919 28.1126 25.1366 27.9389 24.9374C27.7652 24.7382 27.5252 24.6087 27.2634 24.5727L27.1146 24.5625H26.0209V23.4688C26.0208 23.2044 25.9251 22.9491 25.7514 22.7499C25.5777 22.5507 25.3377 22.4212 25.0759 22.3852ZM19.9163 11.5323L19.7179 11.716L18.6796 12.7558L23.3609 17.4371L24.3992 16.3958C24.7038 16.091 24.9454 15.7292 25.1102 15.3311C25.2749 14.9329 25.3597 14.5062 25.3595 14.0753C25.3594 13.6444 25.2744 13.2178 25.1094 12.8197C24.9443 12.4217 24.7025 12.06 24.3977 11.7554L24.1688 11.5425C23.5766 11.0362 22.8235 10.7571 22.0444 10.7553C21.2653 10.7534 20.5109 11.0288 19.9163 11.5323ZM10.4925 7.80188L10.3438 7.79167C10.0795 7.79168 9.82411 7.8874 9.62492 8.06112C9.42573 8.23484 9.29618 8.47482 9.26023 8.73667L9.25002 8.88542V9.97917H8.15627C7.89197 9.97918 7.63661 10.0749 7.43742 10.2486C7.23823 10.4223 7.10868 10.6623 7.07273 10.9242L7.06252 11.0729C7.06252 11.6271 7.47377 12.0835 8.00752 12.1565L8.15627 12.1667H9.25002V13.2604C9.25002 13.8146 9.66127 14.271 10.195 14.344L10.3438 14.3542C10.6081 14.3542 10.8634 14.2584 11.0626 14.0847C11.2618 13.911 11.3914 13.671 11.4273 13.4092L11.4375 13.2604V12.1667H12.5313C12.7956 12.1667 13.0509 12.0709 13.2501 11.8972C13.4493 11.7235 13.5789 11.4835 13.6148 11.2217L13.625 11.0729C13.625 10.8086 13.5293 10.5533 13.3556 10.3541C13.1819 10.1549 12.9419 10.0253 12.68 9.98938L12.5313 9.97917H11.4375V8.88542C11.4375 8.62111 11.3418 8.36575 11.1681 8.16656C10.9943 7.96737 10.7544 7.83782 10.4925 7.80188ZM27.9925 4.88521L27.8438 4.875C27.5795 4.87501 27.3241 4.97073 27.1249 5.14445C26.9257 5.31817 26.7962 5.55815 26.7602 5.82L26.75 5.96875V7.0625H25.6563C25.392 7.06251 25.1366 7.15823 24.9374 7.33195C24.7382 7.50568 24.6087 7.74565 24.5727 8.0075L24.5625 8.15625C24.5625 8.71042 24.9738 9.16688 25.5075 9.23979L25.6563 9.25H26.75V10.3438C26.75 10.8979 27.1613 11.3544 27.695 11.4273L27.8438 11.4375C28.1081 11.4375 28.3634 11.3418 28.5626 11.168C28.7618 10.9943 28.8914 10.7544 28.9273 10.4925L28.9375 10.3438V9.25H30.0313C30.2956 9.24999 30.5509 9.15427 30.7501 8.98055C30.9493 8.80683 31.0789 8.56685 31.1148 8.305L31.125 8.15625C31.125 7.89195 31.0293 7.63659 30.8556 7.43739C30.6819 7.2382 30.4419 7.10865 30.18 7.07271L30.0313 7.0625H28.9375V5.96875C28.9375 5.70445 28.8418 5.44908 28.6681 5.24989C28.4944 5.0507 28.2544 4.92115 27.9925 4.88521Z"
            fill="#FCFCFC"
          />
        </svg>
      </div>

      {/* Bottom Navigation */}
      <NavBar activeTab="Home" />

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[5px] z-[70] flex items-end">
          <div className="w-full h-[628px] bg-travel-white rounded-t-[40px] transform transition-transform duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 h-[80px]">
              <div className="flex items-center gap-[10px]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M15.0001 8.33333C14.5581 8.33333 14.1341 8.50892 13.8216 8.82148C13.509 9.13405 13.3334 9.55797 13.3334 10C13.3334 10.442 13.509 10.8659 13.8216 11.1785C14.1341 11.4911 14.5581 11.6667 15.0001 11.6667C15.4421 11.6667 15.866 11.4911 16.1786 11.1785C16.4912 10.8659 16.6667 10.442 16.6667 10C16.6667 9.55797 16.4912 9.13405 16.1786 8.82148C15.866 8.50892 15.4421 8.33333 15.0001 8.33333ZM10.2834 8.33333C10.6278 7.35744 11.2663 6.51238 12.1111 5.91464C12.9558 5.3169 13.9652 4.99591 15.0001 4.99591C16.0349 4.99591 17.0443 5.3169 17.8891 5.91464C18.7338 6.51238 19.3724 7.35744 19.7167 8.33333H31.6667C32.1088 8.33333 32.5327 8.50892 32.8453 8.82148C33.1578 9.13405 33.3334 9.55797 33.3334 10C33.3334 10.442 33.1578 10.8659 32.8453 11.1785C32.5327 11.4911 32.1088 11.6667 31.6667 11.6667H19.7167C19.3724 12.6426 18.7338 13.4876 17.8891 14.0853C17.0443 14.6831 16.0349 15.0041 15.0001 15.0041C13.9652 15.0041 12.9558 14.6831 12.1111 14.0853C11.2663 13.4876 10.6278 12.6426 10.2834 11.6667H8.33341C7.89139 11.6667 7.46746 11.4911 7.1549 11.1785C6.84234 10.8659 6.66675 10.442 6.66675 10C6.66675 9.55797 6.84234 9.13405 7.1549 8.82148C7.46746 8.50892 7.89139 8.33333 8.33341 8.33333H10.2834ZM25.0001 18.3333C24.5581 18.3333 24.1341 18.5089 23.8216 18.8215C23.509 19.134 23.3334 19.558 23.3334 20C23.3334 20.442 23.509 20.8659 23.8216 21.1785C24.1341 21.4911 24.5581 21.6667 25.0001 21.6667C25.4421 21.6667 25.866 21.4911 26.1786 21.1785C26.4912 20.8659 26.6667 20.442 26.6667 20C26.6667 19.558 26.4912 19.134 26.1786 18.8215C25.866 18.5089 25.4421 18.3333 25.0001 18.3333ZM20.2834 18.3333C20.6278 17.3574 21.2663 16.5124 22.1111 15.9146C22.9558 15.3169 23.9652 14.9959 25.0001 14.9959C26.0349 14.9959 27.0443 15.3169 27.8891 15.9146C28.7338 16.5124 29.3724 17.3574 29.7167 18.3333H31.6667C32.1088 18.3333 32.5327 18.5089 32.8453 18.8215C33.1578 19.134 33.3334 19.558 33.3334 20C33.3334 20.442 33.1578 20.8659 32.8453 21.1785C32.5327 21.4911 32.1088 21.6667 31.6667 21.6667H29.7167C29.3724 22.6426 28.7338 23.4876 27.8891 24.0854C27.0443 24.6831 26.0349 25.0041 25.0001 25.0041C23.9652 25.0041 22.9558 24.6831 22.1111 24.0854C21.2663 23.4876 20.6278 22.6426 20.2834 21.6667H8.33341C7.89139 21.6667 7.46746 21.4911 7.1549 21.1785C6.84234 20.8659 6.66675 20.442 6.66675 20C6.66675 19.558 6.84234 19.134 7.1549 18.8215C7.46746 18.5089 7.89139 18.3333 8.33341 18.3333H20.2834ZM15.0001 28.3333C14.5581 28.3333 14.1341 28.5089 13.8216 28.8215C13.509 29.134 13.3334 29.558 13.3334 30C13.3334 30.442 13.509 30.866 13.8216 31.1785C14.1341 31.4911 14.5581 31.6667 15.0001 31.6667C15.4421 31.6667 15.866 31.4911 16.1786 31.1785C16.4912 30.866 16.6667 30.442 16.6667 30C16.6667 29.558 16.4912 29.134 16.1786 28.8215C15.866 28.5089 15.4421 28.3333 15.0001 28.3333ZM10.2834 28.3333C10.6278 27.3574 11.2663 26.5124 12.1111 25.9146C12.9558 25.3169 13.9652 24.9959 15.0001 24.9959C16.0349 24.9959 17.0443 25.3169 17.8891 25.9146C18.7338 26.5124 19.3724 27.3574 19.7167 28.3333H31.6667C32.1088 28.3333 32.5327 28.5089 32.8453 28.8215C33.1578 29.134 33.3334 29.558 33.3334 30C33.3334 30.442 33.1578 30.866 32.8453 31.1785C32.5327 31.4911 32.1088 31.6667 31.6667 31.6667H19.7167C19.3724 32.6426 18.7338 33.4876 17.8891 34.0854C17.0443 34.6831 16.0349 35.0041 15.0001 35.0041C13.9652 35.0041 12.9558 34.6831 12.1111 34.0854C11.2663 33.4876 10.6278 32.6426 10.2834 31.6667H8.33341C7.89139 31.6667 7.46746 31.4911 7.1549 31.1785C6.84234 30.866 6.66675 30.442 6.66675 30C6.66675 29.558 6.84234 29.134 7.1549 28.8215C7.46746 28.5089 7.89139 28.3333 8.33341 28.3333H10.2834Z"
                    fill="#4CBC71"
                  />
                </svg>
                <h2 className="text-[32px] font-medium text-travel-primary leading-[22px]">
                  Filters
                </h2>
              </div>
              <button
                onClick={handleCloseFilter}
                className="w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]"
              >
                <X className="w-5 h-5 text-travel-secondary" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-5 pb-5 h-[410px] overflow-y-auto">
              {/* Divider */}
              <div className="w-full h-[1px] bg-travel-text-light/10 mb-5" />

              {/* Price Section */}
              <div className="mb-5">
                <h3 className="text-[20px] font-normal text-travel-text-dark leading-[22px] mb-5">
                  Price
                </h3>
                <div className="relative">
                  <div className="flex justify-between mb-2 px-5">
                    <span className="text-[12px] font-medium text-travel-primary">
                      $0
                    </span>
                    <span className="text-[12px] font-medium text-travel-primary">
                      $1000
                    </span>
                  </div>
                  <div className="relative h-[38px] flex items-center px-5">
                    <div className="absolute w-full h-[5px] bg-travel-primary rounded-full" />
                    <div className="absolute left-[20px] w-[10px] h-[10px] bg-travel-primary rounded-full border-2 border-white shadow-lg" />
                    <div className="absolute right-[20px] w-[10px] h-[10px] bg-travel-primary rounded-full border-2 border-white shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-travel-text-light/10 mb-5" />

              {/* Guests Section */}
              <div className="mb-5">
                <h3 className="text-[20px] font-normal text-travel-text-dark leading-[22px] mb-5">
                  Guests
                </h3>
                <div className="flex justify-center">
                  <div className="flex items-center gap-5 p-[5px] border border-travel-chip-border rounded-[20px] w-[126px] h-10">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-[30px] h-[30px] flex items-center justify-center rounded-[20px] bg-travel-primary"
                    >
                      <Minus className="w-[15px] h-[15px] text-white" />
                    </button>
                    <span className="text-[24px] font-bold text-travel-text-dark leading-[22px]">
                      {guests}
                    </span>
                    <button
                      onClick={() => setGuests(guests + 1)}
                      className="w-[30px] h-[30px] flex items-center justify-center rounded-[20px] bg-travel-primary"
                    >
                      <Plus className="w-[15px] h-[15px] text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-travel-text-light/10 mb-5" />

              {/* Amenities Section */}
              <div className="mb-5">
                <h3 className="text-[20px] font-normal text-travel-text-dark leading-[22px] mb-5">
                  Amenities
                </h3>
                <div className="flex flex-col gap-[10px]">
                  {/* First Row */}
                  <div className="flex items-center gap-[10px] flex-wrap">
                    {amenitiesList.slice(0, 5).map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-[10px] py-[10px] rounded-[20px] text-[14px] font-light leading-[22px] ${
                          selectedAmenities.includes(amenity)
                            ? "bg-gradient-to-r from-travel-primary to-travel-secondary text-white"
                            : "border border-travel-chip-border bg-travel-white text-travel-secondary"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                  {/* Second Row */}
                  <div className="flex items-center gap-[10px] flex-wrap">
                    {amenitiesList.slice(5, 7).map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-[10px] py-[10px] rounded-[20px] text-[14px] font-light leading-[22px] ${
                          selectedAmenities.includes(amenity)
                            ? "bg-gradient-to-r from-travel-primary to-travel-secondary text-white"
                            : "border border-travel-chip-border bg-travel-white text-travel-secondary"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                  {/* Third Row */}
                  <div className="flex items-center gap-[10px] flex-wrap">
                    {amenitiesList.slice(7).map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-[10px] py-[10px] rounded-[20px] text-[14px] font-light leading-[22px] ${
                          selectedAmenities.includes(amenity)
                            ? "bg-gradient-to-r from-travel-primary to-travel-secondary text-white"
                            : "border border-travel-chip-border bg-travel-white text-travel-secondary"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-travel-text-light/10 mb-5" />
            </div>

            {/* Modal Footer */}
            <div className="absolute bottom-0 left-0 right-0 h-[104px] bg-travel-white">
              <div className="flex items-center gap-[10px] p-5">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center w-[120px] h-16 px-5 rounded-[20px] border border-travel-primary bg-travel-white"
                >
                  <span className="text-[20px] font-medium text-travel-primary leading-[22px]">
                    Clear
                  </span>
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex items-center justify-center flex-1 h-16 px-5 rounded-[20px] bg-travel-primary"
                >
                  <span className="text-[20px] font-medium text-white leading-[22px]">
                    Apply
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[5px] z-[70] flex items-end">
          <div className="w-full h-[530px] bg-travel-white rounded-t-[40px] transform transition-transform duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 h-[80px]">
              <div className="flex items-center gap-[10px]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M10.4883 7.15499C10.8008 6.84254 11.2247 6.66701 11.6666 6.66701C12.1086 6.66701 12.5324 6.84254 12.8449 7.15499L19.5116 13.8217C19.8152 14.136 19.9832 14.557 19.9794 14.994C19.9756 15.431 19.8003 15.849 19.4913 16.158C19.1823 16.467 18.7643 16.6423 18.3273 16.6461C17.8903 16.6499 17.4693 16.4819 17.1549 16.1783L13.3333 12.3567V31.6667C13.3333 32.1087 13.1577 32.5326 12.8451 32.8452C12.5326 33.1577 12.1086 33.3333 11.6666 33.3333C11.2246 33.3333 10.8007 33.1577 10.4881 32.8452C10.1755 32.5326 9.99995 32.1087 9.99995 31.6667V12.3567L6.17828 16.1783C5.86394 16.4819 5.44294 16.6499 5.00594 16.6461C4.56895 16.6423 4.15093 16.467 3.84192 16.158C3.5329 15.849 3.35762 15.431 3.35382 14.994C3.35003 14.557 3.51802 14.136 3.82161 13.8217L10.4883 7.15499ZM26.6666 27.6433V8.33332C26.6666 7.8913 26.8422 7.46737 27.1548 7.15481C27.4673 6.84225 27.8913 6.66666 28.3333 6.66666C28.7753 6.66666 29.1992 6.84225 29.5118 7.15481C29.8244 7.46737 29.9999 7.8913 29.9999 8.33332V27.6433L33.8216 23.8217C34.1359 23.5181 34.557 23.3501 34.9939 23.3539C35.4309 23.3577 35.849 23.5329 36.158 23.842C36.467 24.151 36.6423 24.569 36.6461 25.006C36.6499 25.443 36.4819 25.864 36.1783 26.1783L29.5116 32.845C29.1991 33.1574 28.7752 33.333 28.3333 33.333C27.8913 33.333 27.4675 33.1574 27.1549 32.845L20.4883 26.1783C20.1847 25.864 20.0167 25.443 20.0205 25.006C20.0243 24.569 20.1996 24.151 20.5086 23.842C20.8176 23.5329 21.2356 23.3577 21.6726 23.3539C22.1096 23.3501 22.5306 23.5181 22.8449 23.8217L26.6666 27.6433Z"
                    fill="#4CBC71"
                  />
                </svg>
                <h2 className="text-[32px] font-medium text-travel-primary leading-[22px]">
                  Sort by
                </h2>
              </div>
              <button
                onClick={handleCloseSort}
                className="w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-travel-white"
              >
                <X className="w-5 h-5 text-travel-secondary" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="px-5 pb-5 h-[326px] flex flex-col justify-center gap-[10px]">
              {[
                "Default",
                "Price: Low To High",
                "Price: High To Low",
                "Rating",
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSortSelect(option)}
                  className={`h-16 px-5 rounded-[20px] flex items-center ${
                    selectedSort === option
                      ? "bg-travel-primary text-white"
                      : "border border-travel-primary bg-travel-white text-travel-primary"
                  }`}
                >
                  <span className="text-[20px] font-normal leading-[22px]">
                    {option}
                  </span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-travel-secondary/30" />

            {/* Modal Footer */}
            <div className="h-[104px] bg-travel-white">
              <div className="flex items-center justify-center p-5">
                <button
                  onClick={handleApplySort}
                  className="flex items-center justify-center w-[349px] h-16 px-5 rounded-[20px] bg-travel-primary"
                >
                  <span className="text-[20px] font-medium text-white leading-[22px]">
                    Sort
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Home Indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-black z-60" />
    </div>
  );
};

export default SearchHotelResultScreen;
