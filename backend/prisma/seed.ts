import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Menu matches the CityScape "Legacy Lounge & Bar" theme:
// signature cocktails, rooftop-friendly bar bites, and mains.
const MENU_ITEMS: Array<{
  name: string;
  description: string;
  ingredients: string;
  price: number;
  isAvailable?: boolean;
}> = [
  // Signature Cocktails
  {
    name: 'Skyline Old Fashioned',
    description: 'A rooftop twist on the classic, slow-stirred and smoked tableside.',
    ingredients: 'Bourbon, demerara syrup, aromatic bitters, orange peel',
    price: 650,
  },
  {
    name: 'New Baneswor Sour',
    description: 'Bright, tart, and finished with a silky egg-white foam.',
    ingredients: 'Whiskey, fresh lime juice, simple syrup, egg white, bitters',
    price: 600,
  },
  {
    name: 'Rooftop Spritz',
    description: 'Light, bubbly, and built for golden-hour views.',
    ingredients: 'Prosecco, aperitivo, soda water, orange slice',
    price: 550,
  },
  {
    name: 'Legacy Mule',
    description: 'Sharp ginger heat with a citrus finish, served in a copper mug.',
    ingredients: 'Vodka, ginger beer, fresh lime juice, mint',
    price: 575,
  },

  // Bar Bites
  {
    name: 'Truffle Fries',
    description: 'Crisp fries tossed in truffle oil and parmesan.',
    ingredients: 'Potato, truffle oil, parmesan, parsley',
    price: 450,
  },
  {
    name: 'Chicken Sekuwa Skewers',
    description: 'Smoky grilled chicken skewers with a house dipping sauce.',
    ingredients: 'Chicken thigh, Nepali spice marinade, timur, mint chutney',
    price: 550,
  },
  {
    name: 'Loaded Nachos',
    description: 'Tortilla chips piled with cheese, jalapeños, and salsa.',
    ingredients: 'Corn tortilla chips, cheddar, jalapeño, salsa, sour cream',
    price: 500,
  },
  {
    name: 'Momo Platter (Chicken)',
    description: 'Steamed dumplings served with classic tomato achar.',
    ingredients: 'Chicken mince, flour dough, onion, garlic, tomato achar',
    price: 480,
  },

  // Mains
  {
    name: 'Grilled Chicken Steak',
    description: 'Herb-marinated chicken breast with roasted vegetables.',
    ingredients: 'Chicken breast, seasonal vegetables, herb butter, pepper sauce',
    price: 850,
  },
  {
    name: 'Wood-Fired Margherita Pizza',
    description: 'Classic Neapolitan-style pizza with fresh basil.',
    ingredients: 'Pizza dough, San Marzano tomato, mozzarella, basil, olive oil',
    price: 700,
  },
  {
    name: 'Cityscape Burger',
    description: 'Smash burger with cheddar and house sauce, served with fries.',
    ingredients: 'Beef patty, cheddar, lettuce, tomato, brioche bun, house sauce',
    price: 650,
  },

  // Desserts
  {
    name: 'Molten Chocolate Cake',
    description: 'Warm chocolate cake with a gooey center, served with ice cream.',
    ingredients: 'Dark chocolate, butter, eggs, flour, vanilla ice cream',
    price: 400,
  },

  // Non-Alcoholic
  {
    name: 'Virgin Mojito',
    description: 'Refreshing mint and lime, no alcohol.',
    ingredients: 'Soda water, mint leaves, fresh lime juice, sugar syrup',
    price: 350,
  },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst();

  if (!restaurant) {
    throw new Error(
      'No restaurant found. Run the app once (or your existing restaurant setup step) before seeding menu items.',
    );
  }

  console.log(`Seeding menu items for restaurant: ${restaurant.name} (${restaurant.id})`);

  let created = 0;
  let skipped = 0;

  for (const item of MENU_ITEMS) {
    const existing = await prisma.menuItem.findFirst({
      where: { restaurantId: restaurant.id, name: item.name },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.menuItem.create({
      data: {
        ...item,
        isAvailable: item.isAvailable ?? true,
        restaurantId: restaurant.id,
      },
    });
    created++;
  }

  console.log(`Done. Created ${created} new item(s), skipped ${skipped} already-existing item(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
