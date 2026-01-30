# Dexpert: Case Study

**A design systems approach to building an offline-first Pokémon companion**

---

## Project Overview

| | |
|---|---|
| **Role** | Designer & Developer |
| **Timeline** | 4 weeks |
| **Status** | TestFlight |
| **Tools** | SwiftUI, SwiftData, Claude Code, Python |

---

## The Challenge

[IMAGE: Side-by-side comparison of cluttered existing Pokémon apps vs. Dexpert's clean interface]

Pokémon players need quick, reliable information during gameplay. Whether checking type matchups mid-battle, looking up a move's accuracy, or planning team compositions, the existing options fall short:

**Existing apps are cluttered and overwhelming.** Most Pokémon reference apps cram information into dense, visually noisy interfaces. When you need to quickly check if your Pokémon can learn a specific move, you shouldn't have to parse through walls of text.

**Online dependency creates friction.** Competitive events often have spotty connectivity. Casual players on commutes or flights lose access entirely. The data rarely changes—why require a connection?

**Version-specific data is an afterthought.** A Pikachu in Pokémon Scarlet learns different moves than one in Sword. Regional Pokédex numbers vary by game. Most apps either ignore this complexity or handle it poorly, leaving players to cross-reference multiple sources.

The challenge: build a reference app that handles the full complexity of the Pokémon franchise (1,025+ creatures, 15 game versions, 937 moves) while feeling fast, clean, and intuitive.

---

## Design Philosophy: Clean Canvas, Colored Content

[IMAGE: Design philosophy diagram showing neutral list views flowing into type-themed detail views]

The Pokémon franchise has a natural visual language: 18 elemental types, each with its own color. Rather than fighting this or adding competing visual elements, I embraced it as the foundation of the entire design system.

### The Core Principle

**Neutral surfaces, colored content.** The UI itself stays monochromatic—glass cards, subtle borders, SF Pro typography. The only saturated colors in the app are the 18 canonical type colors. This creates visual hierarchy naturally: your eye goes to what matters.

### How It Works in Practice

**List views are calm.** Browse through hundreds of Pokémon without visual fatigue. The type badges provide just enough color to quickly identify each creature, but the overall experience stays clean.

[IMAGE: Pokémon list view showing neutral glass cards with small type badges]

**Detail views have personality.** Tap into a Pokémon and the screen comes alive with its type color. A subtle gradient washes down from the top, glass cards pick up a hint of tint, stat bars glow with the type's hue. The UI adapts to what you're looking at.

[IMAGE: Same Pokémon shown in detail view with Fire-type theming—orange gradient, tinted cards]

**The type colors are sacred.** I spent considerable time ensuring the 18 type colors work as a cohesive palette while remaining instantly recognizable to fans. These colors appear only in meaningful contexts: type badges, stat bars, and contextual theming. Never for decoration.

| Type | Color | Type | Color |
|------|-------|------|-------|
| Fire | `#F08030` | Water | `#6890F0` |
| Grass | `#78C850` | Electric | `#F8D030` |
| Psychic | `#F85888` | Dragon | `#7038F8` |
| Ghost | `#705898` | Dark | `#705848` |

[IMAGE: Type color palette showing all 18 colors with their names]

---

## The AI Collaboration Story

[IMAGE: Diagram showing iterative workflow between designer intent, Claude Code, and shipped features]

This project exists because of a new kind of creative partnership. I used Claude Code—Anthropic's AI coding assistant—as a design and development collaborator throughout the entire process.

### What This Actually Looked Like

Traditional development involves translating design intent into code, often losing nuance along the way. With Claude Code, the workflow was different:

1. **Describe the intent.** "I want the detail view to feel like the Pokémon's type is subtly present—not overwhelming, but noticeable."

2. **Iterate in conversation.** Claude would implement an approach, I'd evaluate it, we'd discuss alternatives. "The gradient is too strong—can we drop it to 9% opacity and fade out by 40% of the screen height?"

3. **Refine the system.** Good solutions became patterns. The contextual theming approach we developed for Pokémon detail views became the template for moves, abilities, and team views.

### Why This Matters for Design

This isn't about AI replacing designers. It's about reducing the friction between design intent and implementation. I could focus on the *what* and *why* while Claude helped with the *how*.

The result: a production-quality app shipped in under a month, with a level of systematic consistency that typically requires a larger team.

### Skills This Demonstrates

- **Clear communication of design intent** — working effectively with AI tools requires precise articulation
- **Systems thinking** — patterns and tokens propagate better than one-off solutions
- **Rapid iteration** — willingness to try approaches and refine quickly
- **Quality judgment** — knowing when something feels right (or doesn't)

---

## Key Design Solution: Version Awareness

[IMAGE: Version picker UI showing 15 game options, with one selected]

The Pokémon franchise spans 15+ mainline games, each with its own regional Pokédex, learnsets, and sometimes even different move statistics. This creates a genuine design challenge:

**How do you support 15 game versions without overwhelming the user?**

### The Problem in Detail

Consider Pikachu. In the National Pokédex, it's #025. But:
- In Scarlet/Violet, it's Paldea Pokédex #074
- In Sword/Shield, it's Galar Pokédex #194
- In Sun/Moon, it's Alola Pokédex #025

And that's just the dex number. Pikachu learns different moves at different levels depending on the game. Some moves don't exist in certain games. Type effectiveness rules changed between generations.

Most apps either ignore this (showing only National Dex data) or create separate interfaces per game. Neither solution respects both the complexity of the data and the user's time.

### The Solution: One Interface, Contextual Data

[IMAGE: Same Pokémon card showing different regional dex numbers based on selected version]

Dexpert uses a single, unified interface that adapts based on your selected game version:

**Version picker in settings.** Choose your game once. The entire app respects that choice.

**Contextual dex numbers.** The list sorts by your regional Pokédex, showing regional numbers. Switch versions, the list reorders.

**Version-aware movesets.** "Moves learned by level up" shows only moves available in your selected game, at the correct levels for that version.

**Graceful degradation.** National Dex mode (the default) shows everything—useful for newcomers or players using multiple games.

### Implementation Insight

This required rethinking the data model. Rather than storing one canonical dataset, each Pokémon carries version-specific data as structured JSON:

```
{
  "dexNumbers": {
    "national": 25,
    "paldea": 74,
    "galar": 194
  },
  "learnset": {
    "scarlet-violet": [...],
    "sword-shield": [...]
  }
}
```

The UI reads from this structure based on the user's selected version. One data model, infinite flexibility.

[IMAGE: Data flow diagram showing SelectedVersion → ViewModel → UI adaptation]

---

## Design System Components

[IMAGE: Component library overview showing GlassCard, TypeBadge, StatBar variations]

Building a cohesive app meant investing in reusable components. Here's the system:

### Design Tokens

Every visual decision routes through a centralized token system:

```
Spacing: xs(4) → sm(8) → md(12) → lg(16) → xl(20) → 2xl(24) → 3xl(32)
Radius:  sm(6) → md(8) → lg(12) → xl(20) → 2xl(24)
```

Typography follows iOS Human Interface Guidelines—SF Pro throughout, with semantic styles (Body, Caption, Headline) rather than arbitrary sizes.

### GlassCard

[IMAGE: GlassCard component in neutral state and type-tinted state]

The primary container throughout the app. Supports optional type tinting for detail views:

- **Neutral:** Subtle glass effect with 6% white fill (dark mode)
- **Type-tinted:** Gradient from type color (8% opacity) to neutral

### TypeBadge

[IMAGE: TypeBadge component at compact and standard sizes]

Displays a Pokémon's type with consistent styling:

- Background: canonical type color
- Text: white with subtle shadow for contrast
- Two sizes: compact (list views) and standard (detail views)

### StatBar

[IMAGE: StatBar component showing HP stat with type-colored fill and glow]

Visualizes base stats with animated fills:

- Track: subtle neutral background
- Fill: type color with optional glow effect
- Animation: staggered reveal on appear

### TypeThemedBackground

Applies contextual theming to any view based on one or more types:

- Top gradient in type color (9% opacity, fading by 40%)
- Automatically adjusts for dual-type Pokémon
- Respects light/dark mode

---

## Data Architecture

[IMAGE: Pipeline diagram: PokéAPI → Python fetch → Transform → Generate → Bundle → App]

Dexpert is offline-first. All 1,025+ Pokémon, 937 moves, and 367 abilities are bundled with the app, requiring zero network connectivity.

### The Pipeline

1. **Fetch** — Python script pulls raw data from PokéAPI (the community Pokémon database)
2. **Transform** — Normalize, clean, and restructure into app-optimized format
3. **Generate** — Produce optimized JSON bundles and sprite asset catalogs
4. **Bundle** — Include in app binary for zero-latency access

### Why This Was the Biggest Challenge

The raw data from PokéAPI is deeply nested and optimized for API traversal, not app consumption. A single Pokémon's data might require 20+ API calls to fully resolve.

The transformation step—flattening, denormalizing, merging version-specific data—took more iteration than any other part of the project. The result is a data format purpose-built for fast local queries.

### Storage Strategy

SwiftData provides the persistence layer, with an interesting twist: complex nested structures (stat arrays, ability lists, version-specific movesets) are stored as JSON-encoded blobs with computed property decoders.

This gives us the queryability of a structured database with the flexibility of document storage.

---

## Results & Scope

[IMAGE: Hero shot showing app icon with key feature screens arranged around it]

### What Ships

| Feature | Scope |
|---------|-------|
| **Pokémon** | 1,025+ creatures with HD sprites, full stats, abilities, evolutions |
| **Moves** | 937 moves with type, power, accuracy, effect descriptions |
| **Abilities** | 367 abilities with descriptions and Pokémon that have them |
| **Versions** | 15 game versions (Generation 5 to present) |
| **Type Calculator** | Dual-type support, offensive and defensive matchups |
| **Team Builder** | 6-slot teams with type coverage analysis |

### The Numbers

- **Zero** network requests required for core functionality
- **15** game versions supported with contextual data
- **18** type colors as the sole source of saturated hue
- **4** weeks from concept to TestFlight

---

## Personal Growth

[IMAGE: Before/after mental model diagram showing growth in data architecture thinking]

### What I Learned

**Data architecture is a design problem.** How you structure data shapes what interfaces are possible. The version-awareness feature exists because the data model was designed to support it.

**Design systems scale better than one-off solutions.** Investing in tokens and components early meant later features (moves, abilities, teams) came together quickly. The same patterns applied everywhere.

**AI collaboration requires design skills, not less.** Effectively working with Claude Code meant being precise about intent, recognizing quality, and knowing when to push back. The AI accelerates; it doesn't replace judgment.

### Skills Demonstrated

- **Systems thinking** — tokens, components, patterns over ad-hoc decisions
- **Data modeling** — designing structures that enable product features
- **Technical communication** — translating design intent to implementation
- **Rapid iteration** — shipping a complete app in four weeks
- **Tool fluency** — leveraging AI effectively while maintaining vision

---

## Visual Assets Checklist

For portfolio presentation, capture these screenshots/diagrams:

- [ ] **Hero composition** — App icon with 3-4 key screens
- [ ] **Design philosophy diagram** — Neutral list → type-themed detail flow
- [ ] **Type color palette** — All 18 colors with labels
- [ ] **List vs. detail comparison** — Same Pokémon in both contexts
- [ ] **Version picker flow** — Settings → version selection → adapted list
- [ ] **Component library** — GlassCard, TypeBadge, StatBar variations
- [ ] **Data pipeline diagram** — Fetch → transform → bundle flow
- [ ] **Type theming showcase** — Same detail screen with different types (Fire, Water, Ghost)

---

*Case study prepared for design portfolio. Project available on TestFlight.*
