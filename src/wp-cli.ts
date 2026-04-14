import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface WpCliOptions {
  /** Path to WordPress installation */
  path?: string;
  /** SSH connection string (e.g. user@host:/path/to/wp) */
  ssh?: string;
  /** URL for multisite */
  url?: string;
}

/**
 * Execute a WP-CLI command and return the output.
 */
export async function wpCli(
  args: string[],
  options: WpCliOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  const cmd = "wp";
  const fullArgs: string[] = [];

  if (options.path) {
    fullArgs.push(`--path=${options.path}`);
  }
  if (options.ssh) {
    fullArgs.push(`--ssh=${options.ssh}`);
  }
  if (options.url) {
    fullArgs.push(`--url=${options.url}`);
  }

  fullArgs.push(...args);

  // Always use --format=json where applicable for structured output
  // Don't add --quiet as we want output

  try {
    const { stdout, stderr } = await execFileAsync(cmd, fullArgs, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error: any) {
    const stderr = error.stderr?.trim() || error.message;
    const stdout = error.stdout?.trim() || "";
    throw new Error(`WP-CLI error: ${stderr}\n${stdout}`);
  }
}

/**
 * Execute WP-CLI and return JSON parsed output.
 */
export async function wpCliJson<T = any>(
  args: string[],
  options: WpCliOptions = {}
): Promise<T> {
  const { stdout } = await wpCli([...args, "--format=json"], options);
  try {
    return JSON.parse(stdout);
  } catch {
    throw new Error(`Failed to parse WP-CLI JSON output: ${stdout}`);
  }
}
