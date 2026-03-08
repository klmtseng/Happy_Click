# Brief: "Claude's Cycles" by Donald Knuth (March 3, 2026)

**Author:** Donald Knuth, Stanford Computer Science Department
**PDF:** https://cs.stanford.edu/~knuth/papers/claude-cycles.pdf

---

## Overview

Donald Knuth published a paper titled "Claude's Cycles" — opening with "Shock! Shock!" — describing how Anthropic's Claude Opus 4.6 solved an open graph theory conjecture he had been working on for several weeks. The construction will likely appear in a future volume of *The Art of Computer Programming*.

## The Problem

Decompose the arcs of a **3-dimensional Cayley digraph** into **3 directed Hamiltonian cycles**, for all odd m > 2.

Concretely: consider an m x m x m grid where each point (i, j, k) has coordinates ranging from 0 to m-1. From each point, one can move in three directions (increment i, j, or k), with coordinates wrapping around modulo m. This creates a directed graph with m^3 vertices and 3m^3 directed edges. The challenge is to find three Hamiltonian cycles (each visiting every vertex exactly once, length m^3) that collectively partition all edges — each edge belonging to exactly one cycle.

Knuth had solved a limited case but could not find a general construction for all odd m.

## How Claude Solved It

Filip Stappers, a colleague of Knuth, fed the exact problem statement to Claude Opus 4.6 and ran **31 guided explorations over roughly one hour**. Claude's approach was methodical and iterative:

- Tested linear formulas
- Attempted brute-force searches
- Developed new geometric frameworks
- Applied simulated annealing
- Hit dead ends, changed strategies, and kept going
- Independently recognized the problem's structure as a Cayley digraph

The construction Claude eventually discovered — a **"serpentine" pattern** — turned out to correspond to the classical **modular m-ary Gray code**, a known structure in combinatorics. Claude derived this from scratch without knowing it was rediscovering something named.

### The Rule

Let s = (i + j + k) mod m:

| Condition | Action |
|-----------|--------|
| s = 0 | Bump i if j = m-1, otherwise bump k |
| 0 < s < m-1 | Bump k if i = m-1, otherwise bump j |
| s = m-1 | Bump k if i = 0, otherwise bump j |

("Bump" = increase by 1, mod m)

## Verification

- Stappers tested Claude's Python program for all odd m between 3 and 101 — **perfect decompositions every time**
- **Knuth wrote the formal mathematical proof** (Claude found the construction but could not prove it correct)
- Knuth generalized the result and found exactly **760 "Claude-like" decompositions** out of 4,554 total solutions — about 1 in 6

## Limitations

- **Only odd m solved.** The decomposition for even m remains an open problem. The m = 2 case was proved impossible long ago.
- **Human facilitation required.** Stappers actively steered the session — restarting on errors, reminding Claude to document progress, and redirecting when it lost track. This was an interactive process, not a fully autonomous one.
- Claude claimed solutions for m = 4, 6, and 8 but could not generalize to all even m.

## Significance

- Knuth called Claude's plan "quite admirable" and the result "a dramatic advance in automatic deduction and creative problem solving"
- Knuth wrote: **"It seems I'll have to revise my opinions about generative AI one of these days"** — notable given that in April 2023 he had given ChatGPT a 20-question exam and called the exercise "studying the task of how to fake it"
- Demonstrates AI capability in creative mathematical problem-solving: finding constructions through guided search, even if formal proof still requires human mathematicians
