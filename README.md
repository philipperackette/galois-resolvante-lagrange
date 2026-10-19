[![CI](https://github.com/philipperackette/galois-resolvante-lagrange/actions/workflows/ci.yml/badge.svg)](https://github.com/philipperackette/galois-resolvante-lagrange/actions/workflows/ci.yml)

# Résolvante de Lagrange

La construction qui transforme une action cyclique en multiplication par une racine de l'unité.

**En ligne :** https://philipperackette.github.io/galois-resolvante-lagrange/

## Vérifications automatiques

À chaque push et pull request, GitHub Actions lance ESLint et HTMLHint, puis des tests Playwright dans Chromium, sur écran d'ordinateur et de téléphone. Ils vérifient que chaque page s'ouvre sans erreur JavaScript ni défilement horizontal. Tests propres à ce site : les résolvantes affichées (n ≤ 5) : σ multiplie bien Λₖ par ζₙᵏ, vérifié numériquement à partir des formules de la page.

Le site lui-même n'a aucune dépendance : `package.json` ne sert qu'à ces vérifications.

```bash
npm ci
npm run lint
npx playwright install chromium
npm test
```
