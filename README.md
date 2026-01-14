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
- **Email Verification**: Secure 6-digit code verification sent via Resend
- **Wallet Verification**: Look up existing wallets by email address
- **Verification Certificates**: Generate shareable certificates proving wallet ownership
- **Rate Limiting**: Built-in protection against abuse with cooldown timers
- **Dark/Light Mode**: Full theme support for user preference
- **Mobile Responsive**: Works seamlessly on all devices

## 🔒 Security & Transparency

This repository is **fully open source** to ensure complete transparency. Here's what you need to know:

### Private Keys Are NEVER Stored or Transmitted

- ✅ Private keys are generated **server-side** and returned to the client **once**
- ✅ Only the **public key** is stored in the database
- ✅ The database **never stores** private keys
- ✅ All wallet generation happens in secure edge functions with cryptographic libraries

### Code You Can Audit

| Component | Location | Purpose |
|-----------|----------|---------|
| Wallet Generation | `supabase/functions/generate-wallet/` | Generates keypairs, returns private key to client only |
| Email Verification | `supabase/functions/send-verification-code/` | Sends 6-digit codes via email |
| Wallet Lookup | `supabase/functions/verify-wallet/` | Looks up public keys by email |
| Frontend Components | `src/components/` | React UI components |

### Security Measures

- **Robust Email Validation**: RFC-compliant email validation (max 254 chars, proper format)
- **Rate Limiting**: Cooldown periods prevent spam and abuse
- **Row Level Security**: Database policies protect user data
- **No Authentication Required**: Wallets are tied to verified emails, not user accounts

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (via Supabase)
- **Email**: Resend API
- **Crypto**: @solana/web3.js, tweetnacl

## 📖 How It Works

### Generating a Wallet

1. User enters their email address
2. A 6-digit verification code is sent to their email
3. User enters the code to verify ownership
4. A new Solana keypair is generated server-side
5. **Only the public key** is stored in the database
6. The private key is returned to the user **once** and never stored

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
│       ├── generate-wallet/       # Wallet generation logic
│       ├── send-verification-code/ # Email verification
│       └── verify-wallet/         # Wallet lookup
└── public/                  # Static assets
```

## 🔧 Environment Variables

The following environment variables are required:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | API key for Resend email service |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
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

### `email_verifications` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | Email being verified |
| `code` | TEXT | 6-digit verification code |
| `verified` | BOOLEAN | Verification status |
| `expires_at` | TIMESTAMP | Code expiration time |

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

- Built with [Lovable](https://lovable.dev)
- Powered by [Supabase](https://supabase.com)
- Email delivery by [Resend](https://resend.com)
- Solana libraries by [@solana/web3.js](https://github.com/solana-labs/solana-web3.js)

---

<p align="center">
  Made with ❤️ for the Solana community
</p>
