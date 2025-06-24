# 🚖 Cab Booking App

A responsive single-page React application that allows users to book cabs between predefined locations. Built with Firebase Realtime Database for backend storage and EmailJS for sending email confirmations.

## 🔧 Features

- 📍 Select pickup and drop points
- 🚕 Choose from available cabs (with dynamic fare)
- 📬 Email confirmation using EmailJS
- 🔁 Booking history with delete option
- 📊 Dijkstra’s algorithm for shortest route calculation
- 📱 Responsive UI (Mobile/Desktop)

---

## 🛠️ Tech Stack

- **Frontend:** React, CSS
- **Backend:** Firebase Realtime Database
- **Email Service:** EmailJS
- **Auth:** Not required (user provides email)

---

## 📁 Project Structure

```plaintext
cab-booking-app/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   └── routes.png
│
├── src/
│   ├── assets/
│   │   ├── logo.png
│   │   └── routes.png
│   ├── styles/
│   │   └── HomePage.css
│   ├── firebase.js
│   ├── HomePage.js
│   ├── App.js
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
├── README.md
└── yarn.lock / package-lock.json
```

---

**Developed with ❤️ by [Shubham Raj](https://www.linkedin.com/in/shubham-raj-7ba895204/)**