// ─── Menu Items ───────────────────────────────────────────────────────────────
export const menuCategories = ["All", "Mezzban", "Bhuna", "Bhorta", "Sides", "Drinks", "Mishti"] as const;

export const menuItems = [
  { id: "1", name: "Mezzban Beef Bhuna", category: "Mezzban", price: 320, rating: 5.0, reviews: 512, badge: "Signature", description: "The legendary Chittagong feast dish — slow-cooked beef in a rich, smoky gravy with dried chilies and whole spices.", image: "/images/menu/mezzban-bhuna.jpg", isVeg: false, isSpicy: true },
  { id: "2", name: "CTG Style Shutki Bhorta", category: "Bhorta", price: 180, rating: 4.8, reviews: 334, badge: "CTG Special", description: "Dried fish mashed with mustard oil, green chili, and raw onion. The real taste of Chittagong.", image: "/images/menu/shutki-bhorta.jpg", isVeg: false, isSpicy: true },
  { id: "3", name: "Mezbani Dal", category: "Mezzban", price: 120, rating: 4.9, reviews: 289, badge: "Best Seller", description: "The iconic lentil soup served at every Chittagong feast — thin, spiced, deeply comforting.", image: "/images/menu/mezbani-dal.jpg", isVeg: true, isSpicy: false },
  { id: "4", name: "Kala Bhuna", category: "Bhuna", price: 380, rating: 5.0, reviews: 401, badge: "Fan Fav", description: "The darkest, richest beef bhuna in Bangladesh. Hours of slow cooking gives this its legendary black colour.", image: "/images/menu/kala-bhuna.jpg", isVeg: false, isSpicy: true },
  { id: "5", name: "Aloo Bhorta", category: "Bhorta", price: 80, rating: 4.6, reviews: 178, badge: null, description: "Mashed potato with mustard oil, dried chili, and fresh coriander. Simple and perfect.", image: "/images/menu/aloo-bhorta.jpg", isVeg: true, isSpicy: false },
  { id: "6", name: "Ilish Paturi", category: "Sides", price: 450, rating: 4.9, reviews: 223, badge: "Seasonal", description: "Hilsha fish wrapped in banana leaf and steamed with mustard paste and green chili.", image: "/images/menu/ilish-paturi.jpg", isVeg: false, isSpicy: false },
  { id: "7", name: "Borhani", category: "Drinks", price: 60, rating: 4.9, reviews: 667, badge: "Popular", description: "The classic Chittagong spiced yogurt drink — minty, tangy, and essential alongside any heavy meal.", image: "/images/menu/borhani.jpg", isVeg: true, isSpicy: false },
  { id: "8", name: "Mishti Doi", category: "Mishti", price: 90, rating: 4.9, reviews: 345, badge: "New", description: "Creamy set yogurt sweetened with date molasses. The perfect ending to a Chittagong feast.", image: "/images/menu/mishti-doi.jpg", isVeg: true, isSpicy: false },
];

