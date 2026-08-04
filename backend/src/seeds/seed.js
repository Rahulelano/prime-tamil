const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('Prime@tamil$', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@primetamil.com' },
      update: {},
      create: {
        email: 'admin@primetamil.com',
        password: hashedPassword,
        name: 'Prime Tamil Admin',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('✅ Admin user created');

    // Create categories
    const categories = [
      { name: 'Local', slug: 'local', description: 'Local news and updates', color: '#D90429', icon: 'MapPin', sortOrder: 1 },
      { name: 'Education', slug: 'education', description: 'Education and school news', color: '#7C3AED', icon: 'GraduationCap', sortOrder: 2 },
      { name: 'Business', slug: 'business', description: 'Business and economic news', color: '#059669', icon: 'Briefcase', sortOrder: 3 },
      { name: 'Sports', slug: 'sports', description: 'Sports and athletic events', color: '#DC2626', icon: 'Trophy', sortOrder: 4 },
      { name: 'Real Estate', slug: 'real-estate', description: 'Real estate and property news', color: '#EA580C', icon: 'Home', sortOrder: 5 },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and entertainment news', color: '#BE185D', icon: 'Heart', sortOrder: 6 },
      { name: 'Events', slug: 'events', description: 'Community events and celebrations', color: '#0891B2', icon: 'Calendar', sortOrder: 7 },
      { name: 'Political', slug: 'political', description: 'Political news and developments', color: '#1F2937', icon: 'Users', sortOrder: 8 },
      { name: 'Devotional', slug: 'devotional', description: 'Religious and spiritual news', color: '#7C2D12', icon: 'Heart', sortOrder: 9 }
    ];

    // Delete Transport category if it exists
    await prisma.category.deleteMany({
      where: { slug: 'transport' }
    });

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      });
      createdCategories.push(created);
    }
    console.log('✅ Categories created');

    // Create authors
    const authors = [
      {
        name: 'Prime Tamil Editorial Staff',
        email: 'news@primetamil.com',
        phone: '+91 98765 43210',
        bio: 'Our dedicated team of journalists covering breaking news, investigative reports, and community developments across Tamil Nadu. We focus on delivering accurate, impactful news that matters to our readers.',
        role: 'ADMIN',
        specialties: 'Tamil Nadu News,Community Events,Politics',
        socialLinks: JSON.stringify({
          twitter: 'https://twitter.com/primetamil',
          linkedin: 'https://linkedin.com/company/primetamil'
        }),
        location: 'Chennai & Coimbatore, Tamil Nadu',
        verified: true
      },
      {
        name: 'Sports Correspondent',
        email: 'sports@primetamil.com',
        phone: '+91 98765 43211',
        bio: 'Covering sports and athletic events across Tamil Nadu and beyond. Passionate about bringing you the latest updates on cricket, football, athletics, and emerging sports across the state.',
        role: 'EDITOR',
        specialties: 'Sports,Cricket,Football,Athletics',
        socialLinks: JSON.stringify({
          twitter: 'https://twitter.com/sportsprimetamil'
        }),
        location: 'Coimbatore, Tamil Nadu',
        verified: true
      },
      {
        name: 'Business Reporter',
        email: 'business@primetamil.com',
        phone: '+91 98765 43212',
        bio: 'Reporting on business, trade, and economic developments. Specializing in industry analysis, startup coverage, and economic trends affecting Tamil Nadu and South India.',
        role: 'AUTHOR',
        specialties: 'Business,Economy,Startups,Industry',
        socialLinks: JSON.stringify({
          linkedin: 'https://linkedin.com/in/business-reporter-pt',
          website: 'https://primetamil.com/business'
        }),
        location: 'Coimbatore, Tamil Nadu',
        verified: true
      }
    ];

    const createdAuthors = [];
    for (const author of authors) {
      const created = await prisma.author.upsert({
        where: { email: author.email },
        update: {},
        create: author
      });
      createdAuthors.push(created);
    }
    console.log('✅ Authors created');

    // Create sample articles
    const sampleArticles = [
      {
        title: 'Special Pradosham Pooja Held at Dharmalingeswarar Temple',
        excerpt: 'The renowned Dharmalingeswarar Temple, located on the hill at Mathukkarai in Coimbatore, witnessed special prayers on the occasion of Pradosham on Monday.',
        content: `Coimbatore:
The renowned Dharmalingeswarar Temple, located on the hill at Mathukkarai in Coimbatore, witnessed special prayers on the occasion of Pradosham on Monday.

Special abhishekam and poojas were performed for Lord Dharmalingeswarar and Nandi. Following the rituals, the deity was adorned with special decorations and offered deepa aradhana. Devotees had darshan of the Lord in all his splendour as he bestowed blessings in an ornate attire.

A large number of devotees participated in the event and offered their prayers. The temple committee had made elaborate arrangements for the smooth conduct of the rituals and to facilitate the devotees visit.`,
        categoryId: createdCategories.find(c => c.slug === 'events').id,
        authorId: createdAuthors.find(a => a.name === 'Prime Tamil Editorial Staff').id,
        status: 'PUBLISHED',
        isFeatured: true,
        isBreaking: false,
        publishedAt: new Date('2025-11-07T10:00:00Z'),
        views: 1250,
        seoKeywords: 'temple,pradosham,pooja,dharmalingeswarar'
      },
      {
        title: 'Coimbatore Vizha to be held from November 14 to 24',
        excerpt: 'The 18th edition of Coimbatore Vizha will take place from November 14 to 24, organized by the Young Indians (Yi) Coimbatore chapter.',
        content: `Coimbatore:
The 18th edition of Coimbatore Vizha will take place from November 14 to 24, organized by the Young Indians (Yi) Coimbatore chapter. The festival will be officially launched on the evening of October 31 at Brookefields Mall.

Over 100 events are planned across 11 days, featuring the marquee Sky Dance projection mapping experience held each evening at CODISSIA Trade Fair Complex. This years Vizha emphasizes inclusivity, with business pitches by transgender entrepreneurs and para sports events for children with autism.

Events are spread across multiple neighborhoods to engage residents directly. Highlights include the Isai Mazhai music program at six venues, clean-up drives at five locations, cultural showcases at 11 sites, and the Art Street festival on Scheme Road on November 22 and 23, along with musical performances on East TV Swamy Road.

The festival aims to celebrate the spirit and diversity of Coimbatore through culture, community, and creativity.`,
        categoryId: createdCategories.find(c => c.slug === 'events').id,
        authorId: createdAuthors.find(a => a.name === 'Prime Tamil Editorial Staff').id,
        status: 'PUBLISHED',
        isFeatured: true,
        isBreaking: false,
        publishedAt: new Date('2025-11-07T09:00:00Z'),
        views: 2100,
        seoKeywords: 'coimbatore,vizha,festival,events'
      },
      {
        title: 'Coimbatore airport records 11% rise in passenger traffic',
        excerpt: 'The Coimbatore International Airport has registered an 11 percent growth in passenger traffic, handling 17.6 lakh flyers between April and September this financial year.',
        content: `Coimbatore:
The Coimbatore International Airport has registered an 11 percent growth in passenger traffic, handling 17.6 lakh flyers between April and September this financial year, according to data from the Airports Authority of India (AAI).

The airport had recorded over 30 lakh passengers in 2024, despite being designed for an annual capacity of 20 lakh. It now handles more than 30 departures a day, including domestic flights to major cities such as Chennai, Hyderabad, Mumbai, Delhi, Bengaluru, Pune, Goa, and Ahmedabad, and international services to Singapore, Abu Dhabi, and Sharjah.

The Kongu Global Forum (KGF), a consortium of business and industrial leaders from Tamil Nadus western districts, urged the authorities to draw up an interim plan to enhance the airports handling capacity. It also sought additional flights on busy domestic routes and new international services to Colombo, Bangkok, Dubai, and Doha.

Airport Director G. Sambath Kumar said that construction of a compound wall around the land recently transferred by the State government to the AAI is progressing and expected to be completed by September 2026. The wall will have a total length of about 16 kilometres.`,
        categoryId: createdCategories.find(c => c.slug === 'business').id,
        authorId: createdAuthors.find(a => a.name === 'Prime Tamil Editorial Staff').id,
        status: 'PUBLISHED',
        isFeatured: false,
        isBreaking: true,
        publishedAt: new Date('2025-11-07T08:30:00Z'),
        views: 1850,
        seoKeywords: 'airport,passenger,traffic,coimbatore'
      },
      {
        title: 'Coimbatore: The Rising Powerhouse of South India\'s Real Estate Market',
        excerpt: 'Coimbatore, long celebrated as the Manchester of South India, is now commanding fresh attention as one of the country\'s fastest-growing real estate destinations.',
        content: `Coimbatore, long celebrated as the Manchester of South India, is now commanding fresh attention as one of the country\'s fastest-growing real estate destinations. What began as a textile-driven industrial town has evolved into a diversified economic hub, home to over 25,000 manufacturing, engineering, jewellery, poultry, and IT enterprises — a transformation that is now directly translating into soaring property values.

This growth story is powered by a rare blend of industrial strength, strategic infrastructure investments, and superior liveability. Remarkably, Coimbatore continues to rank among India\'s least-polluted urban centres, offering a quality of life unmatched in most fast-growing cities.

A recent JLL study positions Coimbatore among India\'s top affordable investment markets — a compelling signal for value-seeking buyers and institutional investors alike. The impact is visible along emerging corridors and suburban belts, particularly near major highways, where land appreciation is accelerating.

Smart City Vision Converts to Real-World Value: As one of the first 20 cities chosen under India\'s Smart Cities Mission, Coimbatore has benefited from targeted upgrades across mobility, utilities, sustainability, and digital governance. These strategic investments have strengthened the city\'s reputation as a well-planned, future-ready urban centre — a key determinant for modern investors seeking long-term, stable growth markets.

Airport Expansion: A Catalyst for Capital Flows: A ₹2,000-crore expansion of Coimbatore International Airport represents a pivotal milestone in the city\'s growth trajectory. With 90% of land acquisition already complete, the expansion will unlock enhanced domestic and international connectivity, positioning Coimbatore for heightened investment inflows across sectors from global manufacturing to hospitality.

Real estate activity around the airport corridor has already begun reflecting the shift, with rising demand and price appreciation.`,
        categoryId: createdCategories.find(c => c.slug === 'real-estate').id,
        authorId: createdAuthors.find(a => a.name === 'Business Reporter').id,
        status: 'PUBLISHED',
        isFeatured: true,
        isBreaking: false,
        publishedAt: new Date('2025-11-07T04:30:00Z'),
        views: 4200,
        seoKeywords: 'real estate,coimbatore,property,investment'
      }
    ];

    for (const article of sampleArticles) {
      const slug = slugify(article.title, { lower: true, strict: true });
      await prisma.article.upsert({
        where: { slug },
        update: {},
        create: {
          ...article,
          slug
        }
      });
    }
    console.log('✅ Sample articles created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('Default admin credentials:');
    console.log('Email: admin@primetamil.com');
    console.log('Password: Prime@tamil$');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });