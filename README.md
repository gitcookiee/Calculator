# Quantum Calc 🧮

A sleek, modern, and responsive scientific calculator web app built with vanilla HTML5, CSS3, and JavaScript.

![Quantum Calc Demo](index.html)

## ✨ Features

- **Dual Operating Modes**:
  - **Standard Mode**: Arithmetic operations (`+`, `-`, `×`, `÷`, `%`), parentheses `()`, clear `AC`, backspace `⌫`, decimal, and sign negation `±`.
  - **Scientific Mode**: Trigonometry (`sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`), Logarithms (`log`, `ln`), Roots (`√`, `∛`), Exponents (`xʸ`, `x²`), Constants (`π`, `e`), Factorials (`n!`), and Degree/Radian unit toggle (`DEG` / `RAD`).

- **Interactive Calculation History**:
  - Slide-in side drawer panel storing past calculations.
  - One-click recall of expression or computed result into current active screen.
  - Persistent history across browser reloads stored via `localStorage`.

- **Design & Customization**:
  - Glassmorphic UI with dynamic backdrop blur and glow effects.
  - 3 Curated Themes: **Cyberpunk Dark**, **Glass Light**, and **Deep Space OLED**.
  - Animated keypress feedback and smooth display transitions.
  - Built-in Web Audio API sound synthesizer for subtle mechanical keypress feedback (toggleable).

- **Memory Toolbar**:
  - Full memory functions: `MC` (Memory Clear), `MR` (Memory Recall), `M+` (Memory Add), `M-` (Memory Subtract), `MS` (Memory Store).

- **Keyboard Accessibility**:
  - Direct keyboard inputs for numbers, operators, `Enter` / `=`, `Backspace`, `Escape` (`AC`), and scientific shortcuts.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| --- | --- |
| `0` - `9` | Digits input |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Addition, Subtraction, Multiplication, Division |
| `%` | Percentage |
| `^` | Exponentiation |
| `(` / `)` | Parentheses |
| `Enter` or `=` | Calculate result |
| `Backspace` | Erase last digit |
| `Escape` or `C` | Clear All (`AC`) |
| `S`, `O`, `T` | Quick trigger `sin`, `cos`, `tan` |

---

## 🚀 Local Development Setup

Simply open `index.html` in any modern web browser or serve via a local HTTP server:

```bash
# Using Node.js npx http-server
npx http-server .
```

Or open directly in browser:
`file:///c:/Users/SACHIN%20DUBEY/Desktop/coding/git/Calculator/index.html`

---

## 🛠️ Technology Stack

- **HTML5**: Semantic document layout & ARIA accessibility attributes.
- **Vanilla CSS3**: Design system with CSS variables, Glassmorphism backdrop-filters, CSS Grid & Flexbox layouts.
- **Vanilla JavaScript**: Safe expression parsing engine, Web Audio API sound synthesizer, and `localStorage` persistence.
