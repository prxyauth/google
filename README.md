# Google Login Clone

A high-fidelity clone of the Google login flow, built with Next.js and Tailwind CSS. This project demonstrates a multi-step authentication process including email, password, and various 2FA (Two-Factor Authentication) methods.

## 🚀 Features

- **Multi-Step Authentication**: Seamless flow from email entry to password verification and 2FA.
- **2FA Support**: Handles various challenges including authenticator apps, security codes, and mobile notifications.
- **Real-time Validation**: Client-side validation using **Zod** and **React Hook Form**.
- **State Management**: Robust data fetching and state synchronization with **TanStack Query**.
- **Responsive Design**: Fully optimized for both desktop and mobile devices using **Tailwind CSS 4**.
- **Deep Linking**: Intelligent redirection to Google mobile apps on iOS and Android.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com) & [Zod](https://zod.dev)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev)

## ⚙️ Configuration

Copy the example environment file and fill in your API credentials:

```bash
cp example.env.local .env.local
```

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_KEY` | Your project's API key. |
| `NEXT_PUBLIC_API_BASE_URL` | The base URL for the authentication API. |
| `OUTPUT_DIR` | The directory where the static build is exported (default: `out`). |

## 🛠️ Getting Started

### Installation

```bash
pnpm install
```

### Development

Run the development server on `http://localhost:3001`:

```bash
npm run dev
```

### Build & Serve

Create a production build and serve the static files:

```bash
npm run build
npm run serve
```

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: UI components, including specialized views for Email, Password, and 2FA.
- `src/lib`: Core logic, including API clients, Zod schemas, types, and utility functions.