// ─── Recipes ──────────────────────────────────────────────────────────────────
export const recipes = [
  { id: "1", title: "Authentic Kala Bhuna", slug: "kala-bhuna", time: "3 hrs", difficulty: "Hard", servings: 6, category: "Bhuna", image: "/images/recipes/kala-bhuna.jpg", excerpt: "The crown jewel of Chittagong cooking. Low heat, patience, and the right spices is all it takes.", ingredients: ["1kg beef (bone-in)", "4 tbsp mustard oil", "2 cups fried onion", "2 tbsp ginger paste", "1 tbsp garlic paste", "3 tsp red chili powder", "1 tsp cumin", "Whole spices (bay, cardamom, cinnamon)", "Salt to taste"], steps: ["Marinate beef with ginger, garlic, and all spices for 1 hour.", "Heat mustard oil in a heavy pot, fry onions golden.", "Add beef and cook on high heat for 10 minutes.", "Reduce to lowest heat, cover and cook 2–2.5 hrs stirring occasionally.", "Increase heat at the end until gravy turns dark and thick."] },
  { id: "2", title: "Mezbani Dal", slug: "mezbani-dal", time: "40 min", difficulty: "Easy", servings: 8, category: "Mezzban", image: "/images/recipes/mezbani-dal.jpg", excerpt: "The soup that ties every Chittagong feast together. Thin, light, and loaded with warmth.", ingredients: ["300g masoor dal", "1 tsp turmeric", "3 dried red chilies", "2 tbsp mustard oil", "1 tsp panch phoron", "4 cloves garlic", "Salt"], steps: ["Boil dal with turmeric and salt until completely soft.", "Blend or whisk until smooth and thin.", "Heat mustard oil, fry garlic and dried chilies.", "Pour tadka over dal, stir well and serve."] },
  { id: "3", title: "Shutki Bhorta", slug: "shutki-bhorta", time: "30 min", difficulty: "Medium", servings: 4, category: "Bhorta", image: "/images/recipes/shutki-bhorta.jpg", excerpt: "The most polarising dish in Bangladesh — and the most beloved in Chittagong. Bold, funky, unforgettable.", ingredients: ["150g dried fish (shutki)", "3 tbsp mustard oil", "4 green chilies", "1 medium onion (raw)", "1 tsp turmeric", "Salt", "Fresh coriander"], steps: ["Wash and soak shutki in hot water for 20 min.", "Fry in mustard oil with turmeric until crispy.", "Cool and flake finely.", "Mix with raw onion, green chili, mustard oil, and salt by hand.", "Garnish with coriander and serve with hot rice."] },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const testimonials = [
  { id: "1", name: "Sarah M.", location: "New York", rating: 5, text: "The Kala Bhuna here ruined me for every other beef dish. That dark, smoky gravy — absolutely divine.", avatar: "/images/avatars/sarah.jpg" },
  { id: "2", name: "James L.", location: "London", rating: 5, text: "Flew in for a conference, stumbled onto CTG Bites. Best meal of the trip, no contest.", avatar: "/images/avatars/james.jpg" },
  { id: "3", name: "Priya K.", location: "Toronto", rating: 5, text: "The Shutki Bhorta is a revelation. I've brought every visitor I've had to Chittagong here.", avatar: "/images/avatars/priya.jpg" },
  { id: "4", name: "Tomás R.", location: "Barcelona", rating: 4, text: "Perfect atmosphere, bold flavors. The Borhani alongside the Mezzban set is absolutely addictive.", avatar: "/images/avatars/tomas.jpg" },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
export const stats = [
  { label: "CTG recipes", value: "60+" },
  { label: "Happy diners", value: "18K+" },
  { label: "Years of craft", value: "10" },
  { label: "Award wins", value: "7" },
];

// ─── Team ─────────────────────────────────────────────────────────────────────
export const team = [
  { id: "1", name: "Chef Alamgir H.", role: "Head Chef & Founder", bio: "Born in Chittagong, trained in the kitchens of old Agrabad. Alamgir has been perfecting kala bhuna for 25 years.", image: "/images/team/chef-alamgir.jpg" },
  { id: "2", name: "Roksana B.", role: "Bhorta & Traditional Specialist", bio: "Roksana's shutki bhorta and mezbani dal recipes are the soul of CTG Bites — passed down from her grandmother.", image: "/images/team/roksana.jpg" },
];

// ─── Floating ingredient images for hero ──────────────────────────────────────
export const floatingIngredients = [
  { src: "/images/ingredients/spices-bowl.png", alt: "Spices", className: "top-16 left-4 w-28 md:w-36", delay: 0, animationClass: "animate-float-slow" },
  { src: "/images/ingredients/chopsticks.png", alt: "Chopsticks", className: "top-8 left-20 w-20 md:w-28", delay: 0.5, animationClass: "animate-float-medium" },
  { src: "/images/ingredients/tomato-herb.png", alt: "Tomato with herbs", className: "top-12 right-4 w-24 md:w-32", delay: 0.3, animationClass: "animate-float-slow" },
  { src: "/images/ingredients/pepper-scatter.png", alt: "Black pepper", className: "bottom-32 left-1/4 w-16", delay: 0.8, animationClass: "animate-float-medium" },
  { src: "/images/ingredients/basil-bowl.png", alt: "Basil with sauce", className: "bottom-16 right-1/4 w-20 md:w-24", delay: 0.2, animationClass: "animate-float-slow" },
];
