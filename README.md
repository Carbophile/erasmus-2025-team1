# Erasmus 2025 Team 1: QuizBattle

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project was created as part of the joint Erasmus+ program between the School of Design, Graphics and Sustainable Construction from Croatia and Deltion College from the Netherlands. The project was developed by a team of students from both institutions, aiming to create an engaging quiz application about both countries.

**Team Lead:** Borna Punda ([@Carbophile](https://github.com/Carbophile)) - School of Design, Graphics and Sustainable Construction

## Stack
| **Frontend** 	 | **Backend** 	 | **Database**           	 | **Deployment**     	 |
|----------------|---------------|--------------------------|----------------------|
| Native       	 | Node.js     	 | Cloudflare D1 (SQLite) 	 | Cloudflare Workers 	 |

## Running the project locally
1. Clone the repository:
   ```bash
   git clone https://github.com/Carbophile/erasmus-2025-team1.git
   cd erasmus-2025-team1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
4. Provision the local database:
   ```bash
   npx wrangler d1 execute --local main_db --file ./scheme.db
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
