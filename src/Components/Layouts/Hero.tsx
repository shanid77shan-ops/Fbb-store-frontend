import { useState, useEffect, useRef } from "react";
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { RiStarFill } from "react-icons/ri";
import Hero2 from "../Layouts/Img/Hero2.jpg";
import fbbslide from "../Layouts/Img/fbbslide.jpeg";
import shoe from "../Layouts/Img/shoe.jpeg";
import glass from "../Layouts/Img/glass.jpeg";
import banner1 from "../Layouts/Img/banner1.jpg";
import slider1 from "../Layouts/Img/slider1.jpg";
import slider12 from "../Layouts/Img/slider1 2.jpeg";
import TrendingCarousel from "./Carousel";
import axios from "axios";
import { baseurl } from "../../Constant/Base";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Shield, Truck, Award } from "lucide-react";

interface Seller {
  _id: string,
  name: string,
  Image: string,
  categories: string[],
  email: string,
  phone: string,
  status: boolean
}

const Hero = ({ onShopNowClick = () => {} }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    return !hasShownWelcome;
  });

  const navigate = useNavigate();
  
  const api = axios.create({
    baseURL: baseurl
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem('hasShownWelcome', 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);
  
  const heroSlides = [
    {
      image: fbbslide,
      heading: "Luxury Redefined",
      subheading: "Experience premium fashion crafted for the extraordinary"
    },
    {
      image: isMobile ? slider12 : slider1,
      heading: "Timeless Elegance",
      subheading: "Where tradition meets contemporary style"
    },
    {
      image: Hero2,
      heading: "Exclusive Collections",
      subheading: "Curated pieces for the discerning individual"
    }
  ];

  const [text] = useTypewriter({
    words: ["Elevate Your Style", "Discover Luxury Fashion", "Premium Collections", "Timeless Elegance", "Exclusive Designs", "Redefine Your Wardrobe"],
    loop: true,
    delaySpeed: 2000,
    typeSpeed: 70,
    deleteSpeed: 50
  });

  useEffect(() => {
    if (isHovering) return;
    
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isHovering, heroSlides.length]);

  const handleSellerClick = (sellerId: string) => {
    navigate(`/seller-list/${sellerId}`);
  };

  const handleClick = () => {
    navigate("/seller-list");
  };
  
  const getSellers = async() => {
    setLoadingSellers(true);
    try {
      const response = await api.get("/get-sellers");
      if(response && response.data) {
        const activeSellers = response.data.filter((seller: Seller) => seller.status === true);
        setSellers(activeSellers);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setLoadingSellers(false);
    }
  };
  
  useEffect(() => {
    getSellers();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const offset = window.scrollY;
        bannerRef.current.style.transform = `translateY(${offset * 0.1}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const bannerSlides = [
    {
      image: banner1,
      title: "LUXURY TIMEPIECES",
      description: "Discover our exclusive collection of premium watches from leading luxury brands. Each timepiece is a masterpiece of craftsmanship, combining precision engineering with timeless design. From classic automatic movements to modern smart features, find the perfect watch that tells your story.",
      accent: "#D4AF37"
    },
    {
      image: glass,
      title: "DESIGNER EYEWEAR",
      description: "Protect your eyes in style with our curated selection of designer sunglasses. Featuring UV protection, polarized lenses, and the latest fashion trends. Our collection includes luxury brands known for their quality, durability, and iconic designs that complement any outfit.",
      accent: "#2C3E50"
    },
    {
      image: shoe,
      title: "ARTISAN FOOTWEAR",
      description: "Step into excellence with our premium footwear collection. Handcrafted using the finest materials, each pair combines comfort with sophisticated design. From formal leather shoes to casual sneakers, experience footwear that supports you in style throughout the day.",
      accent: "#1a1a1a"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextBannerSlide = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevBannerSlide = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const displaySellers = sellers.slice(0, 4);

  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Free Shipping",
      description: "On all orders above $200"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Dedicated customer service"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payment",
      description: "100% secure transactions"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Authentic luxury products"
    }
  ];

  return (
    <div className="relative">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-white text-4xl md:text-7xl font-light tracking-widest mb-4">
                WELCOME TO <span className="font-bold text-gold-400">FBB LUXURY</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl">Redefining Fashion Excellence</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:block fixed top-0 bottom-0 left-8 w-px bg-gradient-to-b from-transparent via-gold-400/20 to-transparent z-10"></div>
      <div className="hidden lg:block fixed top-0 bottom-0 right-8 w-px bg-gradient-to-b from-transparent via-gold-400/20 to-transparent z-10"></div>

      <div 
        className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[900px] overflow-hidden group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[currentSlideIndex].image}
              alt={heroSlides[currentSlideIndex].heading}
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(212,175,55,0.15)_0%,_transparent_70%)]"></div>
          </motion.div>
        </AnimatePresence>

        <button 
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:bg-black/60 hover:scale-110 z-10"
          onClick={prevSlide}
        >
          <FiChevronLeft size={24} />
        </button>
        
        <button 
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:bg-black/60 hover:scale-110 z-10"
          onClick={nextSlide}
        >
          <FiChevronRight size={24} />
        </button>

        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${
                currentSlideIndex === index ? "w-8 md:w-12 bg-gold-400" : "w-2 md:w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute top-6 md:top-8 left-6 md:left-12 w-16 md:w-24 h-16 md:h-24 border-l-2 border-t-2 border-gold-400/40"></div>
        <div className="absolute top-6 md:top-8 right-6 md:right-12 w-16 md:w-24 h-16 md:h-24 border-r-2 border-t-2 border-gold-400/40"></div>
        <div className="absolute bottom-6 md:bottom-8 left-6 md:left-12 w-16 md:w-24 h-16 md:h-24 border-l-2 border-b-2 border-gold-400/40"></div>
        <div className="absolute bottom-6 md:bottom-8 right-6 md:right-12 w-16 md:w-24 h-16 md:h-24 border-r-2 border-b-2 border-gold-400/40"></div>

        <div className="relative h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-0.5 bg-gold-400 mb-6 md:mb-8"
            ></motion.div>
            
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              <span>{text}</span>
              <Cursor cursorColor='#D4AF37' />
            </h1>

            <p className="text-gray-200 text-lg md:text-xl mb-8 md:mb-12 max-w-xl">
              Discover curated collections from the world's finest designers. Experience luxury fashion that tells your unique story.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShopNowClick}
              className="bg-gold-400 text-black hover:bg-gold-500 px-8 md:px-10 py-3 md:py-4 rounded-sm transition-all duration-300 text-lg md:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400 group"
            >
              <Link to="/shop">
                <span className="flex items-center">
                  EXPLORE COLLECTIONS
                  <FiArrowRight className="ml-3 transform transition-transform group-hover:translate-x-2" size={24} />
                </span>
              </Link>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 text-gold-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-24 mb-16 md:mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Luxury Partners</h2>
          <div className="w-24 md:w-32 h-1 bg-gold-400 mx-auto mt-4 mb-4"></div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Collaborating with the finest artisans and luxury brands to bring you exceptional quality and design
          </p>
        </motion.div>

        {loadingSellers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-xl shadow-lg overflow-hidden h-80 md:h-96 animate-pulse">
                <div className="h-3/4 w-full bg-gray-200"></div>
                <div className="h-1/4 p-4 bg-white">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            {displaySellers.map((seller, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
              >
                <div 
                  className="relative h-72 md:h-80 cursor-pointer" 
                  onClick={() => handleSellerClick(seller._id)}
                >
                  <img
                    src={seller.Image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop"}
                    alt={seller.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  <div className="absolute top-4 right-4 w-10 h-10 border-2 border-gold-400/60 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <FiStar className="text-gold-400 text-sm" />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-gold-400 text-black px-6 py-3 rounded-sm font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-sm tracking-wide">
                      VIEW COLLECTION
                    </span>
                  </div>
                  
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white px-6 py-3 bg-black/60 backdrop-blur-sm inline-block rounded-sm">
                      {seller.name}
                    </h3>
                    <p className="text-gray-300 text-sm mt-2">Premium Luxury Partner</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-center mb-12 md:mb-20">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden bg-black text-white px-8 py-3 rounded-sm transition-all duration-300 border border-transparent hover:border-gold-400 text-lg"
            onClick={handleClick}
          >
            <span className="relative z-10 flex items-center">
              EXPLORE ALL PARTNERS
              <FiArrowRight className="ml-3 transform transition-transform group-hover:translate-x-2" size={20} />
            </span>
            <div className="absolute inset-0 bg-gold-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </motion.button>
        </div>

        {/* Luxury Categories Section */}
        <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 relative">
              <div className="w-full lg:w-1/2 h-[450px] lg:h-[650px] relative group">
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={currentBannerIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="relative w-full h-full"
                      ref={bannerRef}
                    >
                      <img
                        src={bannerSlides[currentBannerIndex].image}
                        alt={bannerSlides[currentBannerIndex].title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-white/40 rounded-tl-lg" />
                  <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-white/40 rounded-br-lg" />

                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
                    <button
                      onClick={prevBannerSlide}
                      className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-gold-400 hover:text-black transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextBannerSlide}
                      className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-gold-400 hover:text-black transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2 mt-8 lg:mt-0"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBannerIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 lg:p-12 rounded-2xl shadow-2xl relative border border-gray-100"
                  >
                    <div 
                      className="absolute top-0 left-0 w-3 h-full rounded-l-2xl"
                      style={{ backgroundColor: bannerSlides[currentBannerIndex].accent }}
                    />
                    
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                      <span style={{ color: bannerSlides[currentBannerIndex].accent }}>
                        {bannerSlides[currentBannerIndex].title}
                      </span>
                    </h2>

                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {bannerSlides[currentBannerIndex].description}
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                        <span className="text-gray-700">Premium quality materials</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                        <span className="text-gray-700">Authentic luxury brands</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-gold-400"></div>
                        <span className="text-gray-700">Expert craftsmanship</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ x: 10 }}
                      className="group inline-flex items-center space-x-3 text-lg font-semibold transition-all duration-300"
                      style={{ color: bannerSlides[currentBannerIndex].accent }}
                    >
                      <span>DISCOVER COLLECTION</span>
                      <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* New Arrivals Section */}
      <div className="relative h-[450px] md:h-[700px] w-full overflow-hidden mb-12 md:mb-24 group">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="absolute inset-0"
        >
          <img
            src={Hero2}
            alt="New Arrivals"
            className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
        </motion.div>
        <div className="absolute inset-0 flex flex-col items-start justify-center text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 relative">
              <span className="tracking-widest">SPRING</span>
              <br />
              <span className="text-gold-400">COLLECTION 2024</span>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 0.7, delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute -bottom-3 md:-bottom-4 left-0 h-0.5 md:h-1 bg-gold-400"
              />
            </h2>
            <p className="text-lg md:text-xl text-gray-200 mb-8 md:mb-12">
              Introducing our latest collection featuring contemporary designs, premium fabrics, and innovative styling.
            </p>
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShopNowClick}
              className="bg-gold-400 text-black hover:bg-gold-500 px-8 py-3 border border-gold-400 hover:border-gold-500 rounded-sm transition-all duration-300 text-lg font-semibold group"
            >
              <Link to="/shop">
                <span className="flex items-center">
                  SHOP NEW ARRIVALS
                  <FiArrowRight className="ml-3 transform transition-transform group-hover:translate-x-2" size={20} />
                </span>
              </Link>
            </motion.button>
          </motion.div>
        </div>
        
        <div className="absolute top-8 left-8 md:left-16 w-16 md:w-24 h-16 md:h-24 border-l-2 border-t-2 border-gold-400/40"></div>
        <div className="absolute bottom-8 right-8 md:right-16 w-16 md:w-24 h-16 md:h-24 border-r-2 border-b-2 border-gold-400/40"></div>
      </div>
      
      <TrendingCarousel />
      
      {/* Testimonial Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Clients Say</h2>
          <div className="w-24 h-1 bg-gold-400 mx-auto mt-4 mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the FBB difference through the words of our valued customers
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Fashion Influencer",
              content: "The quality and craftsmanship of FBB products are exceptional. Every piece tells a story of luxury and attention to detail.",
              rating: 5
            },
            {
              name: "Michael Chen",
              role: "Luxury Collector",
              content: "As someone who appreciates fine craftsmanship, I'm impressed by FBB's commitment to quality and authentic luxury brands.",
              rating: 5
            },
            {
              name: "Emma Williams",
              role: "Style Editor",
              content: "FBB has redefined my shopping experience. Their curated collections and exceptional service are unmatched.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <RiStarFill key={i} className="text-gold-400 w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-600 italic mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold text-lg mr-4">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center justify-center"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            delay: 3,
            scale: {
              type: "spring",
              stiffness: 100
            }
          }}
          whileHover={{ scale: 1.1 }}
          className="w-14 h-14 bg-black shadow-2xl rounded-full flex items-center justify-center cursor-pointer border border-gold-400/20"
        >
          <div className="w-12 h-12 rounded-full bg-gold-400 flex items-center justify-center group hover:bg-gold-500 transition-colors duration-300">
            <RiStarFill className="text-black group-hover:scale-110 transition-transform text-lg" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;