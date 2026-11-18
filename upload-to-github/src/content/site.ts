// Every piece of copy for the home page lives here.

export const site = {
  name: "Ayesha Ashraf Sultana",
  brand: "Ink&Ash",
  email: "ayeshasanjeeedasana@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/ayesha-ashraf-sultana",
  instagramUrl: "https://www.instagram.com/my_harmonic_palette",
  mediumUrl: "https://medium.com/@InkAndAsh",
  resumeUrl: `${import.meta.env.BASE_URL}resume.pdf`,
  mediumBio: "Brushes, music and coffee fuel me.",
};

export const nav = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Work", id: "work" },
  { label: "Art", id: "art" },
  { label: "Music & Coffee", id: "music-coffee" },
];

export const hero = {
  line1: "Product thinking,",
  line2: "painted in colour.",
  tags: ["ISB PGP '27", "ex-Deloitte"],
};

// The lead is set in the display style; each entry in `body` is its own paragraph. No semicolons here.
export const about = {
  aside: "Hi,",
  lead: "Builder by day, painter by night.",
  body: [
    "I spent nearly four years at Deloitte turning attorneys' frustrations into working tools. Now at ISB I'm learning to ask bigger questions.",
    "Off the clock, it's moonlit canvases, Hindi film covers and trying interesting coffees.",
  ],
};

/* ---------------- work ---------------- */

// Links shown on the Selected Work puzzle and pop-ups. An empty string shows "Prototype link coming soon"
// and hides the badge on the piece; fill it in and both switch on.
export const bookingGuardPrototypeUrl = "https://booking-guardhotels.vercel.app";
export const thoucentricModelUrl = "https://nexbridge-decision-lab.vercel.app";

export type Tone = "ultramarine" | "magenta" | "purple" | "teal" | "orange" | "aurora";

export type Story = {
  id: string;
  /** name on the puzzle piece */
  short: string;
  /** heading in the story pop-up */
  title: string;
  tag: string;
  hook: string;
  tone: Tone;
  status: string;
  stats: { value: string; label: string }[];
  sections: { label: string; body: string[] }[];
};

