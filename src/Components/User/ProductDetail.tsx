import { useState, useEffect, useRef } from "react"
import { Button } from "../Layouts/button"
import { ChevronLeft, ChevronRight, Heart, Share2, ShoppingBag, Truck, Shield, Play, Star, Package, Globe, CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "../../lib/util"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { baseurl } from "../../Constant/Base"
import NavBar from "../Layouts/Navbar"
import Footer from "../Layouts/Footer"
import { motion, AnimatePresence } from "framer-motion"

interface ProductImages {
  image1: string
  image2: string
  image3: string
  image4: string
}

interface ProductVideos {
  video1?: string
  video2?: string
  video3?: string
}

interface ProductData {
  _id: string
  name: string
  brand: string
  priceINR: number
  priceAED: number
  subCategoryId: Category
  active: boolean
  images: ProductImages
  videos?: ProductVideos
  description: string
  createdAt: string
  updatedAt: string
  seller: Seller
}

interface Seller {
  name: string,
  DXB: string,
  INR: string,
  Image: string,
  address?: string,
  email?: string,
  contact?: string
}

interface Category {
  name: string,
  _id: string,
}

interface RelatedProduct {
  _id: string
  name: string
  brand: string
  priceINR: number
  priceAED: number
  images: ProductImages
  category: string
}

interface MediaItem {
  type: 'image' | 'video'
  url: string
}

interface ImageMagnifierProps {
  media: MediaItem[]
  currentIndex: number
  productName: string
}

const ImageMagnifier = ({ media, currentIndex, productName }: ImageMagnifierProps) => {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const currentItem = media[currentIndex];

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }

    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || currentItem.type !== 'image') return;

    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / dimensions.width) * 100;
    const y = ((e.clientY - top) / dimensions.height) * 100;

    setPosition({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 shadow-2xl group"
      onMouseEnter={() => currentItem.type === 'image' && setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      {currentItem.type === 'image' ? (
        <>
          <img
            src={currentItem.url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop&auto=format&q=80"}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {showZoom && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div
                className="absolute w-40 h-40 border-2 border-white rounded-full overflow-hidden shadow-2xl transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${Math.min(Math.max(position.x, 16), 84)}%`,
                  top: `${Math.min(Math.max(position.y, 16), 84)}%`,
                }}
              >
                <div
                  className="absolute w-full h-full"
                  style={{
                    transform: `translate(-${position.x * 16}%, -${position.y * 16}%)`,
                    transformOrigin: 'top left',
                    width: '1600%',
                    height: '1600%'
                  }}
                >
                  <img
                    src={currentItem.url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop&auto=format&q=80"}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <video 
          src={currentItem.url}
          controls
          autoPlay={false}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

export default function ProductPage() {
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0)
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [region, setRegion] = useState<'IN' | 'AE'>('IN')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [scrolled, setScrolled] = useState(false)
  const { id } = useParams<{ id: string }>()

  const PHONE_NUMBERS = {
    IN: productData?.seller.INR,
    AE: productData?.seller.DXB
  }
  console.log(PHONE_NUMBERS,productData?.seller,"ll")

  const api = axios.create({
    baseURL: baseurl,
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone.includes('Asia/Dubai') || timezone.includes('Asia/Muscat')) {
      setRegion('AE')
    }
  }, [])

  const getDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/get-product/${id}`)
      setProductData(response.data.product)
      
      const images = response.data.product.images ? Object.values(response.data.product.images).filter(Boolean) as string[] : []
      const videos = response.data.product.videos ? Object.values(response.data.product.videos).filter(Boolean) as string[] : []
      
      const mediaArray: MediaItem[] = [
        ...images.map((url) => ({ type: 'image' as const, url })),
        ...videos.map((url) => ({ type: 'video' as const, url }))
      ]
      
      setMediaItems(mediaArray)
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRelated = async () => {
    try {
      const category = productData?.subCategoryId?._id
      const seller = productData?.seller?.name
      const response = await api.get(`/get-related/${seller}/${category}`)
      setRelatedProducts(response.data.products || [])
    } catch (error) {
      console.error("Error fetching related products:", error)
    }
  }

  useEffect(() => {
    if (id) {
      getDetails()
    }
  }, [id])

  useEffect(() => {
    if (productData?.subCategoryId?._id) {
      getRelated()
    }
  }, [productData])

  const handleEnquiry = () => {
    if (productData) {
      const phoneNumber = PHONE_NUMBERS[region]
      const productUrl = window.location.href
      
      const priceDisplay = region === 'AE' 
        ? `AED ${productData.priceAED.toLocaleString()}`
        : `₹${productData.priceINR.toLocaleString()}`

      const message = encodeURIComponent(`
🛍️ *Check out this premium product!*

*${productData.brand} - ${productData.name}*

💰 *Price:* ${priceDisplay}
🏷️ *Brand:* ${productData.brand}
📦 *Category:* ${productData.subCategoryId.name}
📝 *Seller:* ${productData.seller.name}

🔍 *View Product:*
${productUrl}

I'm interested in this product. Could you please provide more information?`)

      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
    }
  }

  const handleShare = async () => {
    if (productData) {
      try {
        const shareData = {
          title: `${productData.brand} ${productData.name}`,
          text: `Check out ${productData.brand} ${productData.name} - ₹${productData.priceINR.toLocaleString()}`,
          url: window.location.href
        }
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
        navigator.clipboard.writeText(window.location.href)
        showToastMessage("Link copied to clipboard!")
      }
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    showToastMessage(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const statistics = [
    { value: "150K+", label: "Happy Customers", icon: <Star className="w-4 h-4" /> },
    { value: "100%", label: "Authentic", icon: <CheckCircle className="w-4 h-4" /> },
    { value: "24/7", label: "Support", icon: <Shield className="w-4 h-4" /> },
    { value: "30 Day", label: "Returns", icon: <Package className="w-4 h-4" /> }
  ];

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Authentic Product",
      description: "100% genuine with manufacturer warranty"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Free Shipping",
      description: "Free delivery on orders above ₹5000"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Quality Guarantee",
      description: "Premium quality certified products"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Standards",
      description: "Meeting international quality standards"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gold-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 animate-pulse">Loading product details...</p>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
          <Button
            variant="outline"
            className="mt-4 border-black text-black hover:bg-black hover:text-white"
            onClick={() => window.location.href = '/shop'}
          >
            Return to Shop
          </Button>
        </div>
      </div>
    )
  }

  const RegionToggle = () => (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Region:</span>
      <button
        onClick={() => setRegion('IN')}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
          region === 'IN' 
            ? "bg-black text-white" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        India
      </button>
      <button
        onClick={() => setRegion('AE')}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
          region === 'AE' 
            ? "bg-black text-white" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        Dubai
      </button>
    </div>
  )

  const PriceDisplay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-2"
    >
      {region === 'AE' ? (
        <>
          <div className="text-3xl sm:text-4xl font-bold text-gold-400">
            AED {Number(productData?.priceAED).toLocaleString()}
          </div>
          <div className="text-lg text-gray-600">
            ₹{Number(productData?.priceINR).toLocaleString()}
          </div>
        </>
      ) : (
        <>
          <div className="text-3xl sm:text-4xl font-bold text-gold-400">
            ₹{Number(productData?.priceINR).toLocaleString()}
          </div>
          <div className="text-lg text-gray-600">
            AED {Number(productData?.priceAED).toLocaleString()}
          </div>
        </>
      )}
    </motion.div>
  )

  const renderRatingStars = (rating: number = 4.5) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-gold-400 text-gold-400"
                : i < rating
                ? "fill-gold-400 text-gold-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{rating}</span>
        <span className="text-sm text-gray-500">(850 reviews)</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="flex-grow">
        <div className="relative bg-black py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {statistics.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-gold-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gold-400">{stat.value}</div>
                  </div>
                  <div className="text-gray-300 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12"
          >
            <div className="w-full lg:w-1/2">
              <div className="relative group mb-6">
                {mediaItems.length > 0 && (
                  <ImageMagnifier 
                    media={mediaItems}
                    currentIndex={currentMediaIndex}
                    productName={`${productData.brand} ${productData.name}`}
                  />
                )}
                
                {mediaItems.length > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 p-3 rounded-full text-white shadow-xl hover:bg-black transition-colors z-10"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 p-3 rounded-full text-white shadow-xl hover:bg-black transition-colors z-10"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </motion.button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {mediaItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={cn(
                      "w-full transition-all rounded-lg overflow-hidden hover:shadow-md",
                      currentMediaIndex === index 
                        ? "ring-2 ring-gold-400 ring-offset-2" 
                        : "ring-1 ring-gray-200"
                    )}
                  >
                    <div className="w-full aspect-square relative">
                      {item.type === 'image' ? (
                        <img
                          src={item.url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop&auto=format&q=80"}
                          alt={`View ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="absolute inset-0">
                            <div 
                              className="w-full h-full bg-center bg-cover bg-no-repeat"
                              style={{ backgroundImage: `url(${mediaItems.find(i => i.type === 'image')?.url})`, filter: 'blur(1px)' }}
                            />
                          </div>
                          <div className="relative z-10 bg-black/60 rounded-full p-2">
                            <Play className="h-4 w-4 text-white" fill="white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-3"
              >
                <nav className="flex items-center text-sm text-gray-500 space-x-2">
                  <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
                  <ChevronRight className="h-3 w-3" />
                  <Link to="/shop" className="hover:text-gold-400 transition-colors">Shop</Link>
                  <ChevronRight className="h-3 w-3" />
                  <Link 
                    to={`/category/${productData.subCategoryId._id}`} 
                    className="hover:text-gold-400 transition-colors"
                  >
                    {productData.subCategoryId.name}
                  </Link>
                </nav>
                
                <div className="flex items-center gap-2">
                  <span className="bg-gold-400/10 text-gold-400 text-xs font-medium px-3 py-1 rounded-full">
                    {productData.brand}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                    #{productData.subCategoryId.name}
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {productData.name}
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                {renderRatingStars()}
              </motion.div>

              <PriceDisplay />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="pt-6 border-t border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h3>
                <div className="text-gray-700 space-y-3">
                  <p className="leading-relaxed">{productData.description}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-6 pt-6 border-t border-gray-100"
              >
                <RegionToggle />
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnquiry}
                    className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-base font-semibold h-14 rounded-lg"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    ENQUIRE VIA WHATSAPP
                  </motion.button>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 flex justify-center items-center gap-2 text-sm font-medium h-12 rounded-lg transition-all"
                    >
                      <Share2 className="h-4 w-4" />
                      SHARE PRODUCT
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleWishlist}
                      className={cn(
                        "w-full flex justify-center items-center gap-2 text-sm font-medium h-12 rounded-lg transition-all",
                        isWishlisted
                          ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isWishlisted ? "fill-red-500" : "")} />
                      {isWishlisted ? "WISHLISTED" : "ADD TO WISHLIST"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="pt-6 border-t border-gray-100"
              >
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{feature.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="space-y-6 pt-6 border-t border-gray-100"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative w-14 h-14 overflow-hidden rounded-full border-2 border-white shadow-md flex-shrink-0">
                      <img 
                        src={productData.seller.Image || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=100&h=100&fit=crop&auto=format&q=80"} 
                        alt={productData.seller.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=100&h=100&fit=crop&auto=format&q=80";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">{productData.seller.name}</h4>
                        <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-1 rounded-full">Verified Seller</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Premium authorized retailer</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">CATEGORY</div>
                      <div className="text-gray-900">{productData.subCategoryId.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">BRAND</div>
                      <div className="text-gray-900">{productData.brand}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">PRODUCT ID</div>
                      <div className="text-gray-900">{productData._id.substring(0, 8).toUpperCase()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">AVAILABILITY</div>
                      <div className="text-green-600 font-medium">In Stock</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <Sparkles className="h-10 w-10 text-gold-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">You Might Also Like</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Discover more premium products from our curated collection
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {relatedProducts.slice(0, 4).map((product) => (
                    <motion.div
                      key={product._id}
                      whileHover={{ y: -8 }}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => window.location.href = `/product/${product._id}`}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={product.images.image1 || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop&auto=format&q=80"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <div className="text-white font-semibold">{product.brand}</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{product.priceINR.toLocaleString()}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gold-400 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="text-center pt-4">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 text-gold-400 font-medium hover:text-gold-500 transition-colors"
                  >
                    View All Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-xl hover:bg-gray-900 transition-all z-40 hover:scale-110"
      >
        <Star className="text-gold-400 h-6 w-6" />
      </motion.button>

      <Footer />
    </div>
  )
}