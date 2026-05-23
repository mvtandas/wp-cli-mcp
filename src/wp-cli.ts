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
  /** Use direct SSH instead of local wp --ssh */
  sshDirect?: boolean;
}

const escapeArg = (arg: string) => `'${arg.replace(/'/g, "'\\''")}'`;

/**
 * Execute a WP-CLI command and return the output.
 */
export async function wpCli(
  args: string[],
  options: WpCliOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  let cmd: string;
  const fullArgs: string[] = [];

  if (options.sshDirect && options.ssh) {
    cmd = "ssh";

    const sshParts = options.ssh.split(":");
    if (sshParts.length < 2) {
      throw new Error("Invalid SSH connection string. Expected format: user@host:/path");
    }

    const host = sshParts[0];
    const remotePath = sshParts.slice(1).join(":");

    fullArgs.push(host);

    const wpArgs: string[] = [];

    if (options.url) {
      wpArgs.push(`--url=${options.url}`);
    }

    wpArgs.push(...args);

    const escapedArgs = wpArgs.map(escapeArg).join(" ");
    const remoteCommand = `cd '${remotePath.replace(/'/g, "'\\''")}' && wp ${escapedArgs}`;

    fullArgs.push(remoteCommand);
  } else {
    cmd = "wp";

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
  }

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
