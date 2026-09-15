import { Link } from "react-router-dom";
import {
  UsersIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
  ShieldCheckIcon,
  RepeatIcon,
  LinkIcon,
  CreditCardIcon,
  BookOpenIcon,
  BellIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  LockIcon,
  ZapIcon,
} from "lucide-react";
import ChatWidget from "../components/ChatWidget";

const FEATURES = [
  {
    icon: BookOpenIcon,
    title: "Double-entry ledger",
    body: "Every naira that moves is written as a matching debit and credit. Balances are derived from entries, never edited in place.",
  },
  {
    icon: RepeatIcon,
    title: "Rounds that run themselves",
    body: "A scheduler collects from each member on the due date and pays the whole pot to whoever's turn it is. No chasing, no spreadsheets.",
  },
  {
    icon: LinkIcon,
    title: "Invite by link",
    body: "Share one link on WhatsApp. Anyone can open it and see the amount, the schedule and the seats left before they commit.",
  },
  {
    icon: CreditCardIcon,
    title: "Funded with Paystack",
    body: "Top up with a card or bank transfer. Payments are confirmed by webhook, so a wallet only moves once the money is real.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Idempotent by design",
    body: "Retries, double taps and duplicate webhooks resolve to the same transaction. One charge means one entry, always.",
  },
  {
    icon: BellIcon,
    title: "Missed payments in the open",
    body: "If a member's wallet comes up short, the round records it against them. Everyone in the circle can see where things stand.",
  },
];

const STEPS = [
  {
    no: "Step 01",
    title: "Open a wallet",
    body: "Sign up and get a wallet in your name. Fund it with a card or a transfer whenever you like.",
  },
  {
    no: "Step 02",
    title: "Start or join a circle",
    body: "Set the amount, how often it runs and how many people are in. Share the invite link and fill the seats.",
  },
  {
    no: "Step 03",
    title: "Collect on your turn",
    body: "Each due date the contribution leaves every wallet and the full pot lands in one. Then the order moves on.",
  },
];

const GUARANTEES = [
  {
    figure: "2×",
    title: "Entries per movement",
    body: "Money is never created or destroyed in the ledger — it moves from one wallet to another, recorded on both sides.",
  },
  {
    figure: "0",
    title: "Duplicate charges",
    body: "Every write carries an idempotency key, so a retried request settles into the transaction that already happened.",
  },
  {
    figure: "24/7",
    title: "Automated rounds",
    body: "Collection and payout run on a schedule against the database, not on somebody remembering to send a reminder.",
  },
];

const COMPARISON = [
  ["Who holds the money", "One person's account", "Each member's own wallet"],
  [
    "Record of contributions",
    "A notebook or group chat",
    "An append-only ledger",
  ],
  [
    "Collecting on the due date",
    "Chase everybody manually",
    "Debited automatically",
  ],
  ["Payout order", "Argued over", "Fixed, visible to all members"],
  [
    "Missed a payment?",
    "Someone has to raise it",
    "Recorded against the round",
  ],
];

