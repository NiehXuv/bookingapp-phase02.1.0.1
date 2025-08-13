import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share } from "lucide-react";
import NavBar from "../components/NavBar";

const HotelDetailScreen = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(1);

  const handleBackClick = () => {
    navigate("/hotel-results");
  };

  // Sample hotel data - in real app this would come from API/props
  const hotelData = {
    id: hotelId || "1",
    name: "Sunset Hotel",
    address: "60A Tran Hung Dao, Duong Dong, Phu Quoc, Vietnam",
    rating: "4.8",
    reviewCount: "1245",
    price: "$219/night",
    originalPrice: "$319/night",
    discount: "-15%",
    mainImage:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/19b8ebedcd50cf5e85be819744dff190799fbb70?width=1180",
    amenities: [
      { icon: "pool", name: "Pool" },
      { icon: "spa", name: "Spa" },
      { icon: "beach", name: "Beach views" },
      { icon: "restaurant", name: "Restaurant" },
      { icon: "wifi", name: "Wifi" },
    ],
    about:
      "Experience luxury at its finest in the heart of Phu Quoc island. Our 5-star hotel offers stunning beach views, world-class amenities, and exceptional services.",
    availableRooms: [
      {
        id: 1,
        name: "Deluxe King Room",
        price: "$219/night",
        originalPrice: "$319/night",
        discount: "-15%",
        roomsLeft: "12 left",
        occupancy: "Single",
        guests: "1",
        description:
          "Spacious room with king-size bed, city view, and luxury amenities",
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/49dab9230b9a958cae2bfad27185945fa2de2f6e?width=570",
      },
      {
        id: 2,
        name: "Executive Suite",
        price: "$499/night",
        originalPrice: "$550/night",
        discount: "-12%",
        roomsLeft: "9 left",
        occupancy: "Couple",
        guests: "2",
        description:
          "Luxurious suite with separated living area and premium amenities",
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/01a12d197d123d68283fbac24e22ce38e033d30a?width=570",
      },
      {
        id: 3,
        name: "King Breeze",
        price: "$563/night",
        originalPrice: "$684/night",
        discount: "-17%",
        roomsLeft: "17 left",
        occupancy: "",
        guests: "3",
        guestsBeds: "4",
        description:
          "Luxurious suite with separated living area and premium amenities, a king lifestyle",
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=570",
      },
    ],
    reviews: [
      {
        name: "Emily Watson",
        date: "2025/04/23",
        rating: "5",
        comment:
          "Absolutely stunning! The room smelled fresh, the bed was super comfy, and the lighting made everything feel so cozy. Staff welcomed us like old friends, and the rooftop view at sunset was magical. We were only here for two nights but honestly wish we stayed a week.",
      },
      {
        name: "Michael Chen",
        date: "2025/05/15",
        rating: "4",
        comment:
          "Great location and friendly staff. I was in town for a conference, and the Wi-Fi was fast enough for all my calls. Room was clean, though not very soundproof. Breakfast was decent, but I really appreciated the fast check-in and helpful concierge.",
        avatar:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=147",
      },
      {
        name: "Johannes Klein",
        date: "2025/03/28",
        rating: "3",
        comment:
          "It's okay for the price. Close to the main attractions and the local market. Room was small and the AC a bit loud, but everything worked fine. Good for solo travelers on a budget. Don't expect luxury, but it does the job.",
        avatar:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=120",
      },
    ],
  };

  const renderAmenityIcon = (iconType: string) => {
    switch (iconType) {
      case "pool":
        return (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M13.1975 10.2387C13.3164 10.3822 13.3735 10.5671 13.3561 10.7526C13.3387 10.9382 13.2484 11.1093 13.105 11.2283C12.0403 12.1119 11.0776 12.4219 10.204 12.4219C9.04618 12.4219 8.04423 11.8775 7.16415 11.4C5.69579 10.6019 4.53564 9.97206 2.79247 11.4176C2.64888 11.5366 2.46389 11.5937 2.27818 11.5764C2.09248 11.559 1.92127 11.4686 1.80224 11.325C1.6832 11.1814 1.62608 10.9964 1.64344 10.8107C1.6608 10.625 1.75123 10.4538 1.89482 10.3348C4.3704 8.28398 6.28935 9.32519 7.83564 10.1637C9.30399 10.9611 10.4642 11.5916 12.2073 10.1461C12.2784 10.0871 12.3604 10.0428 12.4487 10.0155C12.5369 9.98824 12.6297 9.97864 12.7216 9.98724C12.8136 9.99583 12.9029 10.0225 12.9846 10.0656C13.0663 10.1087 13.1386 10.1675 13.1975 10.2387Z"
              fill="#4CBC71"
            />
          </svg>
        );
      case "spa":
        return (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M6.56187 1.62563C6.80625 1.43688 7.1375 1.25 7.5 1.25C7.8625 1.25 8.19375 1.43688 8.43813 1.62563C8.70313 1.83 8.96063 2.10875 9.18625 2.435C9.30125 2.60125 9.40875 2.7825 9.50875 2.97875C10.0795 2.68368 10.7075 2.51607 11.3494 2.4875C12.0544 2.45438 12.5 3.0475 12.5 3.62375V5C12.5001 6.21792 12.0557 7.394 11.2502 8.30748C10.4446 9.22096 9.33337 9.80901 8.125 9.96125V11.88C8.7975 11.4619 9.78875 10.9713 11.0987 10.6438C11.1789 10.6222 11.2625 10.6169 11.3447 10.6281C11.427 10.6392 11.5061 10.6667 11.5777 10.7087C11.6492 10.7508 11.7116 10.8067 11.7613 10.8732C11.811 10.9396 11.8469 11.0153 11.867 11.0958C11.8872 11.1763 11.8911 11.26 11.8785 11.342C11.8659 11.4241 11.8372 11.5028 11.7939 11.5735C11.7506 11.6443 11.6936 11.7058 11.6263 11.7543C11.559 11.8029 11.4827 11.8375 11.4019 11.8562C9.39062 12.3594 8.25437 13.2875 7.99563 13.5175C7.85 13.6475 7.70563 13.75 7.5 13.75C7.29688 13.75 7.1525 13.65 7.00813 13.5206C6.7575 13.2969 5.62063 12.3619 3.59812 11.8562C3.518 11.8368 3.44253 11.8017 3.37604 11.7529C3.30955 11.7041 3.25337 11.6427 3.21073 11.5721C3.16809 11.5016 3.13984 11.4232 3.1276 11.3417C3.11536 11.2602 3.11937 11.177 3.1394 11.097C3.15944 11.0171 3.1951 10.9418 3.24434 10.8757C3.29358 10.8096 3.35541 10.7538 3.42629 10.7117C3.49716 10.6695 3.57567 10.6419 3.65729 10.6302C3.73892 10.6185 3.82204 10.6231 3.90188 10.6438C5.21125 10.9713 6.20187 11.4625 6.875 11.88V9.96125C5.66663 9.80901 4.55538 9.22096 3.74985 8.30748C2.94431 7.394 2.49989 6.21792 2.5 5V3.615C2.5 3.04688 2.9325 2.45875 3.62938 2.4775C4.08813 2.49 4.78813 2.5825 5.50437 2.95438C5.59938 2.76813 5.70438 2.59375 5.81375 2.43563C6.03875 2.10875 6.29687 1.82938 6.56187 1.62563Z"
              fill="#4CBC71"
            />
          </svg>
        );
      case "beach":
        return (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M6.25 3.24751C7.1875 1.62376 9.43625 1.47876 11.06 2.41626C12.6837 3.35376 13.6825 5.37376 12.745 6.99751L10.58 5.74751L9.4975 5.12251L8.415 4.49751L6.25 3.24751Z"
              fill="#4CBC71"
            />
            <path
              d="M11.06 2.41626C9.43625 1.47876 7.1875 1.62376 6.25 3.24751L8.415 4.49751M11.06 2.41626C12.6837 3.35376 13.6825 5.37376 12.745 6.99751L9.4975 5.12251M11.06 2.41626L11.3725 1.87501M11.06 2.41626C9.92187 2.72126 9.19625 3.14439 8.415 4.49751M11.06 2.41626C11.365 3.55439 11.3612 4.39439 10.58 5.74751M8.415 4.49751L9.4975 5.12251M9.4975 5.12251L7.6225 8.37001M1.875 13.125L2.425 12.465C2.54574 12.3198 2.69782 12.2038 2.86982 12.1258C3.04181 12.0478 3.22925 12.0097 3.41806 12.0145C3.60686 12.0193 3.79212 12.0669 3.95992 12.1536C4.12772 12.2402 4.27369 12.3638 4.38688 12.515C4.49848 12.6641 4.642 12.7864 4.80694 12.873C4.97189 12.9595 5.15409 13.0081 5.34022 13.0152C5.52635 13.0222 5.71171 12.9876 5.88274 12.9138C6.05377 12.8401 6.20616 12.729 6.32875 12.5888L6.4475 12.4525C6.57867 12.3025 6.74042 12.1822 6.9219 12.0998C7.10338 12.0174 7.30038 11.9747 7.49969 11.9747C7.699 11.9747 7.896 12.0174 8.07748 12.0998C8.25895 12.1822 8.4207 12.3025 8.55187 12.4525L8.67125 12.5888C9.195 13.1869 10.1363 13.1513 10.6131 12.5156C10.7263 12.3643 10.8723 12.2407 11.0402 12.1539C11.208 12.0671 11.3934 12.0196 11.5823 12.0148C11.7711 12.0099 11.9587 12.048 12.1307 12.1261C12.3028 12.2042 12.4549 12.3203 12.5756 12.4656L13.125 13.125M4.1925 10C5.10505 9.19291 6.28174 8.7482 7.5 8.75001C8.71826 8.7482 9.89495 9.19291 10.8075 10"
              stroke="#4CBC71"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "restaurant":
        return (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M4.375 5.625V1.875C4.375 1.69792 4.435 1.54959 4.555 1.43C4.675 1.31042 4.82333 1.25042 5 1.25C5.17667 1.24959 5.32521 1.30959 5.44563 1.43C5.56604 1.55042 5.62583 1.69875 5.625 1.875V5.625H6.25V1.875C6.25 1.69792 6.31 1.54959 6.43 1.43C6.55 1.31042 6.69833 1.25042 6.875 1.25C7.05167 1.24959 7.20021 1.30959 7.32063 1.43C7.44104 1.55042 7.50083 1.69875 7.5 1.875V5.625C7.5 6.20834 7.32042 6.71875 6.96125 7.15625C6.60208 7.59375 6.15667 7.88542 5.625 8.03125V13.125C5.625 13.3021 5.565 13.4506 5.445 13.5706C5.325 13.6906 5.17667 13.7504 5 13.75C4.82333 13.7496 4.675 13.6896 4.555 13.57C4.435 13.4504 4.375 13.3021 4.375 13.125V8.03125C3.84375 7.88542 3.39854 7.59375 3.03937 7.15625C2.68021 6.71875 2.50042 6.20834 2.5 5.625V1.875C2.5 1.69792 2.56 1.54959 2.68 1.43C2.8 1.31042 2.94833 1.25042 3.125 1.25C3.30167 1.24959 3.45021 1.30959 3.57062 1.43C3.69104 1.55042 3.75083 1.69875 3.75 1.875V5.625H4.375ZM10.625 8.75H9.375C9.19792 8.75 9.04958 8.69 8.93 8.57C8.81042 8.45 8.75042 8.30167 8.75 8.125V4.375C8.75 3.64584 9.01833 2.94271 9.555 2.26563C10.0917 1.58854 10.6463 1.25 11.2188 1.25C11.4063 1.25 11.5625 1.32292 11.6875 1.46875C11.8125 1.61459 11.875 1.78646 11.875 1.98438V13.125C11.875 13.3021 11.815 13.4506 11.695 13.5706C11.575 13.6906 11.4267 13.7504 11.25 13.75C11.0733 13.7496 10.925 13.6896 10.805 13.57C10.685 13.4504 10.625 13.3021 10.625 13.125V8.75Z"
              fill="#4CBC71"
            />
          </svg>
        );
      case "wifi":
        return (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M7.50009 13.125C7.06259 13.125 6.6928 12.974 6.39072 12.6719C6.08863 12.3698 5.93759 12 5.93759 11.5625C5.93759 11.125 6.08863 10.7552 6.39072 10.4531C6.6928 10.151 7.06259 10 7.50009 10C7.93759 10 8.30738 10.151 8.60946 10.4531C8.91155 10.7552 9.06259 11.125 9.06259 11.5625C9.06259 12 8.91155 12.3698 8.60946 12.6719C8.30738 12.974 7.93759 13.125 7.50009 13.125Z"
              fill="#4CBC71"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-[430px] mx-auto h-screen bg-travel-white overflow-hidden font-sf-pro">
      {/* Status Bar */}
      <div className="relative z-50 flex justify-between items-center w-full h-[50px] pt-[21px] px-4">
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

      {/* Main Image with Overlay */}
      <div className="relative w-full h-[393px]">
        <img
          src={hotelData.mainImage}
          alt={hotelData.name}
          className="w-full h-full object-cover"
        />

        {/* Image Dots */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-[5px]">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-[5px] h-[5px] rounded-full ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 h-[65px] bg-gradient-to-b from-white/0 to-transparent backdrop-blur-[10px]" />

        {/* Header Controls */}
        <div className="absolute top-[72px] left-5 right-5 flex justify-between items-center">
          <button
            onClick={handleBackClick}
            className="w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-white/50 backdrop-blur-[5px]"
          >
            <ArrowLeft className="w-5 h-5 text-travel-secondary" />
          </button>

          <div className="flex items-center gap-[10px]">
            <button className="w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
              <Heart className="w-6 h-6 text-travel-secondary" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-[20px] border border-travel-chip-border bg-travel-white/50 backdrop-blur-[5px]">
              <Share className="w-6 h-6 text-travel-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-[73px] min-h-screen rounded-t-[20px] border-2 border-white/60 bg-gradient-to-b from-travel-white via-travel-white to-travel-white backdrop-blur-[5px] z-30">
        <div className="p-5 flex flex-col gap-5">
          {/* Hotel Title */}
          <div className="flex flex-col gap-[15px]">
            <h1 className="text-[30px] font-medium text-travel-text-muted leading-[22px]">
              {hotelData.name}
            </h1>
          </div>

          {/* Address and View Map */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[10px] flex-1">
              <p className="text-[16px] text-travel-text-light leading-[20px] flex-1">
                {hotelData.address}
              </p>
            </div>
            <button className="text-[16px] text-travel-primary leading-[20px]">
              View Map
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-9">
            <div className="flex items-center gap-[5px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.62753 4.50666C8.68337 2.61332 9.21087 1.66666 10 1.66666C10.7892 1.66666 11.3167 2.61332 12.3725 4.50666L12.6459 4.99666C12.9459 5.53499 13.0959 5.80416 13.3292 5.98166C13.5625 6.15916 13.8542 6.22499 14.4375 6.35666L14.9675 6.47666C17.0175 6.94082 18.0417 7.17249 18.2859 7.95666C18.5292 8.73999 17.8309 9.55749 16.4334 11.1917L16.0717 11.6142C15.675 12.0783 15.4759 12.3108 15.3867 12.5975C15.2975 12.885 15.3275 13.195 15.3875 13.8142L15.4425 14.3783C15.6534 16.5592 15.7592 17.6492 15.1209 18.1333C14.4825 18.6175 13.5225 18.1758 11.6042 17.2925L11.1067 17.0642C10.5617 16.8125 10.2892 16.6875 10 16.6875C9.71087 16.6875 9.43836 16.8125 8.89336 17.0642L8.3967 17.2925C6.47753 18.1758 5.51753 18.6175 4.88003 18.1342C4.24087 17.6492 4.3467 16.5592 4.55753 14.3783L4.61253 13.815C4.67253 13.195 4.70253 12.885 4.61253 12.5983C4.5242 12.3108 4.32503 12.0783 3.92837 11.615L3.5667 11.1917C2.1692 9.55832 1.47087 8.74082 1.7142 7.95666C1.95753 7.17249 2.98337 6.93999 5.03337 6.47666L5.56337 6.35666C6.14587 6.22499 6.4367 6.15916 6.67087 5.98166C6.90503 5.80416 7.0542 5.53499 7.3542 4.99666L7.62753 4.50666Z"
                  fill="#FFACC6"
                />
              </svg>
              <span className="text-[20px] text-travel-pink-light">
                {hotelData.rating} |{" "}
                <span className="text-travel-text-light">
                  {hotelData.reviewCount} reviews
                </span>
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-[15px]">
            <div className="text-[12px] text-travel-text-light">from</div>
            <div className="text-[36px] font-medium text-travel-primary leading-[27px]">
              {hotelData.price}
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-[10px] flex-wrap">
              {hotelData.amenities.slice(0, 3).map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-[5px] px-[10px] py-[10px] rounded-[20px] bg-travel-shadow"
                >
                  {renderAmenityIcon(amenity.icon)}
                  <span className="text-[14px] text-travel-primary font-light">
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[10px] flex-wrap">
              {hotelData.amenities.slice(3).map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-[5px] px-[10px] py-[10px] rounded-[20px] bg-travel-shadow"
                >
                  {renderAmenityIcon(amenity.icon)}
                  <span className="text-[14px] text-travel-primary font-light">
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[24px] font-medium text-travel-text-muted leading-[22px]">
              About
            </h3>
            <p className="text-[14px] text-travel-text-muted font-light leading-[22px]">
              {hotelData.about}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-travel-text-light/10" />

          {/* Available Rooms */}
          <h3 className="text-[24px] font-medium text-travel-text-muted leading-[22px]">
            Available Rooms
          </h3>
        </div>

        {/* Room Cards Horizontal Scroll */}
        <div className="flex gap-[10px] overflow-x-auto px-5 pb-5">
          {hotelData.availableRooms.map((room) => (
            <div
              key={room.id}
              className="w-[295px] h-[384px] flex-shrink-0 rounded-[10px] bg-travel-white/70 shadow-lg backdrop-blur-[10px] relative"
            >
              {/* Room Image */}
              <img
                src={room.image}
                alt={room.name}
                className="w-[285px] h-[190px] rounded-[5px] absolute left-[5px] top-[5px] object-cover"
              />

              {/* Summer Discount Badge */}
              <div className="absolute top-5 right-[5px] bg-travel-pink-light/80 backdrop-blur-[5px] rounded-l-[20px] px-[10px] py-[10px] flex items-center gap-[5px]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.69615 1.74884C5.86029 1.56552 6.06124 1.41888 6.28589 1.31848C6.51054 1.21809 6.75384 1.1662 6.9999 1.1662C7.24596 1.1662 7.48926 1.21809 7.71391 1.31848C7.93856 1.41888 8.13951 1.56552 8.30365 1.74884L8.71198 2.205C8.77034 2.27028 8.84264 2.32159 8.92353 2.35511C9.00441 2.38864 9.09181 2.40353 9.17923 2.39867L9.79173 2.36484C10.0373 2.35135 10.283 2.38979 10.5128 2.47765C10.7426 2.56552 10.9512 2.70083 11.1251 2.87477C11.2991 3.0487 11.4344 3.25735 11.5223 3.48711C11.6101 3.71686 11.6486 3.96256 11.6351 4.20817L11.6012 4.82067C11.5965 4.908 11.6114 4.99528 11.6449 5.07606C11.6784 5.15684 11.7297 5.22904 11.7949 5.28734L12.2517 5.69567C12.4351 5.85981 12.5818 6.0608 12.6822 6.2855C12.7827 6.51021 12.8346 6.75358 12.8346 6.99971C12.8346 7.24585 12.7827 7.48921 12.6822 7.71392C12.5818 7.93862 12.4351 8.13961 12.2517 8.30375L11.7949 8.71209C11.7296 8.77044 11.6783 8.84274 11.6448 8.92363C11.6113 9.00452 11.5964 9.09191 11.6012 9.17934L11.6351 9.79184C11.6486 10.0374 11.6101 10.2831 11.5223 10.5129C11.4344 10.7427 11.2991 10.9513 11.1251 11.1252C10.9512 11.2992 10.7426 11.4345 10.5128 11.5224C10.283 11.6102 10.0373 11.6487 9.79173 11.6352L9.17923 11.6013C9.09191 11.5966 9.00462 11.6115 8.92384 11.645C8.84307 11.6785 8.77086 11.7298 8.71257 11.795L8.30423 12.2518C8.14009 12.4352 7.9391 12.5819 7.7144 12.6823C7.4897 12.7828 7.24633 12.8347 7.00019 12.8347C6.75406 12.8347 6.51069 12.7828 6.28599 12.6823C6.06128 12.5819 5.86029 12.4352 5.69615 12.2518L5.28782 11.795C5.22946 11.7297 5.15716 11.6784 5.07628 11.6449C4.99539 11.6114 4.90799 11.5965 4.82057 11.6013L4.20807 11.6352C3.96246 11.6487 3.71676 11.6102 3.487 11.5224C3.25725 11.4345 3.0486 11.2992 2.87466 11.1252C2.70073 10.9513 2.56542 10.7427 2.47755 10.5129C2.38969 10.2831 2.35125 10.0374 2.36473 9.79184L2.39857 9.17934C2.40333 9.09201 2.3884 9.00472 2.35488 8.92395C2.32136 8.84317 2.2701 8.77096 2.2049 8.71267L1.74873 8.30434C1.56532 8.14019 1.4186 7.93921 1.31815 7.7145C1.21769 7.4898 1.16577 7.24643 1.16577 7.00029C1.16577 6.75416 1.21769 6.51079 1.31815 6.28609C1.4186 6.06138 1.56532 5.8604 1.74873 5.69625L2.2049 5.28792C2.27018 5.22956 2.32148 5.15726 2.35501 5.07638C2.38854 4.99549 2.40342 4.90809 2.39857 4.82067L2.36473 4.20817C2.35125 3.96256 2.38969 3.71686 2.47755 3.48711C2.56542 3.25735 2.70073 3.0487 2.87466 2.87477C3.0486 2.70083 3.25725 2.56552 3.487 2.47765C3.71676 2.38979 3.96246 2.35135 4.20807 2.36484L4.82057 2.39867C4.9079 2.40344 4.99518 2.38851 5.07596 2.35498C5.15674 2.32146 5.22894 2.2702 5.28723 2.205L5.69615 1.74884Z"
                    fill="#FCFCFC"
                  />
                </svg>
                <span className="text-[14px] text-white">Summer Discount</span>
              </div>

              {/* Room Info */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-white rounded-b-[10px]">
                <div className="flex flex-col gap-[15px]">
                  <h4 className="text-[16px] font-medium text-travel-text-muted leading-[22px]">
                    {room.name}
                  </h4>

                  <div className="flex justify-between items-center">
                    <div className="text-[24px] font-medium text-travel-primary leading-[22px]">
                      {room.price}
                    </div>
                    <div className="flex flex-col items-end gap-[10px]">
                      <div className="text-[16px] font-bold text-travel-pink-light leading-[0px]">
                        {room.discount}
                      </div>
                      <div className="text-[14px] text-travel-text-light leading-[0px] line-through">
                        {room.originalPrice}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-[10px] flex-wrap">
                    <div className="flex items-center px-[10px] py-[10px] rounded-[20px] bg-travel-pink-light/10">
                      <span className="text-[14px] text-travel-pink-light font-light">
                        {room.roomsLeft}
                      </span>
                    </div>
                    {room.occupancy && (
                      <div className="flex items-center px-[10px] py-[10px] rounded-[20px] bg-travel-shadow">
                        <span className="text-[14px] text-travel-primary font-light">
                          {room.occupancy}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center px-[10px] py-[10px] rounded-[20px] bg-travel-shadow">
                      <span className="text-[14px] text-travel-primary font-light">
                        {room.guests}
                      </span>
                    </div>
                    {room.guestsBeds && (
                      <div className="flex items-center px-[10px] py-[10px] rounded-[20px] bg-travel-shadow">
                        <span className="text-[14px] text-travel-primary font-light">
                          {room.guestsBeds}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[12px] text-travel-text-muted font-light leading-[18px]">
                    {room.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guest Reviews Section */}
        <div className="px-5 pt-5">
          <div className="w-full h-[1px] bg-travel-text-light/10 mb-5" />

          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[24px] font-medium text-travel-text-muted leading-[22px]">
              Guest Reviews
            </h3>
            <button className="text-[16px] text-travel-primary leading-[22px]">
              See More
            </button>
          </div>

          {/* Overall Rating */}
          <div className="flex flex-col items-center gap-[10px] mb-5">
            <div className="text-[48px] font-medium text-travel-pink-light leading-[22px]">
              {hotelData.rating}
            </div>
            <div className="text-[16px] text-travel-text-light text-center font-light leading-[22px]">
              Based on {hotelData.reviewCount} reviews
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <div className="flex gap-[10px] overflow-x-auto px-5 pb-5">
          {hotelData.reviews.map((review, index) => (
            <div
              key={index}
              className="w-[348px] h-[250px] flex-shrink-0 p-5 rounded-[20px] bg-white shadow-lg flex flex-col gap-5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-[10px]">
                  {review.avatar && (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-[34px] h-[23px] rounded-[20px] object-cover"
                    />
                  )}
                  <div>
                    <div className="text-[16px] text-travel-text-muted leading-[22px]">
                      {review.name}
                    </div>
                    <div className="text-[14px] text-travel-icons font-light leading-[22px]">
                      {review.date}
                    </div>
                  </div>
                </div>
                <div className="text-[32px] text-travel-pink-light leading-[22px]">
                  {review.rating}
                </div>
              </div>

              <div className="w-full h-[1px] bg-travel-text-light/10" />

              <p className="text-[14px] text-travel-text-muted leading-[20px] flex-1">
                {review.comment}
              </p>
            </div>
          ))}
        </div>

        {/* Hotel Location */}
        <div className="px-5 pt-5">
          <div className="w-full h-[1px] bg-travel-text-light/10 mb-5" />

          <h3 className="text-[24px] font-medium text-travel-text-muted leading-[22px] mb-5">
            Hotel Location
          </h3>

          <div className="w-full h-[200px] rounded-[20px] overflow-hidden mb-5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=1288"
              alt="Hotel Location Map"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom padding for navigation */}
        <div className="h-[200px]" />
      </div>

      {/* Floating Magic Wand and Book Now */}
      <div className="fixed bottom-[90px] left-0 right-0 max-w-[430px] mx-auto px-5 z-40">
        <div className="flex items-center gap-5 p-[10px] bg-gradient-to-r from-travel-secondary to-transparent backdrop-blur-[5px] rounded-r-[20px]">
          <div className="w-16 h-16 rounded-[30px] border border-white/60 bg-gradient-to-br from-travel-pink-light/80 to-travel-pink-accent/80 shadow-lg backdrop-blur-[5px] flex items-center justify-center">
            <svg width="35" height="35" viewBox="0 0 36 36" fill="none">
              <path
                d="M17.1323 14.3031L4.43461 27.011C3.83642 27.6365 3.50697 28.4714 3.51682 29.3368C3.52666 30.2022 3.87503 31.0293 4.48729 31.641C5.09956 32.2527 5.92702 32.6003 6.79244 32.6093C7.65786 32.6184 8.49241 32.2881 9.11732 31.6894L21.8136 18.9844L17.1323 14.3031ZM25.0759 22.3852L24.9271 22.375C24.6628 22.375 24.4074 22.4707 24.2083 22.6445C24.0091 22.8182 23.8795 23.0582 23.8436 23.32L23.8334 23.4688V24.5625H22.7396C22.4753 24.5625 22.2199 24.6582 22.0208 24.832C21.8216 25.0057 21.692 25.2457 21.6561 25.5075L21.6459 25.6563C21.6459 26.2104 22.0571 26.6683 22.5909 26.7398L22.7396 26.75H23.8334V27.8438C23.8334 28.3979 24.2446 28.8558 24.7784 28.9273L24.9271 28.9375C25.1914 28.9375 25.4468 28.8418 25.646 28.6681C25.8452 28.4943 25.9747 28.2544 26.0107 27.9925L26.0209 27.8438V26.75H27.1146C27.3789 26.75 27.6343 26.6543 27.8335 26.4806C28.0327 26.3068 28.1622 26.0669 28.1982 25.805L28.2084 25.6563C28.2083 25.3919 28.1126 25.1366 27.9389 24.9374C27.7652 24.7382 27.5252 24.6087 27.2634 24.5727L27.1146 24.5625H26.0209V23.4688C26.0208 23.2044 25.9251 22.9491 25.7514 22.7499C25.5777 22.5507 25.3377 22.4212 25.0759 22.3852ZM19.9163 11.5323L19.7179 11.716L18.6796 12.7558L23.3609 17.4371L24.3992 16.3958C24.7038 16.091 24.9454 15.7292 25.1102 15.3311C25.2749 14.9329 25.3597 14.5062 25.3595 14.0753C25.3594 13.6444 25.2744 13.2178 25.1094 12.8197C24.9443 12.4217 24.7025 12.06 24.3977 11.7554L24.1688 11.5425C23.5766 11.0362 22.8235 10.7571 22.0444 10.7553C21.2653 10.7534 20.5109 11.0288 19.9163 11.5323ZM10.4925 7.80188L10.3438 7.79167C10.0795 7.79168 9.82411 7.8874 9.62492 8.06112C9.42573 8.23484 9.29618 8.47482 9.26023 8.73667L9.25002 8.88542V9.97917H8.15627C7.89197 9.97918 7.63661 10.0749 7.43742 10.2486C7.23823 10.4223 7.10868 10.6623 7.07273 10.9242L7.06252 11.0729C7.06252 11.6271 7.47377 12.0835 8.00752 12.1565L8.15627 12.1667H9.25002V13.2604C9.25002 13.8146 9.66127 14.271 10.195 14.344L10.3438 14.3542C10.6081 14.3542 10.8634 14.2584 11.0626 14.0847C11.2618 13.911 11.3914 13.671 11.4273 13.4092L11.4375 13.2604V12.1667H12.5313C12.7956 12.1667 13.0509 12.0709 13.2501 11.8972C13.4493 11.7235 13.5789 11.4835 13.6148 11.2217L13.625 11.0729C13.625 10.8086 13.5293 10.5533 13.3556 10.3541C13.1819 10.1549 12.9419 10.0253 12.68 9.98938L12.5313 9.97917H11.4375V8.88542C11.4375 8.62111 11.3418 8.36575 11.1681 8.16656C10.9943 7.96737 10.7544 7.83782 10.4925 7.80188ZM27.9925 4.88521L27.8438 4.875C27.5795 4.87501 27.3241 4.97073 27.1249 5.14445C26.9257 5.31817 26.7962 5.55815 26.7602 5.82L26.75 5.96875V7.0625H25.6563C25.392 7.06251 25.1366 7.15823 24.9374 7.33195C24.7382 7.50568 24.6087 7.74565 24.5727 8.0075L24.5625 8.15625C24.5625 8.71042 24.9738 9.16688 25.5075 9.23979L25.6563 9.25H26.75V10.3438C26.75 10.8979 27.1613 11.3544 27.695 11.4273L27.8438 11.4375C28.1081 11.4375 28.3634 11.3418 28.5626 11.168C28.7618 10.9943 28.8914 10.7544 28.9273 10.4925L28.9375 10.3438V9.25H30.0313C30.2956 9.24999 30.5509 9.15427 30.7501 8.98055C30.9493 8.80683 31.0789 8.56685 31.1148 8.305L31.125 8.15625C31.125 7.89195 31.0293 7.63659 30.8556 7.43739C30.6819 7.2382 30.4419 7.10865 30.18 7.07271L30.0313 7.0625H28.9375V5.96875C28.9375 5.70445 28.8418 5.44908 28.6681 5.24989C28.4944 5.0507 28.2544 4.92115 27.9925 4.88521Z"
                fill="#FCFCFC"
              />
            </svg>
          </div>

          <button className="flex-1 h-16 px-5 rounded-[20px] bg-travel-primary flex items-center justify-center">
            <span className="text-[20px] font-medium text-white">Book Now</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <NavBar activeTab="Home" />

      {/* Home Indicator */}
      <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-black z-60" />
    </div>
  );
};

export default HotelDetailScreen;
