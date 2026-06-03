# Attendly

**Attendly** is a robust, cross-platform mobile application designed to streamline attendance tracking and management for educational institutions, specifically built for CEK (College of Engineering Kottarakkara).

## 🚀 Features

- **Role-Based Workflows**: Tailored experiences for Students, Faculty (Teachers/Class Advisors), and Administrators (HoD/Principal).
- **Over-The-Air (OTA) Updates**: Powered by Expo EAS, updates are pushed directly to user devices in real-time, bypassing app store review processes.
- **Supabase Backend**: Fully relational PostgreSQL database integrated with Supabase Auth for fast and secure session management.
- **Real-Time Dashboards**: Beautiful, dynamic UI providing administrators with immediate insights into attendance statistics and community requests.
- **Form & Leave Management**: Integrated systems for handling duty leaves, medical leaves, and surveys securely within the platform.

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: Expo Router (File-based routing)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Styling**: Custom Design System (`src/theme.ts`) with a focus on modern, premium aesthetics.
- **CI/CD**: GitHub Actions integrated with EAS Update for automatic OTA deployments.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- Expo Go app on your physical device (or iOS/Android simulator)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/salahudheenthajudheen/attendly.git
   ```

2. Navigate to the app directory:
   ```bash
   cd attendly/app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Ensure you have a `.env` file in the `/app` directory with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. Start the development server:
   ```bash
   npx expo start
   ```

## 🔄 CI/CD Pipeline
This project is configured with a GitHub Actions workflow that automatically publishes a new Over-The-Air update to users via EAS whenever new code is merged into the `main` branch.

---
*Built with ❤️ by offen.company*
