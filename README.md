# sawa

An alternative to [veil-cli](https://github.com/aandrewduong/veil-cli) that utilizes [Puppeteer](https://pptr.dev/).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Compilation](#compilation)
- [Usage](#usage)
- [Modes](#modes)
- [Example Scenarios](#example-scenarios)

---

## Prerequisites

If you don't already have pnpm installed, download it [here](https://pnpm.io/installation).

---

## Installation & Setup

### 1️⃣ Clone the Repository
First, clone the Veil repository to your local machine:

```sh
git clone https://github.com/aandrewduong/veil-cli.git
cd veil-cli
```

### 2️⃣ Install Dependencies
Run the following command to install all required dependencies:

```sh
pnpm install
```

### 3️⃣ Configure `settings.csv`
Edit the `env` file to match your preferences (see **[Configuration](#configuration)** for details).

---

## Configuration

To function correctly, sawa needs a properly configured **`env`** file.

### `env` Parameters

| Parameter             | Description                                      | Example Value                              |
|----------------------|------------------------------------------------|-------------------------------------------|
| `USERNAME`           | Your FHDA student ID                          | `00000000`                                |
| `PASSWORD`           | Your FHDA password                            | `TestTestPassword123`                     |
| `FHDA_TERM`              | The academic term                              | `2025 Summer De Anza`                     |                                |       
| `CRNS`              | Course Reference Numbers                      | `47520,44412,41846`                       |
| `MODE`              | Task type (`Signup` or `Watch`)            | `Signup` 
| `WATCH_COOLDOWN` | Time between each check (in ms) | `3000`
| `Webhook`           | Discord Webhook for notifications             | `https://discord.com/api/webhooks/[...]`  |

#### Setting Up a Discord Webhook  
Follow this guide: [How to Create a Discord Webhook](https://hookdeck.com/webhooks/platforms/how-to-get-started-with-discord-webhooks).

---

## Usage

Run the program using:

```sh
pnpm start
```
---

## Modes

| Mode      | Description |
|-----------|------------|
| **Signup**   | Enrolls in courses using specified **CRNs**. |
| **Watch**    | Monitors enrollment availability, notifies you when a spot opens, and attempts to enroll you in the waitlist automatically. |


### 🚀 Contributions & Feedback  
sawa is open-source, and contributions are welcome! Feel free to submit issues, suggestions, or pull requests.
