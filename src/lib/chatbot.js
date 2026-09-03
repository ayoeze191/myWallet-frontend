/**
 * The little support bot that answers questions from the home page.
 *
 * It is deliberately rules-based rather than a model call: every answer here
 * is one we can stand behind, it costs nothing per message, it replies
 * instantly, and it cannot invent a feature the app does not have. The trade
 * is that it only knows what is written below — so when nothing scores well
 * enough it says so and points at the FAQ instead of guessing.
 */

/* --------------------------------------------------------------------------
   Knowledge base

   `keywords` are what the matcher scores against — a phrase (with a space)
   counts for more than a lone word, and a word shared by many topics is worth
   proportionally less (see scoring below), so "money" barely moves the needle
   while "esusu" decides an answer on its own.
   -------------------------------------------------------------------------- */

const TOPICS = [
  {
    id: "what-is-ajo",
    label: "What is an Ajo?",
    keywords: [
      "what is ajo",
      "what is an ajo",
      "esusu",
      "susu",
      "rosca",
      "rotating savings",
      "savings circle",
      "how does ajo work",
      "explain",
      "meaning",
    ],
    answer:
      "An Ajo — also called esusu or a susu — is a savings circle. A group agrees on an amount and a rhythm, everyone pays in each round, and one member takes the whole pot each time until everybody has had a turn.\n\nOver a full cycle you put in the same as everyone else and collect once. The value is getting a lump sum earlier than you could have saved it alone.",
    related: ["get-started", "create-circle", "payout-order"],
  },
  {
    id: "get-started",
    label: "How do I get started?",
    keywords: [
      "get started",
      "sign up",
      "signup",
      "register",
      "create account",
      "open a wallet",
      "new account",
      "begin",
    ],
    answer:
      "Three steps:\n\n1. Create an account — you get a wallet in your name straight away.\n2. Fund it with a card or bank transfer.\n3. Start a circle or join one with an invite link.\n\nFrom there the rounds run on their own. Tap “Open a wallet” at the top of the page to begin.",
    related: ["fund-wallet", "create-circle", "join-circle"],
  },
  {
    id: "fund-wallet",
    label: "How do I fund my wallet?",
    keywords: [
      "fund",
      "funding",
      "top up",
      "topup",
      "deposit",
      "add money",
      "put money in",
      "paystack",
      "card",
      "bank transfer",
    ],
    answer:
      "Go to your dashboard and open the “Fund Wallet” tab. Enter an amount and you'll be handed to Paystack to pay by card or bank transfer.\n\nYour wallet is only credited once Paystack confirms the payment by webhook — not when your browser comes back — so the balance you see always reflects money that actually landed.",
    related: ["fees", "check-balance", "duplicate-charge"],
  },
  {
    id: "send-money",
    label: "How do I send money?",
    keywords: [
      "send money",
      "send",
      "transfer",
      "pay someone",
      "sending",
      "recipient",
      "to another user",
    ],
    answer:
      "Open the “Send Money” tab on your dashboard and enter the recipient's email address — not a wallet number. We look up their name so you can check it's the right person before you confirm.\n\nThe transfer is written as a matching debit and credit inside one database transaction, so it either lands on both sides or not at all.",
    related: ["check-balance", "ledger", "duplicate-charge"],
  },
  {
    id: "withdraw",
    label: "Can I withdraw to my bank?",
    keywords: [
      "withdraw",
      "withdrawal",
      "cash out",
      "cashout",
      "payout to bank",
      "take money out",
      "get my money out",
    ],
    answer:
      "Not to a bank account yet — that isn't built. What you can do today is send any amount to another user's wallet by their email address from the “Send Money” tab.\n\nMoney in your wallet stays yours; nothing leaves it except transfers you make and contributions to circles you joined.",
    related: ["send-money", "money-safety", "support"],
  },
  {
    id: "create-circle",
    label: "How do I start a circle?",
    keywords: [
      "start a circle",
      "create a circle",
      "create contribution",
      "start an ajo",
      "new circle",
      "start saving",
      "set up a group",
      "organiser",
      "creator",
    ],
    answer:
      "From “My Ajo”, create a contribution: set the amount per member, how often it runs, and how many people are in it. You get an invite link back.\n\nWhile the circle is open, members join and you arrange the payout order. On the start date membership locks and the full schedule is written out — one round per member, spaced by the rhythm you chose.",
    related: ["join-circle", "payout-order", "leave-cancel"],
  },
  {
    id: "join-circle",
    label: "How do I join a circle?",
    keywords: [
      "join",
      "joining",
      "invite",
      "invite link",
      "invitation",
      "link",
      "whatsapp",
      "someone invited me",
      "seats",
    ],
    answer:
      "Open the invite link you were sent. You can see the group's name, the amount, the rhythm and how many seats are left before you commit — you don't even need an account to look.\n\nWhen you accept, you're in until the start date; after that membership is locked so the schedule stays fair for everyone.",
    related: ["create-circle", "leave-cancel", "payout-order"],
  },
  {
    id: "payout-order",
    label: "When do I collect the pot?",
    keywords: [
      "payout order",
      "my turn",
      "whose turn",
      "when do i collect",
      "collect",
      "who goes first",
      "order",
      "rotation",
      "slot",
      "position",
    ],
    answer:
      "The creator arranges the payout order while the circle is still open, and it's visible to every member — nothing is decided behind the scenes once things are running.\n\nEach round the app debits every member and credits the pot, then pays the whole pot to whoever holds that round's slot. You pay in on your own round too; you just take the pot home the same day.",
    related: ["rounds-schedule", "missed-payment", "create-circle"],
  },
  {
    id: "rounds-schedule",
    label: "How often do rounds run?",
    keywords: [
      "how often",
      "frequency",
      "schedule",
      "due date",
      "weekly",
      "monthly",
      "rhythm",
      "when does it run",
      "automatic",
      "scheduler",
      "next round",
    ],
    answer:
      "Whatever rhythm the circle was created with — the rounds are spaced by that interval from the start date. A background sweep checks every live circle continuously, so collection and payout happen on the due date without anybody pressing anything.\n\nRounds are strictly in order: if one hasn't fully collected, the next doesn't start.",
    related: ["missed-payment", "payout-order", "ledger"],
  },
  {
    id: "missed-payment",
    label: "What if someone can't pay?",
    keywords: [
      "cant pay",
      "cannot pay",
      "miss",
      "missed",
      "missed payment",
      "default",
      "defaulter",
      "short",
      "insufficient",
      "not enough",
      "empty wallet",
      "behind",
    ],
    answer:
      "Their payment stays pending and is retried on the next sweep, and the shortfall is recorded against them where the whole circle can see it.\n\nThe round doesn't pay out until it's fully collected — so one member being short delays that round rather than shorting whoever was due to collect. Nothing is invented to cover the gap.",
    related: ["rounds-schedule", "money-safety", "leave-cancel"],
  },
  {
    id: "money-safety",
    label: "Where does my money sit?",
    keywords: [
      "safe",
      "safety",
      "secure",
      "security",
      "where does my money",
      "who holds",
      "trust",
      "trusted",
      "scam",
      "protected",
      "risk",
    ],
    answer:
      "In your own wallet, under your own account — not in one person's bank account on everyone's behalf. Money only leaves it on the due date of a circle you joined, or on a transfer you make yourself.\n\nWhich wallet a request touches is taken from your signed-in session, never from what's sent in the request, so nobody can move money out of a wallet that isn't theirs.",
    related: ["ledger", "missed-payment", "duplicate-charge"],
  },
  {
    id: "ledger",
    label: "How are balances tracked?",
    keywords: [
      "ledger",
      "double entry",
      "double-entry",
      "balance tracked",
      "accounting",
      "audit",
      "records",
      "record keeping",
      "statement",
      "how do you track",
    ],
    answer:
      "Every movement is written as a matching debit and credit in an append-only ledger — rows are never edited or deleted. Money is never created or destroyed, only moved from one wallet to another and recorded on both sides.\n\nYour balance is derived from those entries rather than typed over, so the history and the number always agree.",
    related: ["check-balance", "money-safety", "duplicate-charge"],
  },
  {
    id: "duplicate-charge",
    label: "Could I be charged twice?",
    keywords: [
      "charged twice",
      "double charge",
      "duplicate",
      "twice",
      "retry",
      "retried",
      "double tap",
      "idempotency",
      "clicked twice",
      "deducted twice",
    ],
    answer:
      "No. Every money-moving request carries an idempotency key, so a retry, a double tap or a repeated webhook settles into the transaction that already happened instead of making a new one.\n\nThe automatic rounds derive their own keys from the round itself, which is why a sweep that runs twice or resumes after a restart can't debit anyone a second time.",
    related: ["fund-wallet", "ledger", "money-safety"],
  },
  {
    id: "check-balance",
    label: "Where do I see my balance?",
    keywords: [
      "my balance",
      "check balance",
      "how much",
      "history",
      "transactions",
      "activity",
      "statement",
      "see my wallet",
    ],
    answer:
      "Your balance sits at the top of the dashboard, and the “History” tab lists every transaction against your wallet — funding, transfers, contributions and payouts.\n\nEach circle also has its own page showing the rounds, the members and where your turn falls.",
    related: ["ledger", "send-money", "fund-wallet"],
  },
  {
    id: "leave-cancel",
    label: "Can I leave a circle?",
    keywords: [
      "leave",
      "quit",
      "exit",
      "cancel",
      "drop out",
      "opt out",
      "change my mind",
      "delete circle",
      "stop contributing",
    ],
    answer:
      "Before the start date, yes — a member can leave and the creator can cancel the whole circle. Nothing has moved at that point.\n\nOnce it starts, membership is locked. The schedule depends on everyone being there, so someone leaving mid-cycle after others have already collected would leave the books short.",
    related: ["create-circle", "missed-payment", "support"],
  },
  {
    id: "fees",
    label: "What does it cost?",
    keywords: [
      "cost",
      "fee",
      "fees",
      "charge",
      "price",
      "pricing",
      "free",
      "subscription",
      "monthly fee",
      "commission",
    ],
    answer:
      "There's no monthly fee and we take no cut of the pot — the full amount collected goes to whoever's turn it is.\n\nCard and bank top-ups are processed by Paystack, so their standard processing charge applies to funding. Wallet-to-wallet transfers and contributions inside the app cost nothing.",
    related: ["fund-wallet", "send-money", "get-started"],
  },
  {
    id: "currency",
    label: "Which currency is supported?",
    keywords: [
      "currency",
      "naira",
      "ngn",
      "dollar",
      "usd",
      "pounds",
      "foreign",
      "exchange",
      "multi currency",
    ],
    answer:
      "Naira wallets, funded through Paystack. There's no currency conversion or multi-currency transfer — everything in a circle is in the same currency, which keeps the maths in the ledger exact.",
    related: ["fund-wallet", "fees", "support"],
  },
  {
    id: "account-trouble",
    label: "I can't log in",
    keywords: [
      "cant log in",
      "cannot login",
      "log in",
      "login",
      "password",
      "forgot password",
      "reset password",
      "locked out",
      "email not working",
      "sign in",
    ],
    answer:
      "Check you're using the same email you registered with — that address is also how other members send you money, so it has to match exactly.\n\nThere's no self-service password reset yet. If you're stuck, email support@ajo.app and we'll sort it out.",
    related: ["get-started", "support"],
  },
  {
    id: "support",
    label: "Talk to a human",
    keywords: [
      "human",
      "agent",
      "real person",
      "support",
      "contact",
      "customer service",
      "help me",
      "speak to someone",
      "email you",
      "complain",
    ],
    answer:
      "Happy to hand you over — email support@ajo.app and a person will pick it up.\n\nIf it's about a specific circle or transaction, mention the circle name and roughly when it happened; that's usually all we need to trace it in the ledger.",
    related: ["account-trouble", "missed-payment"],
  },
];

