# Palindrome Checker DApp 🔄

## 🌟 Introduction

Welcome to the Palindrome Checker DApp, powered by Cartesi Rollups! This decentralized application allows users to check if a word or phrase is a palindrome, while keeping track of statistics and user submissions.

## 🛠️ Stack

- Node.js
- Ethers.js
- Cartesi Rollups

---

## 🔢 Input & Output

### Input

Submit any word or phrase as a hex-encoded string.

### Output

- Palindrome check result
- Updated statistics

---

## 📊 Available Stats

### Global Stats (route: "stats")

- Total checks
- Palindrome count
- Palindrome percentage

### User Stats (route: "users")

- Checks per user
- Palindromes found per user

---

## 🎮 How to Use

1. **Submit a Word/Phrase**

   - Send an advance-state request with the hex-encoded word/phrase

2. **View Statistics**
   - Send an inspect-state request with route "stats" or "users"
