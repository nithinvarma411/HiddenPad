# 📝 HiddenPad - Privacy-Focused Desktop Notes App

**HiddenPad** is a minimalistic, privacy-focused desktop notes application built using **Electron** and **React**. The aim of this project is to explore and learn how desktop applications are built by integrating web technologies with native desktop capabilities.

## 📌 Project Overview

HiddenPad allows users to:
- Create and manage personal notes locally.
- Keep notes hidden while screen sharing (content protection enabled).
- Toggle app visibility and transparency using global shortcuts.
- Identify the device using a unique hardware ID for note management.

### 🔐 Key Features

- Transparent window to blend into desktop background.
- Global keyboard shortcuts:
  - `Ctrl/Cmd + B`: Toggle app visibility.
  - `Ctrl/Cmd + T`: Toggle transparency.
  - `Ctrl/Cmd + E`: Exclude/include window from screen sharing.
  - `Ctrl/Cmd + R`: Reload the app.
  - `esc` : Quit the app.
- Device ID-based local note storage (no login/signup).
- Always-on-top and frameless design for focused usage.

## 🛠️ Tech Stack

- **Electron** – For building cross-platform desktop applications using web technologies.
- **React + Vite** – Fast frontend development.
- **Node.js + Express** – Backend API for note management.
- **MongoDB** – For storing notes and titles securely.
- **Tailwind CSS** – For rapid UI styling.
- **node-machine-id** – For generating unique hardware identifiers.
- **Crypto (Node.js)** – For hashing and securing the device ID.

## 🎯 Purpose

> This project is created purely for **learning purposes** — specifically to understand how desktop applications are developed using Electron. It combines frontend skills (React) with native features provided by Electron to simulate real-world desktop app development.

---
