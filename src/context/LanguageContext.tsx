import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'mr';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Simple and daily life Marathi words dictionary
const dictionary: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.collection': 'Collection',
    'nav.offers': 'Offers',
    'nav.contact': 'Contact',
    'nav.adminMode': 'Admin Mode',
    'nav.customerMode': 'Customer Mode',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.adminPanel': 'Admin Panel',

    // Hero / Storefront
    'store.title': 'PRASHANT FOOTWEAR',
    'store.subtitle': 'Premium multi-brand footwear retail store and custom workshop',
    'store.shopMen': 'Shop Men',
    'store.shopWomen': 'Shop Women',
    'store.shopKids': 'Shop Kids',
    'store.selectCategory': 'Select Category',
    'store.selectSize': 'Select Your Size',
    'store.shoes': 'Shoes',
    'store.slippers': 'Slippers',
    'store.sandals': 'Sandals',
    'store.all': 'All Products',
    'store.searchPlaceholder': 'Search by brand, style, etc...',
    'store.filters': 'Filters',
    'store.clearFilters': 'Clear Filters',
    'store.noProducts': 'No products found. Try changing filters.',
    'store.size': 'Size',
    'store.price': 'Price',
    'store.stock': 'Stock',
    'store.items': 'items',
    'store.addToCart': 'Add to Cart',
    'store.outOfStock': 'Out of Stock',
    'store.viewDetails': 'View Details',
    'store.cart': 'Cart',
    'store.yourCart': 'Your Cart',
    'store.cartEmpty': 'Your cart is empty',
    'store.subtotal': 'Subtotal',
    'store.discount': 'Discount',
    'store.checkout': 'Proceed to Checkout',
    'store.subtotalLabel': 'Subtotal Amount',

    // Auth Modal
    'auth.login': 'Log In',
    'auth.register': 'Create Account',
    'auth.mobile': 'Mobile Number',
    'auth.password': 'Password',
    'auth.enterMobile': 'Enter 10-digit mobile',
    'auth.enterPassword': 'Enter password',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.submitting': 'Processing...',
    'auth.fullName': 'Full Name',
    'auth.enterFullName': 'Enter your full name',

    // Admin Panel tabs
    'admin.billing': 'POS Billing',
    'admin.products': 'Products Stock',
    'admin.invoices': 'Invoices / Bills',
    'admin.sales': 'Sales Report',
    'admin.quickBilling': 'Make Bill',
    'admin.searchCustomer': 'Search Customer (Name or Mobile)...',
    'admin.walkIn': 'Walk-In Client',
    'admin.customerName': 'Customer Name',
    'admin.customerMobile': 'Customer Mobile',
    'admin.walkInPlaceholder': 'Walk-in client details...',
    'admin.paymentMethod': 'Payment Method',
    'admin.cash': 'Cash',
    'admin.upi': 'UPI / PhonePe / GPay',
    'admin.card': 'Card Payment',
    'admin.discountType': 'Discount Type',
    'admin.discountVal': 'Discount Value',
    'admin.subtotal': 'Subtotal',
    'admin.totalAmount': 'Final Net Total',
    'admin.issueInvoice': 'Issue & Print Invoice',
    'admin.addCustom': 'Add Custom Item',
    'admin.productSearch': 'Search Products...',
    'admin.printReceipt': 'Print Receipt',
    'admin.shareWhatsapp': 'Share on WhatsApp',
    'admin.closeReceipt': 'Close Receipt',
    'admin.receiptIssued': 'Invoice issued successfully!',
    'admin.netAmount': 'Net Amount',
    'admin.quantity': 'Qty',
    'admin.actions': 'Actions',
    'admin.add': 'Add',
    'admin.remove': 'Remove',
    'admin.editProduct': 'Edit Product',
    'admin.addNewProduct': 'Add New Product',
    'admin.productName': 'Product Name',
    'admin.category': 'Category',
    'admin.priceLabel': 'Price (₹)',
    'admin.stockLabel': 'Stock Qty',
    'admin.saveChanges': 'Save Changes',
    'admin.cancel': 'Cancel',
    'admin.totalSales': 'Total Revenue',
    'admin.totalOrders': 'Total Orders',
    'admin.discountGiven': 'Total Discount',
    'admin.salesHistory': 'Sales History',
    'admin.invoiceNo': 'Invoice No',
    'admin.date': 'Date',
    'admin.customer': 'Customer',
    'admin.amount': 'Amount',
    'admin.status': 'Status',
    'admin.actionsLabel': 'Actions',
    'admin.viewBill': 'View Bill',

    // Common
    'common.search': 'Search',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.all': 'All',
    'common.men': 'Men',
    'common.women': 'Women',
    'common.kids': 'Kids',
    'common.thankYou': 'Thank you for shopping with us! 🙏',
  },
  mr: {
    // Navbar
    'nav.home': 'मुख्य स्क्रीन',
    'nav.about': 'माहिती',
    'nav.collection': 'कलेक्शन',
    'nav.offers': 'खास ऑफर्स',
    'nav.contact': 'संपर्क',
    'nav.adminMode': 'ॲडमिन स्क्रीन',
    'nav.customerMode': 'ग्राहक स्क्रीन',
    'nav.login': 'लॉगिन करा',
    'nav.logout': 'लॉगआउट करा',
    'nav.adminPanel': 'ॲडमिन पॅनेल',

    // Hero / Storefront
    'store.title': 'प्रशांत फुटवेअर',
    'store.subtitle': 'उत्कृष्ट क्वालिटीचे चप्पल, बूट आणि स्वतः बनवलेले डिझाईन्स',
    'store.shopMen': 'पुरुषांचे कलेक्शन',
    'store.shopWomen': 'महिलांचे कलेक्शन',
    'store.shopKids': 'लहान मुलांचे कलेक्शन',
    'store.selectCategory': 'प्रकार निवडा',
    'store.selectSize': 'तुमची साईझ निवडा',
    'store.shoes': 'बूट',
    'store.slippers': 'चप्पल',
    'store.sandals': 'सँडल',
    'store.all': 'सर्व चप्पल-बूट',
    'store.searchPlaceholder': 'नाव किंवा ब्रँडने शोधा...',
    'store.filters': 'फिल्टर्स',
    'store.clearFilters': 'फिल्टर काढा',
    'store.noProducts': 'चप्पल-बूट सापडले नाहीत. फिल्टर बदला.',
    'store.size': 'साईझ',
    'store.price': 'किंमत',
    'store.stock': 'शिल्लक स्टॉक',
    'store.items': 'नग',
    'store.addToCart': 'खरेदी करा (कार्टमध्ये टाका)',
    'store.outOfStock': 'स्टॉक संपला आहे',
    'store.viewDetails': 'माहिती पहा',
    'store.cart': 'कार्ट',
    'store.yourCart': 'तुमची कार्ट (पिशवी)',
    'store.cartEmpty': 'तुमची कार्ट रिकामी आहे',
    'store.subtotal': 'एकूण किंमत',
    'store.discount': 'डिस्काउंट (सवलत)',
    'store.checkout': 'बिल बनवायला जा',
    'store.subtotalLabel': 'एकूण बिल',

    // Auth Modal
    'auth.login': 'लॉगिन करा',
    'auth.register': 'नवीन खाते बनवा',
    'auth.mobile': 'मोबाईल नंबर',
    'auth.password': 'पासवर्ड',
    'auth.enterMobile': '१० अंकी मोबाईल नंबर टाका',
    'auth.enterPassword': 'पासवर्ड टाका',
    'auth.noAccount': 'नवीन खाते बनवायचे आहे का?',
    'auth.haveAccount': 'आधीच खाते आहे का?',
    'auth.submitting': 'काम चालू आहे...',
    'auth.fullName': 'पूर्ण नाव',
    'auth.enterFullName': 'तुमचे पूर्ण नाव टाका',

    // Admin Panel tabs
    'admin.billing': 'चटकन बिल बनवा',
    'admin.products': 'स्टॉक मॅनेजर',
    'admin.invoices': 'सर्व बिलांची लिस्ट',
    'admin.sales': 'विक्रीचा रिपोर्ट',
    'admin.quickBilling': 'बिल बनवा (Make Bill)',
    'admin.searchCustomer': 'नाव किंवा मोबाईल नंबरने ग्राहक शोधा...',
    'admin.walkIn': 'थेट ग्राहक (Walk-In)',
    'admin.customerName': 'ग्राहकाचे नाव',
    'admin.customerMobile': 'ग्राहकाचा मोबाईल नंबर',
    'admin.walkInPlaceholder': 'ग्राहकाचे नाव किंवा माहिती...',
    'admin.paymentMethod': 'पैसे देण्याचा मार्ग',
    'admin.cash': 'कॅश (रोख पैसे)',
    'admin.upi': 'UPI / फोनपे / गुगलपे',
    'admin.card': 'कार्ड पेमेंट',
    'admin.discountType': 'डिस्काउंट प्रकार',
    'admin.discountVal': 'डिस्काउंट मूल्य',
    'admin.subtotal': 'एकूण',
    'admin.totalAmount': 'एकूण बिल रक्कम',
    'admin.issueInvoice': 'बिल बनवा आणि प्रिंट करा',
    'admin.addCustom': 'वेगळी वस्तू जोडा',
    'admin.productSearch': 'चप्पल-बूट शोधा...',
    'admin.printReceipt': 'बिल प्रिंट करा',
    'admin.shareWhatsapp': 'व्हॉट्सॲपवर पाठवा',
    'admin.closeReceipt': 'बिल बंद करा',
    'admin.receiptIssued': 'बिल यशस्वीरित्या तयार झाले!',
    'admin.netAmount': 'एकूण रक्कम',
    'admin.quantity': 'नग',
    'admin.actions': 'बदल करा',
    'admin.add': 'जोडा',
    'admin.remove': 'काढा',
    'admin.editProduct': 'माहिती बदला',
    'admin.addNewProduct': 'नवीन चप्पल/बूट जोडा',
    'admin.productName': 'नाव / मॉडेल',
    'admin.category': 'प्रकार',
    'admin.priceLabel': 'किंमत (₹)',
    'admin.stockLabel': 'एकूण स्टॉक',
    'admin.saveChanges': 'बदल सेव्ह करा',
    'admin.cancel': 'रद्द करा',
    'admin.totalSales': 'एकूण कमाई (गल्ला)',
    'admin.totalOrders': 'एकूण बिले',
    'admin.discountGiven': 'दिलेला डिस्काउंट',
    'admin.salesHistory': 'सर्व विक्रीचा इतिहास',
    'admin.invoiceNo': 'बिल नंबर',
    'admin.date': 'तारीख',
    'admin.customer': 'ग्राहक',
    'admin.amount': 'रक्कम',
    'admin.status': 'स्थिती',
    'admin.actionsLabel': 'पर्याय',
    'admin.viewBill': 'बिल पहा',

    // Common
    'common.search': 'शोधा',
    'common.close': 'बंद करा',
    'common.cancel': 'रद्द करा',
    'common.save': 'सेव्ह करा',
    'common.loading': 'लोड होत आहे...',
    'common.all': 'सर्व प्रकार',
    'common.men': 'पुरुषांचे',
    'common.women': 'महिलांचे',
    'common.kids': 'लहान मुलांचे',
    'common.thankYou': 'आमच्याकडून खरेदी केल्याबद्दल मनापासून धन्यवाद! 🙏',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'mr') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return dictionary[language]?.[key] || dictionary['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
