import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, query, where } from 'firebase/firestore';
import { Product, Order, HeroVideo, HeroImage } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { useAuth } from './AuthContext';
import { saveVideoBlob, getVideoBlob, clearVideoBlob } from '../utils/videoStorage';

interface ProductContextType {
  products: Product[];
  orders: Order[];
  loading: boolean;
  heroVideoUrl: string;
  heroVideoUrl2: string;
  heroVideoSource: 'default' | 'url' | 'local';
  heroVideoSource2: 'default' | 'url' | 'local';
  offersBannerUrl: string;
  heroVideos: HeroVideo[];
  heroImages: HeroImage[];
  categoryThumbMen: string;
  categoryThumbWomen: string;
  categoryThumbKids: string;
  addProduct: (product: Omit<Product, 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateHeroVideoUrl: (url: string, index?: 1 | 2) => Promise<{ success: boolean; isLocalOnly?: boolean; error?: string }>;
  uploadLocalVideo: (file: File, index?: 1 | 2) => Promise<{ success: boolean; error?: string }>;
  resetHeroVideo: (index?: 1 | 2) => Promise<{ success: boolean; error?: string }>;
  updateOffersBannerUrl: (url: string) => Promise<{ success: boolean; error?: string }>;
  updateCategoryThumbnail: (category: 'Men' | 'Women' | 'Kids', url: string) => Promise<{ success: boolean; error?: string }>;
  seedProductsDatabase: () => Promise<void>;
  addHeroVideo: (name: string, url: string, isBase64?: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteHeroVideo: (id: string) => Promise<{ success: boolean; error?: string }>;
  addHeroImage: (name: string, url: string, isBase64?: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteHeroImage: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4');
  const [heroVideoSource, setHeroVideoSource] = useState<'default' | 'url' | 'local'>('default');
  const [heroVideoUrl2, setHeroVideoUrl2] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4');
  const [heroVideoSource2, setHeroVideoSource2] = useState<'default' | 'url' | 'local'>('default');
  const [offersBannerUrl, setOffersBannerUrl] = useState<string>('https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop');
  const [categoryThumbMen, setCategoryThumbMen] = useState<string>('https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop');
  const [categoryThumbWomen, setCategoryThumbWomen] = useState<string>('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop');
  const [categoryThumbKids, setCategoryThumbKids] = useState<string>('https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop');
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const { currentUser, isAdmin } = useAuth();

  // Helper to convert File to Base64 string for database storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Load hero videos on startup from IndexedDB/LocalStorage, fallback to defaults
  useEffect(() => {
    const loadSavedVideo = async () => {
      try {
        // Load video 1
        const source1 = localStorage.getItem('prashant_hero_video_source') || 'default';
        if (source1 === 'local') {
          const savedBlob = await getVideoBlob('hero_video_blob');
          if (savedBlob) {
            const objectUrl = URL.createObjectURL(savedBlob);
            setHeroVideoUrl(objectUrl);
            setHeroVideoSource('local');
            console.log('Successfully loaded locally saved video 1 from device storage.');
          } else {
            setHeroVideoSource('default');
          }
        } else {
          const localUrl = localStorage.getItem('prashant_hero_video_url');
          if (localUrl) {
            setHeroVideoUrl(localUrl);
            setHeroVideoSource('url');
          }
        }

        // Load video 2
        const source2 = localStorage.getItem('prashant_hero_video_source2') || 'default';
        if (source2 === 'local') {
          const savedBlob2 = await getVideoBlob('hero_video_blob2');
          if (savedBlob2) {
            const objectUrl2 = URL.createObjectURL(savedBlob2);
            setHeroVideoUrl2(objectUrl2);
            setHeroVideoSource2('local');
            console.log('Successfully loaded locally saved video 2 from device storage.');
          } else {
            setHeroVideoSource2('default');
          }
        } else {
          const localUrl2 = localStorage.getItem('prashant_hero_video_url2');
          if (localUrl2) {
            setHeroVideoUrl2(localUrl2);
            setHeroVideoSource2('url');
          }
        }

        // Load offers banner
        const savedBanner = localStorage.getItem('prashant_offers_banner_url');
        if (savedBanner) {
          setOffersBannerUrl(savedBanner);
        }

        // Load category thumbnails
        const savedMen = localStorage.getItem('prashant_category_thumb_Men');
        if (savedMen) setCategoryThumbMen(savedMen);
        const savedWomen = localStorage.getItem('prashant_category_thumb_Women');
        if (savedWomen) setCategoryThumbWomen(savedWomen);
        const savedKids = localStorage.getItem('prashant_category_thumb_Kids');
        if (savedKids) setCategoryThumbKids(savedKids);
      } catch (e) {
        console.error('Failed to load local saved videos on startup:', e);
      }
    };
    loadSavedVideo();
  }, []);

  // Listen to products, orders, and settings in real-time based on auth state
  useEffect(() => {
    let unsubscribeProducts = () => {};
    let unsubscribeOrders = () => {};
    let unsubscribeSettings = () => {};
    let unsubscribeSettings2 = () => {};
    let unsubscribeSettings3 = () => {};
    let unsubscribeThumbMen = () => {};
    let unsubscribeThumbWomen = () => {};
    let unsubscribeThumbKids = () => {};
    let unsubscribeHeroVideos = () => {};
    let unsubscribeHeroImages = () => {};

    const setupListeners = async () => {
      try {
        // 1. Subscribe to products
        const productsCol = collection(db, 'products');
        unsubscribeProducts = onSnapshot(productsCol, 
          (snapshot) => {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as Product);
            });
            
            if (list.length === 0) {
              setProducts(INITIAL_PRODUCTS);
              // Auto-seed if the admin is logged in and DB is empty
              if (isAdmin) {
                console.log('Admin logged in and product catalogue empty. Seeding...');
                seedProductsDatabase();
              }
            } else {
              setProducts(list);
            }
            setLoading(false);
          },
          (error) => {
            console.warn('Firestore Products subscription error, using local data:', error);
            setProducts(INITIAL_PRODUCTS);
            setLoading(false);
          }
        );

        // 2. Subscribe to orders based on user role
        if (!currentUser) {
          // Guest user: cannot view any orders
          setOrders([]);
        } else {
          // If admin, subscribe to all orders. If customer, subscribe only to their own orders.
          const ordersCol = collection(db, 'orders');
          const ordersQuery = isAdmin 
            ? ordersCol 
            : query(ordersCol, where('customerMobile', '==', currentUser.mobile));

          unsubscribeOrders = onSnapshot(ordersQuery,
            (snapshot) => {
              const list: Order[] = [];
              snapshot.forEach((docSnap) => {
                const order = docSnap.data() as Order;
                list.push(order);
              });
              // Sort by date descending
              list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setOrders(list);
            },
            (error) => {
              console.warn('Firestore Orders subscription error:', error);
            }
          );
        }

        // 3. Subscribe to settings (hero video URL 1)
        const heroVideoDoc = doc(db, 'settings', 'hero_video');
        unsubscribeSettings = onSnapshot(heroVideoDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                const currentSource = localStorage.getItem('prashant_hero_video_source') || 'default';
                if (currentSource !== 'local') {
                  setHeroVideoUrl(data.url);
                  setHeroVideoSource('url');
                }
              }
            } else {
              // Auto-initialize default settings in Firestore database
              try {
                await setDoc(heroVideoDoc, {
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4',
                  updatedAt: new Date().toISOString()
                });
              } catch (e) {
                console.warn('Could not auto-initialize hero_video setting in Firestore:', e);
              }
            }
          },
          (error) => {
            console.warn('Firestore settings subscription error:', error);
          }
        );

        // 4. Subscribe to settings (hero video URL 2)
        const heroVideoDoc2 = doc(db, 'settings', 'hero_video2');
        unsubscribeSettings2 = onSnapshot(heroVideoDoc2,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                const currentSource2 = localStorage.getItem('prashant_hero_video_source2') || 'default';
                if (currentSource2 !== 'local') {
                  setHeroVideoUrl2(data.url);
                  setHeroVideoSource2('url');
                }
              }
            } else {
              // Auto-initialize default settings in Firestore database
              try {
                await setDoc(heroVideoDoc2, {
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4',
                  updatedAt: new Date().toISOString()
                });
              } catch (e) {
                console.warn('Could not auto-initialize hero_video2 setting in Firestore:', e);
              }
            }
          },
          (error) => {
            console.warn('Firestore settings2 subscription error:', error);
          }
        );

        // 5. Subscribe to settings (offers banner URL)
        const offersBannerDoc = doc(db, 'settings', 'offers_banner');
        unsubscribeSettings3 = onSnapshot(offersBannerDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                setOffersBannerUrl(data.url);
              }
            } else {
              // Auto-initialize default settings in Firestore database
              try {
                await setDoc(offersBannerDoc, {
                  url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
                  updatedAt: new Date().toISOString()
                });
              } catch (e) {
                console.warn('Could not auto-initialize offers_banner setting in Firestore:', e);
              }
            }
          },
          (error) => {
            console.warn('Firestore settings3 subscription error:', error);
          }
        );

        // 5a. Subscribe to settings (category_thumb_Men)
        const thumbMenDoc = doc(db, 'settings', 'category_thumb_Men');
        unsubscribeThumbMen = onSnapshot(thumbMenDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                setCategoryThumbMen(data.url);
              }
            } else {
              try {
                await setDoc(thumbMenDoc, {
                  url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop',
                  updatedAt: new Date().toISOString()
                });
              } catch (e) {
                console.warn('Could not auto-initialize category_thumb_Men:', e);
              }
            }
          },
          (error) => {
            console.warn('Firestore thumbMenDoc subscription error:', error);
          }
        );

        // 5b. Subscribe to settings (category_thumb_Women)
        const thumbWomenDoc = doc(db, 'settings', 'category_thumb_Women');
        unsubscribeThumbWomen = onSnapshot(thumbWomenDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                setCategoryThumbWomen(data.url);
              }
            } else {
              try {
                await setDoc(thumbWomenDoc, {
                  url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop',
                  updatedAt: new Date().toISOString()
                });
              } catch (e) {
                console.warn('Could not auto-initialize category_thumb_Women:', e);
              }
            }
          },
          (error) => {
            console.warn('Firestore thumbWomenDoc subscription error:', error);
          }
        );

        // 5c. Subscribe to settings (category_thumb_Kids)
        const thumbKidsDoc = doc(db, 'settings', 'category_thumb_Kids');
        unsubscribeThumbKids = onSnapshot(thumbKidsDoc,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.url) {
                setCategoryThumbKids(data.url);
              }
            } else {
              try {
                await setDoc(thumbKidsDoc, {
                  url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop',
                  updatedAt: new Date().toISOString()
                });
              } catch (e) {
                console.warn('Could not auto-initialize category_thumb_Kids:', e);
              }
            }
          },
          (error) => {
            console.warn('Firestore thumbKidsDoc subscription error:', error);
          }
        );

        // 6. Subscribe to hero_videos collection
        const heroVideosCol = collection(db, 'hero_videos');
        unsubscribeHeroVideos = onSnapshot(heroVideosCol,
          (snapshot) => {
            const list: HeroVideo[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as HeroVideo);
            });
            list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setHeroVideos(list);
          },
          (error) => {
            console.warn('Firestore hero_videos subscription error:', error);
          }
        );

        // 7. Subscribe to hero_images collection
        const heroImagesCol = collection(db, 'hero_images');
        unsubscribeHeroImages = onSnapshot(heroImagesCol,
          (snapshot) => {
            const list: HeroImage[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as HeroImage);
            });
            list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setHeroImages(list);
          },
          (error) => {
            console.warn('Firestore hero_images subscription error:', error);
          }
        );
      } catch (e) {
        console.error('Failed to setup Firestore listeners:', e);
        setProducts(INITIAL_PRODUCTS);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeSettings();
      unsubscribeSettings2();
      unsubscribeSettings3();
      unsubscribeThumbMen();
      unsubscribeThumbWomen();
      unsubscribeThumbKids();
      unsubscribeHeroVideos();
      unsubscribeHeroImages();
    };
  }, [currentUser, isAdmin]);

  const seedProductsDatabase = async () => {
    try {
      // Loop through and write each initial product to Firestore
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      console.log('Seeding products database successful!');
    } catch (error) {
      console.error('Database seeding failed:', error);
    }
  };

  const addProduct = async (prodData: Omit<Product, 'createdAt'>) => {
    const id = prodData.id || `prod-${Date.now()}`;
    const path = `products/${id}`;
    try {
      const newProduct: Product = {
        ...prodData,
        id,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'products', id), newProduct);
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const deleteProduct = async (id: string) => {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`; // e.g., "260707"
    const prefix = `PF-${datePrefix}`;

    // Find existing orders today that start with this prefix to calculate next sequence
    const todayOrders = orders.filter(o => o.id && o.id.startsWith(prefix));
    
    let nextSeq = 1;
    if (todayOrders.length > 0) {
      const seqs = todayOrders.map(o => {
        const seqStr = o.id.replace(prefix, '');
        const parsed = parseInt(seqStr, 10);
        return isNaN(parsed) ? 0 : parsed;
      });
      nextSeq = Math.max(...seqs) + 1;
    }
    
    const id = `${prefix}${String(nextSeq).padStart(2, '0')}`;
    const path = `orders/${id}`;
    try {
      const newOrder: Order = {
        ...orderData,
        id,
        createdAt: new Date().toISOString()
      };

      // Write order doc
      await setDoc(doc(db, 'orders', id), newOrder);

      // Deduct stock for each item
      for (const item of orderData.items) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await updateDoc(doc(db, 'products', item.productId), {
            stock: newStock
          });
        }
      }

      return { success: true, id };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const updateHeroVideoUrl = async (url: string, index: 1 | 2 = 1) => {
    try {
      const isFirst = index === 1;
      const currentUrl = isFirst ? heroVideoUrl : heroVideoUrl2;
      const currentSource = isFirst ? heroVideoSource : heroVideoSource2;
      const blobKey = isFirst ? 'hero_video_blob' : 'hero_video_blob2';
      const storageUrlKey = isFirst ? 'prashant_hero_video_url' : 'prashant_hero_video_url2';
      const storageSourceKey = isFirst ? 'prashant_hero_video_source' : 'prashant_hero_video_source2';
      const firestoreDocId = isFirst ? 'hero_video' : 'hero_video2';

      // Clear previous object URL if it was a local blob to prevent memory leaks
      if (currentSource === 'local' && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
      await clearVideoBlob(blobKey); // Clear local uploaded blob file from IndexedDB

      // Set state and localstorage
      if (isFirst) {
        setHeroVideoUrl(url);
        setHeroVideoSource('url');
      } else {
        setHeroVideoUrl2(url);
        setHeroVideoSource2('url');
      }
      localStorage.setItem(storageUrlKey, url);
      localStorage.setItem(storageSourceKey, 'url');

      // Attempt to save in Firestore settings
      try {
        await setDoc(doc(db, 'settings', firestoreDocId), {
          url,
          updatedAt: new Date().toISOString()
        });
        return { success: true };
      } catch (firestoreError: any) {
        console.warn(`Firestore settings save failed for video ${index} (using local storage fallback):`, firestoreError);
        return { 
          success: true, 
          isLocalOnly: true,
          error: `Saved locally on this device. (Cloud sync permission restricted: ${firestoreError.message || firestoreError})`
        };
      }
    } catch (error) {
      console.error(`Failed to update hero video ${index} URL:`, error);
      return { success: false, error: String(error) };
    }
  };

  const uploadLocalVideo = async (file: File, index: 1 | 2 = 1) => {
    try {
      const isFirst = index === 1;
      const currentUrl = isFirst ? heroVideoUrl : heroVideoUrl2;
      const currentSource = isFirst ? heroVideoSource : heroVideoSource2;
      const blobKey = isFirst ? 'hero_video_blob' : 'hero_video_blob2';
      const storageUrlKey = isFirst ? 'prashant_hero_video_url' : 'prashant_hero_video_url2';
      const storageSourceKey = isFirst ? 'prashant_hero_video_source' : 'prashant_hero_video_source2';
      const firestoreDocId = isFirst ? 'hero_video' : 'hero_video2';

      // Clear previous object URL if it was a local blob to prevent memory leaks
      if (currentSource === 'local' && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }

      await saveVideoBlob(file, blobKey);
      const objectUrl = URL.createObjectURL(file);

      // Convert to Base64 to save in Firestore Database
      let base64Url = '';
      try {
        base64Url = await fileToBase64(file);
      } catch (e) {
        console.warn('Failed to convert file to base64:', e);
      }

      // Firestore max document size is 1MB. A Base64 string of length under 1,000,000 characters fits comfortably.
      const isBase64Saved = base64Url && base64Url.length < 1000000;

      if (isBase64Saved) {
        try {
          await setDoc(doc(db, 'settings', firestoreDocId), {
            url: base64Url,
            updatedAt: new Date().toISOString(),
            isBase64: true
          });

          if (isFirst) {
            setHeroVideoUrl(objectUrl);
            setHeroVideoSource('url');
          } else {
            setHeroVideoUrl2(objectUrl);
            setHeroVideoSource2('url');
          }
          localStorage.setItem(storageUrlKey, base64Url);
          localStorage.setItem(storageSourceKey, 'url');

          return { success: true };
        } catch (firestoreError: any) {
          console.warn(`Firestore settings save failed for video ${index}:`, firestoreError);
          // Fallback to local storage only
          if (isFirst) {
            setHeroVideoUrl(objectUrl);
            setHeroVideoSource('local');
          } else {
            setHeroVideoUrl2(objectUrl);
            setHeroVideoSource2('local');
          }
          localStorage.setItem(storageSourceKey, 'local');
          return {
            success: true,
            error: `Saved locally on this device. (Cloud sync permission restricted: ${firestoreError.message || firestoreError})`
          };
        }
      } else {
        // Fallback to purely local IndexedDB caching
        if (isFirst) {
          setHeroVideoUrl(objectUrl);
          setHeroVideoSource('local');
        } else {
          setHeroVideoUrl2(objectUrl);
          setHeroVideoSource2('local');
        }
        localStorage.setItem(storageSourceKey, 'local');

        let warningMsg = '';
        if (base64Url && base64Url.length >= 1000000) {
          warningMsg = 'Video is larger than 700KB. Saved to local device cache only (database has 1MB limit per document). To sync globally, please use a file under 700KB.';
        } else {
          warningMsg = 'Saved to local device cache only.';
        }

        return { 
          success: true, 
          error: warningMsg 
        };
      }
    } catch (error) {
      console.error(`Failed to upload local video ${index}:`, error);
      return { success: false, error: String(error) };
    }
  };

  const resetHeroVideo = async (index: 1 | 2 = 1) => {
    try {
      const isFirst = index === 1;
      const currentUrl = isFirst ? heroVideoUrl : heroVideoUrl2;
      const currentSource = isFirst ? heroVideoSource : heroVideoSource2;
      const blobKey = isFirst ? 'hero_video_blob' : 'hero_video_blob2';
      const storageUrlKey = isFirst ? 'prashant_hero_video_url' : 'prashant_hero_video_url2';
      const storageSourceKey = isFirst ? 'prashant_hero_video_source' : 'prashant_hero_video_source2';
      const firestoreDocId = isFirst ? 'hero_video' : 'hero_video2';

      // Clear IndexedDB
      await clearVideoBlob(blobKey);
      
      // Clear LocalStorage URL/source
      localStorage.removeItem(storageUrlKey);
      localStorage.removeItem(storageSourceKey);

      // Clear previous object URL if it was a local blob to prevent memory leaks
      if (currentSource === 'local' && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }

      const defaultUrl = 'https://assets.mixkit.co/videos/preview/mixkit-shoes-on-the-running-track-close-up-34282-large.mp4';
      const defaultUrl2 = 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-with-sneakers-in-the-street-40058-large.mp4';

      // Restore default state
      if (isFirst) {
        setHeroVideoUrl(defaultUrl);
        setHeroVideoSource('default');
      } else {
        setHeroVideoUrl2(defaultUrl2);
        setHeroVideoSource2('default');
      }

      // Restore default in Firestore settings
      try {
        await setDoc(doc(db, 'settings', firestoreDocId), {
          url: isFirst ? defaultUrl : defaultUrl2,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn(`Failed to reset setting in Firestore:`, e);
      }

      return { success: true };
    } catch (error) {
      console.error(`Failed to reset hero video ${index}:`, error);
      return { success: false, error: String(error) };
    }
  };

  const updateOffersBannerUrl = async (url: string) => {
    try {
      setOffersBannerUrl(url);
      localStorage.setItem('prashant_offers_banner_url', url);

      // Save to Firestore
      try {
        await setDoc(doc(db, 'settings', 'offers_banner'), {
          url,
          updatedAt: new Date().toISOString()
        });
        return { success: true };
      } catch (firestoreError: any) {
        console.warn('Firestore settings save failed for offers_banner (local fallback):', firestoreError);
        return {
          success: true,
          error: `Saved locally on this device. (Cloud sync restriction: ${firestoreError.message || firestoreError})`
        };
      }
    } catch (error) {
      console.error('Failed to update offers banner URL:', error);
      return { success: false, error: String(error) };
    }
  };

  const addHeroVideo = async (name: string, url: string, isBase64: boolean = false) => {
    const path = `hero_videos/new`;
    try {
      if (heroVideos.length >= 4) {
        return { 
          success: false, 
          error: "Limit reached: You can save up to 4 videos in the database. Please delete an existing video to add a new one." 
        };
      }

      const id = `video-${Date.now()}`;
      const newVideo: HeroVideo = {
        id,
        name,
        url,
        isBase64,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'hero_videos', id), newVideo);
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const deleteHeroVideo = async (id: string) => {
    const path = `hero_videos/${id}`;
    try {
      await deleteDoc(doc(db, 'hero_videos', id));
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const addHeroImage = async (name: string, url: string, isBase64: boolean = false) => {
    const path = `hero_images/new`;
    try {
      if (heroImages.length >= 4) {
        return { 
          success: false, 
          error: "Limit reached: You can save up to 4 images in the database. Please delete an existing image to add a new one." 
        };
      }

      const id = `image-${Date.now()}`;
      const newImage: HeroImage = {
        id,
        name,
        url,
        isBase64,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'hero_images', id), newImage);
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const deleteHeroImage = async (id: string) => {
    const path = `hero_images/${id}`;
    try {
      await deleteDoc(doc(db, 'hero_images', id));
      return { success: true };
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
      return { success: false, error: String(error) };
    }
  };

  const updateCategoryThumbnail = async (category: 'Men' | 'Women' | 'Kids', url: string) => {
    try {
      if (category === 'Men') {
        setCategoryThumbMen(url);
      } else if (category === 'Women') {
        setCategoryThumbWomen(url);
      } else {
        setCategoryThumbKids(url);
      }
      localStorage.setItem(`prashant_category_thumb_${category}`, url);

      try {
        await setDoc(doc(db, 'settings', `category_thumb_${category}`), {
          url,
          updatedAt: new Date().toISOString()
        });
        return { success: true };
      } catch (firestoreError: any) {
        console.warn(`Firestore settings save failed for category_thumb_${category}:`, firestoreError);
        return {
          success: true,
          error: `Saved locally on this device. (Cloud sync restriction: ${firestoreError.message || firestoreError})`
        };
      }
    } catch (error) {
      console.error(`Failed to update category thumb ${category} URL:`, error);
      return { success: false, error: String(error) };
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      orders, 
      loading, 
      heroVideoUrl, 
      heroVideoUrl2,
      heroVideoSource,
      heroVideoSource2,
      offersBannerUrl,
      heroVideos,
      heroImages,
      categoryThumbMen,
      categoryThumbWomen,
      categoryThumbKids,
      addProduct, 
      updateProduct, 
      deleteProduct, 
      createOrder, 
      updateHeroVideoUrl, 
      uploadLocalVideo,
      resetHeroVideo,
      updateOffersBannerUrl,
      updateCategoryThumbnail,
      seedProductsDatabase,
      addHeroVideo,
      deleteHeroVideo,
      addHeroImage,
      deleteHeroImage
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
