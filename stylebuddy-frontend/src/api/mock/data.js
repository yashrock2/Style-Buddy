export const mockUser = {
  id: "u-001", name: "Vinayak", email: "vinayak@example.com",
  gender: "Male", bodyType: "Athletic", undertone: "Neutral",
  preferredStyles: ["Casual", "Smart Casual"], preferredColors: ["Black", "White", "Blue"],
  avoidedColors: [], favouriteOccasions: ["College", "Casual"]
};

export const mockCloset = [
  { id:"g1", name:"Oxford Blue Shirt", category:"Tops", article_type:"Shirts", color:"Blue", pattern:"Plain", fabric:"Cotton", sleeve:"Long Sleeve", neckline:"Collar", fit:"Regular", style:"Smart Casual", occasion:"Office", image:"https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=80", confidence:{category:96, article_type:94, color:91, pattern:87, fabric:95} },
  { id:"g2", name:"Relaxed Black Trousers", category:"Bottoms", article_type:"Trousers", color:"Black", pattern:"Plain", fabric:"Cotton Blend", fit:"Regular", style:"Minimal", occasion:"Office", image:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80", confidence:{category:98, article_type:93, color:97, pattern:95, fabric:88} },
  { id:"g3", name:"Cream Overshirt", category:"Tops", article_type:"Overshirts", color:"Cream", pattern:"Plain", fabric:"Cotton", sleeve:"Long Sleeve", neckline:"Collar", fit:"Relaxed", style:"Minimal", occasion:"Casual", image:"https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80", confidence:{category:95, article_type:90, color:92, pattern:89, fabric:93} },
  { id:"g4", name:"White Sneakers", category:"Footwear", article_type:"Sneakers", color:"White", pattern:"Plain", fabric:"Leather", style:"Casual", occasion:"Casual", image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", confidence:{category:99, article_type:96, color:98, pattern:94, fabric:90} },
  { id:"g5", name:"Black Polo", category:"Tops", article_type:"Polo", color:"Black", pattern:"Plain", fabric:"Cotton", sleeve:"Short Sleeve", neckline:"Polo", fit:"Regular", style:"Smart Casual", occasion:"Casual", image:"https://images.unsplash.com/photo-1625910513413-5fc45f1d8a0f?auto=format&fit=crop&w=900&q=80", confidence:{category:97, article_type:92, color:98, pattern:93, fabric:94} },
  { id:"g6", name:"Indigo Denim", category:"Bottoms", article_type:"Jeans", color:"Indigo", pattern:"Plain", fabric:"Denim", fit:"Straight", style:"Casual", occasion:"Casual", image:"https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80", confidence:{category:98, article_type:97, color:90, pattern:94, fabric:96} }
];

export const mockOutfits = [
  {id:"o1", name:"Clean Blue Monday", occasion:"College", style:"Smart Casual", score:92, image:"https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80", explanation:"Your blue shirt keeps the look polished while the relaxed denim and white sneakers keep it effortless."},
  {id:"o2", name:"Cream & Indigo", occasion:"Casual", style:"Minimal", score:89, image:"https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=80", explanation:"Soft neutrals balance the indigo base for a clean, easy weekend look."}
];

export const mockProducts = [
  {id:"p1", name:"Minimal Leather Belt", brand:"Urban Edit", article_type:"Accessory", color:"Black", price:799, match:96, platform:"Style Market", image:"https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=700&q=80"},
  {id:"p2", name:"White Textured Shirt", brand:"North Studio", article_type:"Shirts", color:"White", price:1299, match:94, platform:"Style Market", image:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80"},
  {id:"p3", name:"Classic Black Loafers", brand:"Atelier 09", article_type:"Footwear", color:"Black", price:2299, match:91, platform:"Style Market", image:"https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=700&q=80"}
];