const FAQS = [
  {
    q: "What exactly is an Ajo?",
    a: "A rotating savings circle — known as ajo, esusu or a susu depending on where you are. A group agrees on an amount and a schedule, everyone contributes each round, and one member collects the whole pot each time until everybody has had a turn.",
  },
  {
    q: "Where does my money sit?",
    a: "In your own wallet, under your own account. Contributions only leave it on the due date of a circle you joined, and the payout goes straight into the recipient's wallet.",
  },
  {
    q: "What happens if someone cannot pay?",
    a: "The round records the shortfall against that member instead of silently skipping it. The circle can see who is behind and by how much before deciding what to do.",
  },
  {
    q: "How do I put money in and take it out?",
    a: "Funding runs through Paystack — card or bank transfer — and is only credited once the payment webhook confirms it. You can also send money to any other wallet by email address.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="container landing-nav-inner">
          <Link to="/" className="brand-lockup">
            <span className="brand-mark">
              <UsersIcon size={19} />
            </span>
            <span className="brand-word">
              Ajo<span>.</span>
            </span>
          </Link>

          <nav className="landing-links">
            <a href="#how">How it works</a>
            <a href="#features">Product</a>
            <a href="#trust">Trust</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="nav-login">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-badge">
              <b>New</b> Ajo circles now run on their own
            </span>

            <h1>
              Save together.
              <br />
              Collect <em>in turn.</em>
            </h1>

            <p className="hero-sub">
              The savings circle your family has always run, on a real ledger.
              Everyone contributes on the same day, one person takes the pot,
              and every kobo is accounted for on both sides.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Open a wallet
                <ArrowRightIcon size={18} />
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                I already have one
              </Link>
            </div>

            <div className="hero-notes">
              <span className="hero-note">
                <CheckIcon size={16} /> No monthly fee
              </span>
              <span className="hero-note">
                <CheckIcon size={16} /> Funded with Paystack
              </span>
              <span className="hero-note">
                <CheckIcon size={16} /> Naira wallets
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="wallet-card">
              <div className="wallet-card-top">
                <span className="wallet-card-label">Wallet balance</span>
                <span className="wallet-card-chip">NGN</span>
              </div>
              <div className="wallet-card-amount">₦248,500.00</div>
              <p className="wallet-card-caption">
                Available now · 2 circles running
              </p>

              <div className="wallet-card-rows">
                <div className="wallet-card-row">
                  <span className="wallet-row-dot">
                    <ArrowDownLeftIcon size={15} />
                  </span>
                  <span className="wallet-row-body">
                    <span className="wallet-row-title">Payout — Round 3</span>
                    <span className="wallet-row-meta">
                      Lagos Traders Circle
                    </span>
                  </span>
                  <span className="wallet-row-amount">+₦180,000.00</span>
                </div>
                <div className="wallet-card-row">
                  <span className="wallet-row-dot">
                    <ArrowUpRightIcon size={15} />
                  </span>
                  <span className="wallet-row-body">
                    <span className="wallet-row-title">Contribution</span>
                    <span className="wallet-row-meta">
                      Monthly · auto-debit
                    </span>
                  </span>
                  <span className="wallet-row-amount out">−₦20,000.00</span>
                </div>
                <div className="wallet-card-row">
                  <span className="wallet-row-dot">
                    <CreditCardIcon size={15} />
                  </span>
                  <span className="wallet-row-body">
                    <span className="wallet-row-title">Wallet top-up</span>
                    <span className="wallet-row-meta">
                      Paystack · confirmed
                    </span>
                  </span>
                  <span className="wallet-row-amount">+₦50,000.00</span>
                </div>
              </div>
            </div>

            <div className="rounds-card">
              <div className="rounds-card-head">
                <h4>Lagos Traders Circle</h4>
                <span>9 members</span>
              </div>
              <div className="rounds-track">
                <span className="rounds-step done" />
                <span className="rounds-step done" />
                <span className="rounds-step done" />
                <span className="rounds-step live" />
                <span className="rounds-step" />
                <span className="rounds-step" />
                <span className="rounds-step" />
                <span className="rounds-step" />
                <span className="rounds-step" />
              </div>
              <div className="rounds-legend">
                <span>
                  Round <b>4 of 9</b> collecting
                </span>
                <span>
                  Pot <b>₦180,000</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <div className="strip">
        <div className="container strip-inner">
          <span className="strip-label">Built on</span>
          <span className="strip-item">
            <BookOpenIcon size={18} /> Double-entry
          </span>
          <span className="strip-item">
            <CreditCardIcon size={18} /> Paystack
          </span>
          <span className="strip-item">
            <LockIcon size={18} /> Idempotent writes
          </span>
          <span className="strip-item">
            <ZapIcon size={18} /> Scheduled rounds
          </span>
        </div>
      </div>

      {}
      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2 className="section-title">
              Three steps from group chat to a running circle.
            </h2>
            <p className="section-sub">
              Ajo keeps the part that works — people saving together — and takes
              away the part that does not: collecting, tracking and trusting a
              notebook.
            </p>
          </div>

          <div className="steps plus-frame">
            {STEPS.map((s) => (
              <article className="step" key={s.no}>
                <span className="step-no">{s.no}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="section section-alt" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The product</span>
            <h2 className="section-title">
              A wallet, a ledger and a scheduler that agree with each other.
            </h2>
            <p className="section-sub">
              Everything a savings circle needs to run without anyone holding
              the money on everybody else's behalf.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article className="feature" key={f.title}>
                <span className="feature-icon">
                  <f.icon size={21} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="band" id="trust">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Under the hood</span>
            <h2 className="section-title">
              The books balance, or the transaction does not happen.
            </h2>
            <p className="section-sub">
              Contributions and payouts are written inside a database
              transaction. Either both sides land, or neither does.
            </p>
          </div>

          <div className="band-grid">
            {GUARANTEES.map((g) => (
              <div className="band-cell" key={g.title}>
                <div className="band-figure">{g.figure}</div>
                <h3>{g.title}</h3>
                <p>{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="section">
        <div className="container">
          <div className="section-head section-head-center">
            <span className="eyebrow">The difference</span>
            <h2 className="section-title">
              Running an ajo, with and without us.
            </h2>
          </div>

          <div className="compare">
            <div className="compare-row compare-head">
              <div className="compare-cell" />
              <div className="compare-cell">The old way</div>
              <div className="compare-cell win">On Ajo</div>
            </div>
            {COMPARISON.map(([label, oldWay, newWay]) => (
              <div className="compare-row" key={label}>
                <div className="compare-cell compare-label">{label}</div>
                <div className="compare-cell lose">
                  <XIcon size={16} />
                  {oldWay}
                </div>
                <div className="compare-cell win">
                  <CheckIcon size={16} />
                  {newWay}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-head section-head-center">
            <span className="eyebrow">Questions</span>
            <h2 className="section-title">Before you put money in.</h2>
          </div>

          <div className="faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="cta">
        <div className="container">
          <div className="cta-panel">
            <span className="eyebrow">Get started</span>
            <h2>Your circle is one link away.</h2>
            <p>
              Open a wallet, start a circle and send the invite. The first
              contribution can go out on your next payday.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-light btn-lg">
                Open a wallet
                <ArrowRightIcon size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <Link to="/" className="brand-lockup">
                <span className="brand-mark">
                  <UsersIcon size={19} />
                </span>
                <span className="brand-word">
                  Ajo<span>.</span>
                </span>
              </Link>
              <p>
                Rotating savings circles on a double-entry ledger. Built for the
                way people already save together.
              </p>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#how">How it works</a>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#trust">Under the hood</a>
                </li>
                <li>
                  <Link to="/register">Open a wallet</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li>
                  <Link to="/login">Log in</Link>
                </li>
                <li>
                  <Link to="/register">Create account</Link>
                </li>
                <li>
                  <Link to="/contributions">My Ajo</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <a href="mailto:support@ajo.app">support@ajo.app</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-base">
            <span>© {new Date().getFullYear()} Ajo. All rights reserved.</span>
            <span>Payments processed by Paystack.</span>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
