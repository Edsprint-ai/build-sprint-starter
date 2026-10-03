# Setup

Target: **`pnpm doctor` prints all green** and `pnpm dev` serves a page.
If you are stuck for more than 20 minutes on any one step, ask. That is what
week 1 is for.

Two routes. Pick one.

- **Route A, devcontainer.** VS Code runs everything inside a container. Nothing
  to install except Docker and VS Code. Fewest surprises, especially on Windows.
- **Route B, your own machine.** Node and pnpm installed locally, Postgres in
  Docker. Slightly faster day to day, a few more things to go wrong.

---

## Route A: devcontainer (recommended, and identical on Windows and Mac)

1. Install **Docker Desktop** and **VS Code**.
   - Windows: `winget install Docker.DockerDesktop` then `winget install Microsoft.VisualStudioCode`
   - macOS: `brew install --cask docker visual-studio-code`
2. Install the VS Code extension **Dev Containers**.
3. Clone the repo and open the folder in VS Code.
4. VS Code will offer **Reopen in Container**. Accept it. First build takes a
   few minutes; after that it is seconds.
5. In the container terminal: `pnpm doctor`

Everything below is handled for you. Skip to *Checking it worked*.

---

## Route B: your own machine

### Windows

Run these in **PowerShell**.

```powershell
winget install OpenJS.NodeJS.LTS
winget install Docker.DockerDesktop
winget install Git.Git
winget install Microsoft.VisualStudioCode
```

Then **close and reopen PowerShell** so the new commands are on your PATH.
This trips up nearly everyone.

```powershell
corepack enable
corepack prepare pnpm@latest --activate
```

Open **Docker Desktop** once and leave it running. If it complains about WSL2,
accept the prompt to install it and reboot. If it complains about
virtualisation, you need to enable it in your BIOS, and that is worth asking
for help with rather than guessing.

### macOS

```bash
# If you do not have Homebrew: https://brew.sh
brew install node git
brew install --cask docker visual-studio-code
corepack enable
corepack prepare pnpm@latest --activate
```

Open **Docker Desktop** once from Applications and leave it running. Docker
installed but not started is the single most common "it does not work".

### Both, once the above is done

```bash
git clone <your squad repo url>
cd <repo>

pnpm install
cp .env.example .env          # Windows PowerShell: copy .env.example .env

docker compose up -d db       # starts Postgres. Wait about ten seconds.
pnpm doctor
```

---

## Checking it worked

```
pnpm doctor
```

Green on Node, pnpm, Git identity, Docker, Postgres, Dependencies and `.env`.
A **note** about the API key not being set is expected and correct at this
stage: stage 3 has to work without one.

```
pnpm dev
```

Open <http://localhost:3000>. You should see a page saying there are no
findings yet, which is right, because stage 3 is yours to write.

---

## VS Code

Open the repo folder and accept **Install recommended extensions** when
prompted. That gives you Claude Code, ESLint, Prettier, Docker and the Vitest
explorer. Settings are already in `.vscode/settings.json`, so format-on-save
and the right TypeScript version are configured for you.

WebStorm is equally fine if you already use it. **Do not switch editors in
week 1** just because of this document. An unfamiliar editor costs you more
than it gains.

---

## When something is wrong

`pnpm doctor` prints the fix for every failure it reports. Start there.

Four that come up every cohort:

| What you see | What it is |
|---|---|
| `pnpm: command not found` after installing Node | You did not reopen the terminal. Close it and open a new one. |
| Docker checks fail but Docker is installed | Docker Desktop is not *running*. Open it. |
| `EADDRINUSE :3000` | Something else has the port. `PORT=3001 pnpm dev` |
| Postgres unreachable | `docker compose up -d db`, wait ten seconds, try again. |

If `pnpm doctor` is green and something still does not work, that is worth
raising: either the doctor is missing a check or you have found something real.
Both are useful.