export const stories: Story[] = [
  {
    id: "hsbc",
    short: "HSBC",
    title: "AI agents in retail banking",
    tag: "HSBC · ISB project",
    hook: "What should an AI agent be allowed to do for you?",
    tone: "ultramarine",
    status: "Ongoing",
    stats: [
      { value: "15+", label: "touchpoints mapped" },
      { value: "Visa · UPI", label: "standards benchmarked" },
    ],
    sections: [
      {
        label: "The problem",
        body: [
          "Banks expect that customers will soon let AI agents act on their behalf. The open question is how much an agent should do while the customer stays in control. That's my ongoing AI Strategy Project at ISB with HSBC: product strategy for AI agents in customer journeys across retail banking.",
        ],
      },
      {
        label: "What I noticed",
        body: [
          "We began by assuming this was an interface problem: how should a consent screen look? Mapping the loan and mutual fund investment onboarding journeys changed that. Across more than 15 touchpoints, prioritising the high-friction steps where an agent could genuinely help, the real question kept turning out to be decision rights, not screens.",
        ],
      },
      {
        label: "What I did",
        body: [
          "I grounded the agent's authority limits by benchmarking agentic payment standards, Visa and UPI, against the delegated-authority mechanisms that already exist. From there I designed a risk-tiered consent framework from the customer's side: what the agent may do on its own, what it must confirm with the customer first, and how the customer takes that authority back. The framework bounds the agent across transaction values, how long its autonomy lasts, and red-line guardrails it never crosses.",
        ],
      },
      {
        label: "What happened",
        body: [
          "The project is still ongoing, so there's no final outcome to report yet. What I have so far is a clearer way to frame the question: not \"how do we ask for consent?\" but \"what is this agent actually allowed to decide?\"",
        ],
      },
    ],
  },
  {
    id: "hul",
    short: "HUL Techtonic",
    title: "Adaptive packaging for perishables",
    tag: "HUL Techtonic",
    hook: "A pack that knows when your milk is going off.",
    tone: "magenta",
    status: "Proposal · Campus winner",
    stats: [
      { value: "1 of 105", label: "campus winner" },
      { value: "~25%", label: "less premature discard" },
      { value: "₹1.55 lakh crore", label: "food wasted in India" },
    ],
    sections: [
      {
        label: "The problem",
        body: [
          "The most advanced piece of technology in most kitchens is a nose. Someone opens the fridge, sniffs a carton and makes a guess. That guess decides whether good food gets thrown out or bad food gets drunk, and across India, food wastage adds up to ₹1.55 lakh crore.",
        ],
      },
      {
        label: "What I noticed",
        body: [
          "The date printed on your food isn't a fact about your food. It's a worst-case guess, made months earlier in a factory, about a fridge it has never seen. Most of us store things better than that guess assumes, so we bin what was perfectly fine. Some of us store things worse, and we eat what we shouldn't.",
        ],
      },
      {
        label: "What I did",
        body: [
          "For HUL Techtonic I proposed \"a pack that knows\": adaptive packaging for perishables that tracks what it has actually lived through, the time, the temperature and every swing of the fridge door through an Indian summer. A sensing layer printed into the carton, with no battery and no extra device to charge. An identity layer that already exists, because quick commerce knows who bought what and when. And a model that turns a raw temperature curve into a decision. The chemistry is the easy half; the intelligence is the innovation.",
          "Three days out, your phone says: \"480ml left, about 60 hours of real life. Enough for paneer tonight.\" It learns how fast your house drinks milk, so it reorders on the morning you'd have run out.",
        ],
      },
      {
        label: "What happened",
        body: [
          "This was a proposal, not a shipped product. On paper it cut premature food discard by about 25% and removed avoidable stock-outs through temperature tracking and automatic replenishment, and it won on campus, 1 of 105. Nobody wants a smarter fridge. People just want to stop standing at the open door, sniffing the carton and guessing.",
        ],
      },
    ],
  },
  {
    id: "thoucentric",
    short: "Thoucentric 5.0",
    title: "How bank-ERP software could scale",
    tag: "Thoucentric 5.0",
    hook: "The problem wasn't money. It was how they sold.",
    tone: "purple",
    status: "Case competition · National winner",
    stats: [
      { value: "1 of 4,000 teams", label: "national winner" },
      { value: "22.7%", label: "penetration" },
      { value: "$5.5M", label: "investment, gated" },
    ],
    sections: [
      {
        label: "The problem",
        body: [
          "A bank-connectivity product, software linking banks with ERP systems, was live at two banks and earning recurring revenue, yet it was a tiny part of the services firm that built it. The owners wanted to know whether it could change the company's value.",
        ],
      },
      {
        label: "What I noticed",
        body: [
          "At first, investment seemed the answer: fund a full product team and it would scale. Going through the case evidence closely changed that. Penetration was 22.7%, so fewer than a quarter of the customers the banks could reach had adopted it, and scalability was unproven across more than 70 ERP environments. No one was dedicated to selling the product. And one pricing proposal had made a buyer's commitment look far larger than intended.",
          "So the constraint was never the budget. It was how the firm sold and priced the product, and more investment would not have fixed that.",
        ],
      },
      {
        label: "What I did",
        body: [
          "I built a 12-factor scoring model that weighed seven scaling options, discounting each score wherever the evidence was thin. We recommended an autonomous unit to manage the product, with funding released in stages as proof arrived, so the $5.5M investment was gated on product and financial validation instead of being committed up front.",
        ],
      },
      {
        label: "What happened",
        body: [
          "We won the national competition, 1st of 4,000 teams. The lesson I kept was simple. Investing in capabilities upfront isn't the only way to solve a problem. First find where the real constraint is.",
        ],
      },
    ],
  },
  {
    id: "flow-bot",
    short: "The user-flow bot",
    title: "The GenAI user-flow bot",
    tag: "Deloitte · GenAI",
    hook: "The tool nobody asked for, but everyone needed.",
    tone: "teal",
    status: "Built and adopted at Deloitte",
    stats: [
      { value: "Top 5 of 30", label: "teams, firm-wide GenAI hackathon" },
      { value: "50+", label: "product owners adopted it" },
      { value: "90%", label: "less time creating user flows" },
    ],
    sections: [
      {
        label: "The problem",
        body: [
          "I spoke with product owners almost every other day, and somewhere in those conversations a need surfaced that they had never put into words. They spent many hours every day creating workflows and user flows manually, for every feature requirement that came in, so that engineers and QA stayed aligned.",
        ],
      },
      {
        label: "What I noticed",
        body: [
          "Nobody had asked for a tool. But the work followed a pattern, and it started from words they were already writing in their user stories and descriptions. It could be automated.",
        ],
      },
      {
        label: "What I did",
        body: [
          "Deloitte's firm-wide GenAI hackathon gave me the chance. I picked this problem and led a team of five. We built a bot that gives a usable user flow from the least possible context, and the more context a product owner adds, the better the flow gets.",
          "Because it was an AI product, leading it end to end meant solving things an ordinary feature never asks. For QA I had to define a testing scope where different responses are fine if they carry the same meaning. We needed guardrails to detect when the tool went out of bounds or took in more context than it needed. Early on, the product owners themselves judged the output, comparing it with the official sites and documents, and we gathered a lot of feedback from them, because they were the best judges of what they needed. That feedback showed us when the tool drifted, and later we automated rules that flag anything not found in the official documents or websites.",
        ],
      },
      {
        label: "What happened",
        body: [
          "Senior leadership received it very well, and we placed top 5 of 30 teams. More than 50 product owners then adopted it, and it cut user-flow creation time by 90%. Because they kept using it, it kept learning from them and got more accurate.",
        ],
      },
    ],
  },
  {
    id: "db-agent",
    short: "The database agent",
    title: "The database reconciliation agent",
    tag: "Deloitte · Agentic AI",
    hook: "The quiet agent that keeps every database honest.",
    tone: "orange",
    status: "Built and running at Deloitte",
    stats: [
      { value: "60", label: "databases kept in sync" },
      { value: "~150 hrs", label: "a year saved for tech leads and architects" },
    ],
    sections: [
      {
        label: "The problem",
        body: [
          "Tech leads and architects collected every backend change from developers regarding views, tables, columns and stored procedures, and recorded it in a master repository: a log of everything updated across the databases. There were 60 such databases.",
        ],
      },
      {
        label: "What I noticed",
        body: [
          "The manual process didn't only cost time, it also produced errors. Developers misnamed stored procedures, and leads occasionally missed an item. A log that's meant to be the source of truth was only as good as the last person who updated it.",
        ],
      },
      {
        label: "What I did",
        body: [
          "I built an agentic AI tool that keeps watching all 60 databases, even when nothing has changed, and keeps the master repository in sync with whatever does. It auto-reconciles each database against the master source, so the log reflects what actually happened rather than what someone remembered to write down.",
        ],
      },
      {
        label: "What happened",
        body: [
          "It removed the human slips, the spelling errors and missed items, and gave the team a trustworthy record of what had already been done. It saved the tech leads and architects about 150 manual hours a year. It's the kind of product nobody notices when it works, which is rather the point.",
        ],
      },
    ],
  },
  {
    id: "booking-guard",
    short: "Booking Guard",
    title: "Booking Guard",
    tag: "Booking Guard · my idea",
    hook: "Stopping no-shows without turning away good guests.",
    tone: "aurora",
    status: "Concept, not a launched product",
    stats: [
      { value: "3", label: "levels of ask, lightest first" },
      { value: "1", label: "decision always left to a person" },
    ],
    sections: [
      {
        label: "The problem",
        body: [
          "Independent hotels lose rooms to guests who book now, plan to pay at the hotel, and never show up. Front desks are left with two bad options. Ask everyone for an advance, and they lose guests they trust. Ask no one, and rooms sit empty until the last moment.",
        ],
      },
      {
        label: "What I noticed",
        body: [
          "I interviewed hotel operators about how their front desks handle this. One insight shaped the whole design: guests who book on a hotel's own website to pay later often treat that booking as a backup, so those bookings carry the highest no-show risk. The risk isn't spread evenly, so the response shouldn't be either.",
        ],
      },
      {
        label: "What I did",
        body: [
          "Booking Guard is my own idea: an AI agent that uses signals like this to choose the lightest ask for each booking. For some guests that's a reminder to confirm the visit. For others it's a small advance, or the first night's room rent.",
          "The most important design choice is what it doesn't do. The irreversible decision stays with a person: Booking Guard can recommend releasing a room, but it never releases one itself.",
        ],
      },
      {
        label: "Where it's going",
        body: [
          "Booking Guard is a concept, not a launched product. The vision is a ready-made agent any hospitality business can use, earning trust in stages: first suggesting, then acting on its own only where it has proved itself.",
        ],
      },
    ],
  },
];

