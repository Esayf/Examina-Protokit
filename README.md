# Examina-Protokit
Examina Protokit implementation for exams
# Protokit: Starter kit

Starter kit for developing privacy enabled application chains. (zkChains)

The default example contains a simple zkChain with one runtime module - `src/Balances.ts`.
Integration tests for the Balances module can be found in `src/Balances.test.ts`.

**Quick start:**

```zsh
npx degit proto-kit/starter-kit#develop my-chain
cd my-chain
npm install
npm run test:watch
```

# Turborepo starter
# Protokit starter-kit

This repository is a monorepo aimed at kickstarting application chain development using the Protokit framework.

## Quick start

The monorepo contains 1 package and 1 app:

- `packages/chain` contains everything related to your app-chain
- `apps/web` contains a demo UI that connects to your locally hosted app-chain sequencer

**Prerequisites:**

- Node.js v18
- pnpm
- nvm

> If you're on windows, please use Docker until we find a more suitable solution to running the `@proto-kit/cli`. 
> Run the following command and then proceed to "Running the sequencer & UI":
>
> `docker run -it --rm -p 3000:3000 -p 8080:8080 -v %cd%:/starter-kit -w /starter-kit gplane/pnpm:node18 bash`


### Setup

```zsh
git clone https://github.com/proto-kit/starter-kit my-chain
cd my-chain

# ensures you have the right node.js version
nvm use
pnpm install
```

### Running the sequencer & UI

```zsh
# starts both UI and sequencer locally
pnpm dev

# starts UI only
pnpm dev -- --filter web
# starts sequencer only
pnpm dev -- --filter chain
```

Navigate to `localhost:3000` to see the example UI, or to `localhost:8080/graphql` to see the GQL interface of the locally running sequencer.