/* --------------------------------------------------------------------------
   Conversational odds and ends the topic list shouldn't carry
   -------------------------------------------------------------------------- */

const SMALL_TALK = [
  {
    id: "greeting",
    test: /^(hi|hey|hello|yo|good (morning|afternoon|evening)|how far|abeg|sup|hii+)\b/,
    answer: "Hi! Ask me anything about wallets, funding, or how Ajo circles work.",
  },
  {
    id: "thanks",
    test: /\b(thanks|thank you|thx|appreciate|nice one|well done|god bless)\b/,
    answer: "Anytime. Anything else you want to know?",
  },
  {
    id: "bye",
    test: /\b(bye|goodbye|see you|later|that('| i)s all|i'?m good|no thanks)\b/,
    answer: "Take care. The chat stays here if something else comes up.",
  },
  {
    id: "capability",
    test: /(what can you|who are you|are you (a )?(bot|robot|human|real)|what do you do)/,
    answer:
      "I'm a bot that knows this app — wallets, funding, transfers, and how the savings circles run. I can't see your account or move money, so for anything account-specific, email support@ajo.app.",
  },
];

/** Opening line. A signed-in member gets their first name in it. */
export function greetingFor(name) {
  const who = name ? ` ${name.trim().split(" ")[0]}` : "";
  return `Hi${who} 👋 I'm the Ajo assistant. Ask me about wallets, funding or how the circles work — or pick one of these:`;
}

/** The chips offered before the visitor has asked anything. */
export const OPENING_SUGGESTIONS = [
  "what-is-ajo",
  "get-started",
  "fund-wallet",
  "money-safety",
].map((id) => TOPICS.find((t) => t.id === id).label);

const FALLBACK =
  "I don't have a good answer for that one — I only know what's written into me, and I'd rather say so than guess.\n\nThe FAQ near the bottom of the page covers the common ground, and support@ajo.app reaches a person. In the meantime, try one of these:";

/* --------------------------------------------------------------------------
   Matching

   A keyword's worth is divided by how many topics use it, so a word that
   shows up everywhere ("money", "wallet") can't decide a match on its own
   while a distinctive one ("esusu", "idempotency") can.
   -------------------------------------------------------------------------- */

const KEYWORD_SPREAD = TOPICS.reduce((counts, topic) => {
  for (const keyword of topic.keywords) {
    counts[keyword] = (counts[keyword] || 0) + 1;
  }
  return counts;
}, {});

/** Pads with spaces so single-word lookups can't match inside a longer word. */
function normalise(text) {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function scoreTopic(topic, haystack) {
  let score = 0;
  for (const keyword of topic.keywords) {
    const words = keyword.split(" ").length;
    // Trailing "s" catches the plural of most of these without a stemmer.
    const hit =
      haystack.includes(` ${keyword} `) ||
      (words === 1 && haystack.includes(` ${keyword}s `));
    // Longer phrases are more specific, and win the ties they create:
    // "start a circle" has to beat "get started" on "how do I start a circle".
    if (hit) score += (2 * words - 1) / KEYWORD_SPREAD[keyword];
  }
  return score;
}

// Roughly "one distinctive word, or several shared ones". Below this we would
// be answering on the strength of a word like "money" alone, which is how a
// bot ends up confidently off-topic.
const CONFIDENCE_FLOOR = 0.9;

function labelsFor(ids) {
  return ids
    .map((id) => TOPICS.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => t.label);
}

/**
 * Answers one message.
 *
 * @param {string} question raw text as typed
 * @returns {{ text: string, suggestions: string[], matched: boolean, topicId: string|null }}
 */
export function answerFor(question) {
  const haystack = normalise(question);

  if (!haystack.trim()) {
    return {
      text: FALLBACK,
      suggestions: OPENING_SUGGESTIONS,
      matched: false,
      topicId: null,
    };
  }

  const ranked = TOPICS.map((topic) => ({
    topic,
    score: scoreTopic(topic, haystack),
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (best.score >= CONFIDENCE_FLOOR) {
    return {
      text: best.topic.answer,
      suggestions: labelsFor(best.topic.related),
      matched: true,
      topicId: best.topic.id,
    };
  }

  // Small talk is checked after topics on purpose: "hi, how do I fund my
  // wallet?" is a funding question, not a greeting.
  const chat = SMALL_TALK.find((s) => s.test.test(haystack.trim()));
  if (chat) {
    return {
      text: chat.answer,
      suggestions: OPENING_SUGGESTIONS,
      matched: true,
      topicId: chat.id,
    };
  }

  // Nothing landed — offer whatever came closest rather than the same four
  // openers every time, so a near miss still points somewhere useful.
  const nearest = ranked
    .filter((r) => r.score > 0)
    .slice(0, 3)
    .map((r) => r.topic.label);

  return {
    text: FALLBACK,
    suggestions: nearest.length ? nearest : OPENING_SUGGESTIONS,
    matched: false,
    topicId: null,
  };
}

/** Suggestion chips are labels, so a tap replays them as a question. */
export function answerForLabel(label) {
  const topic = TOPICS.find((t) => t.label === label);
  if (!topic) return answerFor(label);
  return {
    text: topic.answer,
    suggestions: labelsFor(topic.related),
    matched: true,
    topicId: topic.id,
  };
}