export const workSummary = [
  { prefix: "", value: 350, suffix: "+", label: "attorneys served at Deloitte" },
  { prefix: "Top ", value: 5, suffix: "", label: "of 30 teams, Deloitte's GenAI hackathon" },
  { prefix: "1st of ", value: 105, suffix: "", label: "HUL Techtonic" },
  { prefix: "1st of ", value: 4000, suffix: "", label: "teams · Thoucentric 5.0" },
];

/* ---------------- music ---------------- */

export const music = {
  lead: "I post vocal covers on Instagram as My Harmonic Palette, mostly Hindi film songs. Press play on the record for a short one.",
};

// Replace the file at this path, then update the title and credit here.
// The turntable, the now-playing pill and the credit line all read from this object;
// leave a field empty ("") and it drops out of the credit line.
export const coverClip = {
  src: `${import.meta.env.BASE_URL}audio/cover-clip.mp4`,
  title: "Zara Zara",
  original: "Bombay Jayashri",
  film: "Rehna Hai Tere Dil Mein",
};

/** "<title> · cover by Ayesha · original by <original> (<film>)", leaving out any empty part. */
export function clipCredit(c = coverClip) {
  const original = [c.original && `original by ${c.original}`, c.film && `(${c.film})`].filter(Boolean).join(" ");
  return [c.title, "cover by Ayesha", original].filter(Boolean).join(" · ");
}

