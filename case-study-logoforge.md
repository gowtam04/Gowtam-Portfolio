# LogoForge

**Category:** AI/ML
**Role:** AI Product Manager
**Year:** 2026
**Link:** [logoforge.gowtam.ai](https://logoforge.gowtam.ai)

---

## Overview

LogoForge is a free AI-powered logo generator that takes users from a simple text description to App Store-ready icon bundles in under five minutes. It leverages Google's Gemini multimodal AI to generate professional logos and includes a complete export pipeline for iOS, Android, and Web platforms.

---

## The Challenge

Indie developers and small teams face a frustrating bottleneck when launching apps: creating professional icons. Existing solutions either require expensive design tools and expertise, charge per-download for AI-generated assets, or produce generic results that don't work well at small sizes. The icon export process itself is tedious—each platform requires dozens of precisely-sized variants, proper folder structures, and configuration files like Contents.json and manifest.json.

---

## The Solution

LogoForge addresses both logo creation and export in a single streamlined workflow:

**AI-Powered Generation:** Users describe their desired logo or upload reference images for style guidance. The system uses Gemini's image generation capabilities with style-specific prompt engineering (minimalist, playful, corporate, mascot) to produce four unique variations.

**Smart Export Pipeline:** A Sharp-based image processing system generates platform-compliant icon bundles. For iOS, it creates AppIcon.appiconset with all required sizes and Contents.json. For Android, it produces standard and round launcher icons, adaptive icon foreground layers, and Play Store assets. For Web, it generates favicons, PWA manifest icons, Apple Touch icons, and Microsoft tile assets.

**Production-Ready Output:** Users download a ZIP file with correctly-structured folders, configuration files, and metadata—ready to drop directly into Xcode, Android Studio, or a web project.

---

## Results & Impact

- Launched as a free, open-source tool with no watermarks or usage limits
- Supports 4 logo styles with reference image input for guided generation
- Generates 50+ icon variants across 3 platforms in a single export
- Produces complete configuration files (Contents.json, manifest.json, browserconfig.xml, adaptive icon XML)
- Built with rate limiting and efficient streaming to handle concurrent users

---

## Technologies & Tools

- Claude Code
- Next.js
- TypeScript
- Material UI
- Google Gemini
- Sharp
- Archiver
