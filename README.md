# 🚨 Integrated Crime Intelligence System (ICIS)

## 💡 Project Overview

The **Integrated Crime Intelligence System (ICIS)** is an advanced, two-part platform developed for the Police Crime Branch. Its primary goal is to transition investigative processes from reactive data handling to **proactive, intelligence-led policing** by fusing disparate data sources and leveraging real-time AI capabilities.

The system consists of a powerful **Web Application** for deep analytical insights and a high-speed **Mobile Application** for critical field operations.

## 🎯 Key Features

### 1. Intelligence Automation & Analysis (Web App)

- **Communication Network Analysis:** Automated ingestion and parsing of Call Data Records (CDRs) to model and visualize complex criminal associations using a **Graph Database (Neo4j)**.
- **Geospatial Crime Mapping:** Fuses ANPR hit logs and CDR locations onto interactive maps for spatial analysis, hot-spot identification, and movement tracking.
- **Management Dashboards:** Centralized views for tracking officer schedules, resource allocation, and case file progress.

### 2. Real-Time Field Operations (Mobile App)

- **Mobile Vehicle Recognition (LPR):** Utilizes the mobile device camera to capture license plates and instantly cross-reference them against watch lists via a high-speed AI API.
- **Live Facial Recognition:** Secure, on-site matching of captured suspect faces against the secure criminal database.
- **Field Data Viewer:** Provides authorized officers with secure, read-only access to critical case, vehicle, and suspect profiles.

---

## 🛠️ Technology Stack

| Component          | Technology                  | Rationale                                                                                         |
| :----------------- | :-------------------------- | :------------------------------------------------------------------------------------------------ |
| **Mobile App**     | `React Native`              | Cross-platform development (iOS/Android) ensuring fast access to device camera hardware.          |
| **Web App**        | `React.js`                  | Robust framework for complex, data-heavy, and highly interactive analysis dashboards.             |
| **Backend & APIs** | `Python (FastAPI)`          | Chosen for performance, speed, and standard use in Machine Learning/AI model deployment.          |
| **Relational DB**  | `PostgreSQL` with `PostGIS` | Secure, reliable, and essential for complex structured data and geospatial queries.               |
| **Graph DB**       | `Neo4j`                     | Optimized specifically for rapid link analysis, essential for visualizing communication networks. |
| **Deployment**     | `Docker`                    | Used for containerization to ensure consistency, isolation, and simplified deployment.            |

---

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- **Node.js (LTS)**
- **Python 3.9+**
- **Docker** and **Docker Compose**

### Installation Steps

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/iSiRaH/Crimelink_Analyzer
    cd Crimelink_Analyzer
    ```

2.  **Start Database Containers:**
    Navigate to the `deployment/` directory and run the containers for PostgreSQL and Neo4j.

    ```bash
    docker-compose up -d
    ```

3.  **Setup Backend (AI Service):**

    ```bash
    cd backend/
    pip install -r requirements.txt
    python manage.py runserver
    ```

4.  **Setup Web Application:**

    ```bash
    cd web-app/
    npm install
    npm start
    ```

5.  **Setup Mobile Application:**
    See the detailed setup instructions in `mobile-app/README.md`.

---

## 📄 Project Structure & Timeline

The project was executed over a 13-week period (2025/10/22 – 2026/01/20), prioritizing foundational security and development before tackling complex AI integration.

| Phase         | Major Focus                | WBS Tasks Included                                  |
| :------------ | :------------------------- | :-------------------------------------------------- |
| **1.0 - 2.0** | **Planning & Design**      | Requirements, Architecture, ERD, API Design         |
| **3.0 - 4.0** | **Core Development**       | DB Setup, Auth, CDR Analyzer, ML Model Training     |
| **5.0**       | **Integration**            | Mobile-to-AI APIs, Maps, Network Visualization      |
| **6.0 - 7.0** | **Testing & Finalization** | Unit/System Testing (UAT), Documentation, Reporting |

---

## 🔒 Security Note

The system utilizes **OAuth 2.0** for token-based authentication and implements a strict **Role-Based Access Control (RBAC)** model. All data transmission is secured via TLS/SSL.