// The five covers, in order. Each card links straight to the reel. `cover` picks the illustrated cover art
// (CoverArt.tsx); `short` is the credit line on the card, `credit` the full one (tooltip + screen readers).
export const reels = [
  { id: "Dal1e4KT-_T", song: "Tere Paas Main", credit: "From Main Vaapas Aaunga (Imtiaz Ali); music A. R. Rahman, lyrics Irshad Kamil; sung by Deepali Sahay and Vipin Aneja", cover: "headphones", short: "A. R. Rahman · Main Vaapas Aaunga" },
  { id: "DOWl84jEyw7", song: "Tere Bina", credit: "Chinmayi Sripada, A. R. Rahman", cover: "microphone", short: "Chinmayi Sripada · A. R. Rahman" },
  { id: "DNgFTIopnfw", song: "Ye Raate Ye Mausam", credit: "Kishore Kumar and Asha Bhosle (Dilli Ka Thug), recreated by SANAM", cover: "cassette", short: "Kishore Kumar & Asha Bhosle · SANAM version" },
  { id: "DLszr_kTtrU", song: "Agar Tum Saath Ho", credit: "Alka Yagnik and Arijit Singh; music A. R. Rahman", cover: "piano", short: "Alka Yagnik & Arijit Singh" },
  { id: "DJmoCIpzTj5", song: "Abhi Na Jao Chhod Kar", credit: "Asha Bhosle and Mohammed Rafi", cover: "gramophone", short: "Asha Bhosle & Mohammed Rafi" },
];

export const reelUrl = (id: string) => `https://www.instagram.com/reel/${id}/`;

/* ---------------- coffee ---------------- */

// The three brew methods on the shelf, in order. Titles only; the icons live in BrewIcons.tsx.
export const brewShelf = [
  { id: "filter", name: "South Indian filter coffee" },
  { id: "moka", name: "Moka pot" },
  { id: "aeropress", name: "AeroPress" },
] as const;

export const coffeeStory =
  "It started with a coffee omakase at Roast CCX in Hyderabad: a tasting flight where every course, from a coffee cherry cold brew to a deconstructed Vietnamese salt coffee, arrived with its own tasting notes and pairing. That flight got me properly hooked on brewing and tasting. Since then I've tasted as many beans as I can and gone looking for the quirky ones, well beyond the usual cold coffee. At home it's South Indian filter coffee, a moka pot, and sometimes an AeroPress.";

export type OmakaseEntry = {
  venue: string;
  city: string;
  course: string;
  name: string;
  notes: string;
  pairing: string;
  /** file name in images/omakase/ (processed into public/omakase/ by `npm run omakase`) */
  image: string;
  published: boolean;
};

// Add or edit omakase cards here.
// Only entries with `published: true` are shown, in course order.
export const omakaseEntries: OmakaseEntry[] = [
  { venue: "Roast CCX", city: "Hyderabad", course: "01", name: "Coffee Cherry & Raspberry Cold Brew", notes: "Cranberry, Raspberry, Hibiscus", pairing: "Burrata and Grape", image: "omakase-01-coffee-cherry-raspberry-cold-brew.jpg", published: true },
  { venue: "Roast CCX", city: "Hyderabad", course: "02", name: "Green Coffee Lemonade", notes: "Herbal, Light Vegetal with Hints of Citrus Zest", pairing: "Labneh and Potato Cracker", image: "omakase-02-green-coffee-lemonade.jpg", published: true },
  { venue: "Roast CCX", city: "Hyderabad", course: "06", name: "Deconstructed Vietnamese Salt Coffee", notes: "Bitter Sweet Symphony, Salted Caramel Dark Coco, Toasted Sesame", pairing: "Choux", image: "omakase-06-deconstructed-vietnamese-salt-coffee.jpg", published: true },
  { venue: "Roast CCX", city: "Hyderabad", course: "04", name: "Espresso Based Milk Beverage", notes: "Milk Chocolate, Caramel, Salted Butter Cookies", pairing: "Corn Tart", image: "omakase-04-espresso-based-milk-beverage.jpg", published: true },
];

export const footer = {
  signoff: "with ink & a little ash,",
  name: "Ayesha",
};
