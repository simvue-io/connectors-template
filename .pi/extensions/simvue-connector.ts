/**
 * /simvue-connector <setup|investigate|plan|implement|build> [args]
 *
 * Namespaced wrapper around the prompt templates in .pi/prompts/simvue-connector/.
 * The first argument selects the stage template; the remaining arguments are
 * substituted into it ($1, $@, ${1:-default}, ...) exactly like pi prompt templates.
 *
 * Prompt templates alone cannot produce two-token commands (the command name is
 * the file basename and matching stops at the first space), so this extension
 * implements the namespace: it loads the matching template and sends its content
 * as a user message, triggering a turn — the same effect as a /<template> command.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const TEMPLATES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "prompts",
  "simvue-connector",
);

/** Bash-style argument parsing (mirrors pi's parseCommandArgs). */
function parseCommandArgs(argsString: string): string[] {
  const args: string[] = [];
  let current = "";
  let inQuote: string | null = null;
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    if (inQuote) {
      if (char === inQuote) inQuote = null;
      else current += char;
    } else if (char === '"' || char === "'") {
      inQuote = char;
    } else if (/\s/.test(char)) {
      if (current) {
        args.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) args.push(current);
  return args;
}

/** Placeholder substitution (mirrors pi's substituteArgs). */
function substituteArgs(content: string, args: string[]): string {
  const allArgs = args.join(" ");
  return content.replace(
    /\$\{(\d+|ARGUMENTS|@):-([^}]*)\}|\$\{@:(\d+)(?::(\d+))?\}|\$(ARGUMENTS|@|\d+)/g,
    (_match, defaultTarget, defaultValue, sliceStart, sliceLength, simple) => {
      if (defaultTarget) {
        const value =
          defaultTarget === "@" || defaultTarget === "ARGUMENTS"
            ? allArgs
            : args[parseInt(defaultTarget, 10) - 1];
        return value ? value : defaultValue;
      }
      if (sliceStart) {
        let start = parseInt(sliceStart, 10) - 1;
        if (start < 0) start = 0;
        if (sliceLength) {
          return args.slice(start, start + parseInt(sliceLength, 10)).join(" ");
        }
        return args.slice(start).join(" ");
      }
      if (simple === "ARGUMENTS" || simple === "@") return allArgs;
      return args[parseInt(simple, 10) - 1] ?? "";
    },
  );
}

/** Drop YAML frontmatter if present (templates may gain description/argument-hint later). */
function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return raw;
  const nl = raw.indexOf("\n", end + 4);
  return (nl === -1 ? "" : raw.slice(nl + 1)).trim();
}

function listSubcommands(): string[] {
  try {
    return readdirSync(TEMPLATES_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
  } catch {
    return [];
  }
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("simvue-connector", {
    description:
      "Simvue connector workflow: /simvue-connector <setup|investigate|plan|implement|build> [args]",
    getArgumentCompletions: (prefix) => {
      const items = listSubcommands()
        .filter((name) => name.startsWith(prefix))
        .map((name) => ({ value: name, label: name, description: `Run the ${name} stage` }));
      return items.length > 0 ? items : null;
    },
    handler: async (args, ctx) => {
      const tokens = parseCommandArgs(args);
      const sub = tokens[0];

      if (!sub) {
        ctx.ui.notify(
          `Usage: /simvue-connector <${listSubcommands().join("|")}> [args]`,
          "warning",
        );
        return;
      }

      const file = join(TEMPLATES_DIR, `${sub}.md`);
      if (!existsSync(file)) {
        ctx.ui.notify(
          `Unknown stage "${sub}". Available: ${listSubcommands().join(", ")}`,
          "warning",
        );
        return;
      }

      const body = stripFrontmatter(readFileSync(file, "utf-8"));
      const expanded = substituteArgs(body, tokens.slice(1));

      if (!ctx.isIdle()) {
        ctx.ui.notify("Agent is busy — wait for it to finish, then re-run the command.", "warning");
        return;
      }

      // pi.sendUserMessage is fire-and-forget (returns void), so in print mode the CLI
      // would exit before the turn runs. Wait for the turn to start, then for it to finish.
      pi.sendUserMessage(expanded);
      const startedAt = Date.now();
      while (ctx.isIdle() && Date.now() - startedAt < 5000) {
        await new Promise((r) => setTimeout(r, 50));
      }
      await ctx.waitForIdle();
    },
  });
}
