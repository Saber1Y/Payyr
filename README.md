# Payyr - USDC Automated Payroll System on ARC

A modern, automated payroll system built on the Arc Network, enabling seamless USDC payments to employees with a beautiful fintech-style interface.

## 🌟 Features

- **Modern UI**: Clean, fintech-inspired interface built with Next.js 14 and TailwindCSS
- **Employee Management**: Add, edit, and manage employee profiles with wallet addresses
- **Automated Payroll**: Schedule and execute automated USDC payments
- **Dashboard Analytics**: Real-time overview of payroll metrics and balances
- **Smart Contracts**: Solidity contracts built with Foundry for secure payments
- **Arc Network Integration**: Leveraging Arc Network for fast, low-cost transactions

## 🏗️ Project Structure

```
Arc-Project/
├── Backend/           # Foundry-based smart contracts
│   ├── src/          # Solidity contracts
│   ├── test/         # Contract tests
│   └── script/       # Deployment scripts
└── frontend/         # Next.js 14 application
    ├── app/          # App router pages
    ├── components/   # React components
    └── lib/          # Utilities
```

## 🚀 Getting Started

### Backend (Smart Contracts)

```bash
cd Backend
forge install
forge build
forge test
```

### Frontend (Web Application)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with app router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons

### Backend

- **Foundry** - Smart contract development framework
- **Solidity** - Smart contract programming language
- **Arc Network** - Layer 2 blockchain for fast, cheap transactions

## 📱 Pages & Features

- **Dashboard**: Overview of wallet balance, employee count, and payroll metrics
- **Employees**: Manage employee profiles, salaries, and payment schedules
- **Payroll**: Execute payments, view history, and manage USDC deposits
- **Settings**: Configure company details and automated payment preferences

## 🔐 Security Features

- Wallet-based authentication
- Smart contract security audits
- Multi-signature support (coming soon)
- Role-based access control

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions, please open an issue in this repository.
