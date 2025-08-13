import React from "react";
import {
  Search,
  Hotel,
  Plane,
  Compass,
  Home,
  Calendar,
  Video,
  User,
  BookOpen,
  Wand2,
} from "lucide-react";

const HomeScreen = () => {
  return (
    <div className="relative w-full max-w-[430px] mx-auto h-screen bg-travel-white overflow-hidden font-sf-pro">
      {/* Background Gradients */}
      <div className="absolute inset-0">
        {/* Pink gradient blob */}
        <div
          className="absolute w-[296px] h-[296px] rounded-full opacity-60 blur-0"
          style={{
            left: "-143px",
            top: "456px",
            transform: "rotate(-24.15deg)",
            background:
              "linear-gradient(164deg, #FF74A0 7.92%, rgba(255, 255, 255, 0.00) 92.08%)",
          }}
        />

        {/* Green gradient blob */}
        <div
          className="absolute w-[424px] h-[424px] rounded-full opacity-60 blur-0"
          style={{
            left: "-11px",
            top: "-5px",
            transform: "rotate(132.618deg)",
            background:
              "linear-gradient(164deg, #73C088 7.92%, rgba(255, 255, 255, 0.00) 92.08%)",
          }}
        />
      </div>

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

      {/* Header Blur */}
      <div
        className="absolute top-0 left-0 w-full h-[65px] z-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(252, 252, 252, 0.00) 0%, #FCFCFC 100%)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-30 px-5 pt-5">
        {/* Greeting Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h1 className="text-[32px] font-bold text-travel-primary leading-[22px] mb-2">
              Hello, Janes!
            </h1>
            <p className="text-[16px] font-medium text-travel-secondary leading-[22px]">
              Let's find your perfect stay
            </p>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/8d8c6298f2c7270b6aefbcb34fe07259625434b3?width=100"
            alt="Profile"
            className="w-[50px] h-[50px] rounded-full"
          />
        </div>

        {/* Hero Carousel */}
        <div className="relative mb-6">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/497f03dd863a898e0f1440735e2f9ed8519c4007?width=702"
              alt="Hotel promotion"
              className="w-[351px] h-[150px] rounded-[20px] flex-shrink-0"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/a026aba8ac30943ee2a0b8a9d58a0029d14f601d?width=702"
              alt="Hotel promotion"
              className="w-[351px] h-[150px] rounded-[20px] flex-shrink-0"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/94738819c6de42dfab0c0fcae103580136128504?width=702"
              alt="Hotel promotion"
              className="w-[351px] h-[150px] rounded-[20px] flex-shrink-0"
            />
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-[10px] mt-4">
            <div className="w-[5px] h-[5px] rounded-full bg-travel-primary opacity-15" />
            <div className="w-[5px] h-[5px] rounded-full bg-travel-secondary" />
            <div className="w-[5px] h-[5px] rounded-full bg-travel-primary opacity-15" />
            <div className="w-[5px] h-[5px] rounded-full bg-travel-primary opacity-15" />
            <div className="w-[5px] h-[5px] rounded-full bg-travel-primary opacity-15" />
            <div className="w-[5px] h-[5px] rounded-full bg-travel-primary opacity-15" />
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/50 rounded-[20px] p-[10px] mb-6 shadow-lg backdrop-blur-[5px] border border-white/60">
          {/* Search Input */}
          <div className="flex items-center gap-[10px] h-[50px] px-5 rounded-[15px] border border-travel-chip-border bg-white/20 backdrop-blur-[10px] mb-[10px]">
            <Search className="w-5 h-5 text-travel-icons" />
            <input
              type="text"
              placeholder="Find your destination"
              className="flex-1 bg-transparent text-[16px] text-black/30 placeholder-black/30 outline-none"
            />
          </div>

          {/* Category Buttons */}
          <div className="flex gap-[10px]">
            <button className="flex-1 flex items-center justify-center gap-[10px] h-[40px] rounded-[30px] bg-travel-primary text-white">
              <Hotel className="w-4 h-4" />
              <span className="text-[14px] font-normal">Hotel</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-[10px] h-[40px] rounded-[30px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px] text-travel-icons">
              <Plane className="w-4 h-4" />
              <span className="text-[14px] font-normal">Transport</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-[10px] h-[40px] rounded-[30px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px] text-travel-icons">
              <Compass className="w-4 h-4" />
              <span className="text-[14px] font-normal">Tour</span>
            </button>
          </div>
        </div>

        {/* Vouchers & Bonus Points */}
        <div className="flex gap-[10px] mb-6">
          <div className="flex-1 flex items-center gap-[15px] h-[60px] px-[15px] rounded-[20px] bg-white/50 shadow-lg backdrop-blur-[5px] border border-white/20">
            <div className="w-[30px] h-[30px] flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 23.5714C0 25.3457 1.43571 26.7857 3.21 26.7857H26.79C28.5643 26.7857 30 25.3457 30 23.5714V19.2129..."
                  fill="#FFACC6"
                />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-travel-text-muted leading-[16px]">
              Vouchers &<br />
              Discounts
            </div>
          </div>

          <div className="flex-1 flex items-center gap-[12px] h-[60px] px-[15px] rounded-[20px] bg-white/50 shadow-lg backdrop-blur-[5px] border border-white/20">
            <div className="w-[30px] h-[30px] flex items-center justify-center">
              <svg width="30" height="31" viewBox="0 0 30 31" fill="none">
                <path
                  d="M15 0.816284C23.2845 0.816284 30 7.53179 30 15.8163..."
                  fill="#FFACC6"
                />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-travel-text-muted leading-[16px]">
              Bonus Points
            </div>
          </div>
        </div>

        {/* Trending Destinations */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[20px] font-bold text-travel-secondary">
            Trending Destinations
          </h2>
          <span className="text-[14px] text-travel-text-light">See more</span>
        </div>

        <div className="flex gap-[5px] overflow-x-auto scrollbar-hide mb-8">
          {[
            {
              name: "Hanoi",
              image:
                "https://cdn.builder.io/api/v1/image/assets/TEMP/0182894f6bed1f31ef556e90c6d5a580a97d0051?width=427",
            },
            {
              name: "Hoi An",
              image:
                "https://cdn.builder.io/api/v1/image/assets/TEMP/a95caed487a0f690b6571bd46272f2ae30f91740?width=240",
            },
            {
              name: "Nha Trang",
              image:
                "https://cdn.builder.io/api/v1/image/assets/TEMP/3efbf5568f792110fa13e679196783b69ddcf22d?width=384",
            },
            {
              name: "Hue",
              image:
                "https://cdn.builder.io/api/v1/image/assets/TEMP/0891dd6a35023b840b43eb661817f180fc300f89?width=361",
            },
            {
              name: "Sapa",
              image:
                "https://cdn.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=410",
            },
          ].map((destination, index) => (
            <div
              key={destination.name}
              className="flex flex-col items-center w-[130px] p-[5px] pb-[15px] rounded-[10px] bg-white/70 shadow-lg backdrop-blur-[10px] flex-shrink-0"
            >
              <div className="w-[120px] h-[120px] rounded-[5px] overflow-hidden mb-[10px]">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`text-[14px] font-light leading-[22px] ${index < 3 ? "text-travel-text-muted" : "text-travel-icons"}`}
              >
                {destination.name}
              </span>
            </div>
          ))}
        </div>

        {/* Featured Hotels */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[20px] font-bold text-travel-secondary">
            Featured Hotels
          </h2>
          <span className="text-[14px] text-travel-text-light">See more</span>
        </div>

        <div className="flex gap-[5px] overflow-x-auto scrollbar-hide pb-20">
          {[
            {
              name: "Sunset Hotel",
              location: "Sai Gon, District 1",
              rating: "4.8",
              price: "from $299/night",
              image:
                "https://cdn.builder.io/api/v1/image/assets/TEMP/7d5c2726a147f3cea232f9aad30b7d3bcbf8a4b8?width=570",
            },
            {
              name: "Himalaya Hotel",
              location: "Da Nang, Son Tra",
              rating: "4.9",
              price: "$164/night",
              image:
                "https://cdn.builder.io/api/v1/image/assets/TEMP/1852e5c63ca569519030bf6f4f1ff9a845337805?width=570",
            },
          ].map((hotel) => (
            <div
              key={hotel.name}
              className="w-[295px] h-[288px] rounded-[10px] bg-white/70 shadow-lg backdrop-blur-[10px] flex-shrink-0 p-[5px]"
            >
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-[285px] h-[190px] rounded-[5px] object-cover mb-[15px]"
              />
              <div className="px-[10px]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[16px] font-medium text-travel-text-muted">
                    {hotel.name}
                  </h3>
                  <span className="text-[16px] font-medium text-travel-primary text-right">
                    {hotel.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-travel-text-light">
                    {hotel.location}
                  </span>
                  <span className="text-[14px] text-travel-text-light">
                    {hotel.rating}
                  </span>
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
        <Wand2 className="w-[35px] h-[35px] text-white" />
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-[90px] z-50">
        <div className="mx-5 h-[90px] rounded-t-[20px] border-2 border-white/60 bg-gradient-to-b from-white/90 to-gray-100/90 shadow-lg backdrop-blur-[5px]">
          <div className="flex justify-center items-start gap-[25px] p-[10px] h-[74px]">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: BookOpen, label: "Plan", active: false },
              { icon: Video, label: "Reels", active: false },
              { icon: Calendar, label: "Booking", active: false },
              { icon: User, label: "Profile", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-start w-[54px] h-[54px] p-[7px] rounded-[15px] ${
                  active
                    ? "border border-white/60 bg-travel-primary shadow-lg"
                    : ""
                }`}
              >
                <Icon
                  className={`w-[30px] h-[30px] ${active ? "text-white" : "text-travel-nav-inactive"} mb-[2px]`}
                />
                <span
                  className={`text-[10px] font-medium leading-none ${active ? "text-white" : "text-travel-nav-inactive"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-black z-60" />
    </div>
  );
};

export default HomeScreen;
