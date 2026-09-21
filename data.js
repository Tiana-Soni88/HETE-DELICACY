// data.js
// Central data — easy to update in one place

export const ROOMS = [
  {
    id: "deluxe",
    name: "Deluxe Room",
    price: 500,
    size: "45 m²",
    guests: 2,
    bed: "King Bed",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    features: ["City View", "Free Wi-Fi", "Breakfast Included", "Smart TV"]
  },
  {
    id: "executive",
    name: "Executive Suite",
    price: 850,
    size: "75 m²",
    guests: 3,
    bed: "King + Sofa Bed",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    features: ["Ocean View", "Lounge Area", "Spa Access", "Mini Bar"]
  },
  {
    id: "presidential",
    name: "Presidential Suite",
    price: 1500,
    size: "180 m²",
    guests: 4,
    bed: "2 King Beds",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    features: ["Private Butler", "Rooftop Terrace", "Jacuzzi", "Private Chef"]
  }
];

export const OFFERS = [
  {
    title: "Romantic Escape",
    discount: "30% OFF",
    description: "3 nights for two, includes candlelit dinner & couples spa.",
    validUntil: "December 31, 2025"
  },
  {
    title: "Business Traveler",
    discount: "20% OFF",
    description: "Complimentary airport pickup, late checkout, and meeting room.",
    validUntil: "November 30, 2025"
  },
  {
    title: "Weekend Getaway",
    discount: "25% OFF",
    description: "Friday–Sunday stays with free breakfast buffet for two.",
    validUntil: "Ongoing"
  }
];

export const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    location: "London, UK",
    text: "The most exquisite hotel experience of my life. Every detail was flawless.",
    rating: 5
  },
  {
    name: "Kenji Tanaka",
    location: "Tokyo, Japan",
    text: "Impeccable service, stunning views, and the spa is world-class.",
    rating: 5
  },
  {
    name: "Amara Okafor",
    location: "Lagos, Nigeria",
    text: "From check-in to check-out, we were treated like royalty. Worth every penny.",
    rating: 5
  }
];

export const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200"
];