# BCC.cash - Email to Solana Wallet Generator

<p align="center">
  <img src="public/favicon.svg" alt="BCC Logo" width="80" height="80">
</p>

<p align="center">
  <strong>Turn emails into Solana wallets. Perfect for airdrops, fundraising, and onboarding new users to Web3.</strong>
</p>

<p align="center">
  <a href="https://bcccash.lovable.app">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#security--transparency">Security</a> •
  <a href="#how-it-works">How It Works</a>
</p>

---

## 🚀 Features

- **Email-to-Wallet Generation**: Generate unique Solana wallet addresses linked to email addresses
- **Server-Side Captcha**: Cloudflare Turnstile verification prevents bot abuse
- **Wallet Verification**: Look up existing wallets by email address or public key
- **Verification Certificates**: Generate shareable certificates proving wallet ownership
- **Rate Limiting**: Built-in protection against abuse with cooldown timers
- **Dark/Light Mode**: Full theme support for user preference
- **Mobile Responsive**: Works seamlessly on all devices

## 🔒 Security & Transparency

This repository is **fully open source** to ensure complete transparency. Here's what you need to know:

### Private Keys Are NEVER Stored

- ✅ Private keys are generated **server-side** using Ed25519 cryptography
- ✅ Private keys are sent **directly to the recipient's email** and immediately discarded
- ✅ Only the **public key** is stored in the database
- ✅ The server **never logs or stores** private keys
- ✅ All wallet generation happens in secure edge functions

### Code You Can Audit

| Component | Location | Purpose |
|-----------|----------|---------|
| Wallet Generation | `supabase/functions/generate-wallet/` | Generates keypairs, sends private key via email |
| Wallet Lookup | `supabase/functions/verify-wallet/` | Looks up public keys by email |
| Frontend Components | `src/components/` | React UI components |

### Security Measures

- **Server-Side Captcha**: Cloudflare Turnstile verification on all wallet generation
- **Robust Email Validation**: RFC-compliant email validation (max 254 chars, proper format)
- **Rate Limiting**: IP-based and email-based cooldown periods prevent spam and abuse
- **Row Level Security**: Database policies block all direct public access
- **URL Validation**: Source URLs are validated to prevent XSS attacks

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (via Supabase)
- **Email**: Resend API
- **Captcha**: Cloudflare Turnstile
- **Crypto**: Ed25519 via @noble/ed25519

## 📖 How It Works

### Generating a Wallet

1. User enters the recipient's email address
2. User completes Cloudflare Turnstile captcha verification
3. Server verifies the captcha token
4. A new Solana keypair is generated using Ed25519 cryptography
5. **Only the public key** is stored in the database
6. The private key is sent via email to the recipient and **immediately discarded**

### Verifying a Wallet

1. User enters an email address
2. System looks up the associated public key
3. If found, displays the wallet address and generates a verification certificate

## 🏗️ Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── WalletGenerator.tsx    # Main wallet generation UI
│   │   ├── VerifyWallet.tsx       # Wallet lookup UI
│   │   └── ...
│   ├── pages/               # Page components
│   └── lib/                 # Utility functions
├── supabase/
│   └── functions/           # Edge functions (serverless)
│       ├── generate-wallet/       # Wallet generation + email delivery
│       └── verify-wallet/         # Wallet lookup
└── public/                  # Static assets
```

## 🔧 Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | API key for Resend email service |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## 📊 Database Schema

### `wallets` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | User's email address |
| `public_key` | TEXT | Solana public key (wallet address) |
| `confirmed` | BOOLEAN | Whether email is verified |
| `source` | TEXT | Origin of wallet creation |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Powered by [Supabase](https://supabase.com)
- Email delivery by [Resend](https://resend.com)
- Solana libraries by [@solana/web3.js](https://github.com/solana-labs/solana-web3.js)

---

<p align="center">
  Made with ❤️ for the Solana community
</p>
