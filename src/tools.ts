import { wpCli, wpCliJson, type WpCliOptions } from "./wp-cli.js";

// Shared options that every tool gets
let globalOptions: WpCliOptions = {};

export function setGlobalOptions(opts: WpCliOptions) {
  globalOptions = opts;
}

// ============================================================
// CORE
// ============================================================

export async function wp_core_version() {
  const { stdout } = await wpCli(["core", "version"], globalOptions);
  return { version: stdout };
}

export async function wp_core_check_update() {
  return wpCliJson(["core", "check-update"], globalOptions);
}

// ============================================================
// PLUGINS
// ============================================================

export async function wp_plugin_list() {
  return wpCliJson(["plugin", "list"], globalOptions);
}

export async function wp_plugin_install(slug: string, activate: boolean = false) {
  const args = ["plugin", "install", slug];
  if (activate) args.push("--activate");
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

export async function wp_plugin_activate(slug: string) {
  const { stdout } = await wpCli(["plugin", "activate", slug], globalOptions);
  return { message: stdout };
}

export async function wp_plugin_deactivate(slug: string) {
  const { stdout } = await wpCli(["plugin", "deactivate", slug], globalOptions);
  return { message: stdout };
}

export async function wp_plugin_delete(slug: string) {
  const { stdout } = await wpCli(["plugin", "delete", slug], globalOptions);
  return { message: stdout };
}

export async function wp_plugin_search(term: string) {
  return wpCliJson(["plugin", "search", term, "--per-page=10", "--fields=name,slug,rating,active_installs"], globalOptions);
}

// ============================================================
// THEMES
// ============================================================

export async function wp_theme_list() {
  return wpCliJson(["theme", "list"], globalOptions);
}

export async function wp_theme_install(slug: string, activate: boolean = false) {
  const args = ["theme", "install", slug];
  if (activate) args.push("--activate");
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

export async function wp_theme_activate(slug: string) {
  const { stdout } = await wpCli(["theme", "activate", slug], globalOptions);
  return { message: stdout };
}

export async function wp_theme_delete(slug: string) {
  const { stdout } = await wpCli(["theme", "delete", slug], globalOptions);
  return { message: stdout };
}

// ============================================================
// POSTS
// ============================================================

export async function wp_post_list(post_type: string = "post", count: number = 20) {
  return wpCliJson([
    "post", "list",
    `--post_type=${post_type}`,
    `--posts_per_page=${count}`,
    "--fields=ID,post_title,post_status,post_date,post_type",
  ], globalOptions);
}

export async function wp_post_get(id: number) {
  return wpCliJson(["post", "get", String(id)], globalOptions);
}

export async function wp_post_create(
  title: string,
  content: string,
  post_type: string = "post",
  status: string = "draft"
) {
  const { stdout } = await wpCli([
    "post", "create",
    `--post_title=${title}`,
    `--post_content=${content}`,
    `--post_type=${post_type}`,
    `--post_status=${status}`,
    "--porcelain",
  ], globalOptions);
  return { id: parseInt(stdout), message: `Created ${post_type} "${title}" (ID: ${stdout})` };
}

export async function wp_post_update(id: number, fields: Record<string, string>) {
  const args = ["post", "update", String(id)];
  for (const [key, value] of Object.entries(fields)) {
    args.push(`--${key}=${value}`);
  }
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

export async function wp_post_delete(id: number, force: boolean = false) {
  const args = ["post", "delete", String(id)];
  if (force) args.push("--force");
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

// ============================================================
// USERS
// ============================================================

export async function wp_user_list() {
  return wpCliJson(["user", "list", "--fields=ID,user_login,user_email,roles"], globalOptions);
}

export async function wp_user_create(username: string, email: string, role: string = "subscriber") {
  const { stdout } = await wpCli([
    "user", "create", username, email,
    `--role=${role}`,
    "--porcelain",
  ], globalOptions);
  return { id: parseInt(stdout), message: `Created user "${username}" (ID: ${stdout})` };
}

export async function wp_user_delete(id: number, reassign?: number) {
  const args = ["user", "delete", String(id), "--yes"];
  if (reassign) args.push(`--reassign=${reassign}`);
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

// ============================================================
// OPTIONS (Settings)
// ============================================================

export async function wp_option_get(key: string) {
  const { stdout } = await wpCli(["option", "get", key], globalOptions);
  return { key, value: stdout };
}

export async function wp_option_update(key: string, value: string) {
  const { stdout } = await wpCli(["option", "update", key, value], globalOptions);
  return { message: stdout };
}

export async function wp_option_list(search?: string) {
  const args = ["option", "list", "--fields=option_name,option_value"];
  if (search) args.push(`--search=${search}`);
  return wpCliJson(args, globalOptions);
}

// ============================================================
// MENUS
// ============================================================

export async function wp_menu_list() {
  return wpCliJson(["menu", "list"], globalOptions);
}

export async function wp_menu_create(name: string) {
  const { stdout } = await wpCli(["menu", "create", name, "--porcelain"], globalOptions);
  return { id: parseInt(stdout), message: `Created menu "${name}" (ID: ${stdout})` };
}

export async function wp_menu_item_add(
  menu: string,
  title: string,
  url: string
) {
  const { stdout } = await wpCli([
    "menu", "item", "add-custom", menu, title, url, "--porcelain",
  ], globalOptions);
  return { id: parseInt(stdout), message: `Added "${title}" to menu "${menu}"` };
}

export async function wp_menu_location_assign(menu: string, location: string) {
  const { stdout } = await wpCli(["menu", "location", "assign", menu, location], globalOptions);
  return { message: stdout };
}

// ============================================================
// MEDIA
// ============================================================

export async function wp_media_import(url: string, title?: string) {
  const args = ["media", "import", url, "--porcelain"];
  if (title) args.push(`--title=${title}`);
  const { stdout } = await wpCli(args, globalOptions);
  return { id: parseInt(stdout), message: `Imported media (ID: ${stdout})` };
}

// ============================================================
// DATABASE
// ============================================================

export async function wp_db_query(sql: string) {
  const { stdout } = await wpCli(["db", "query", sql], globalOptions);
  return { result: stdout };
}

export async function wp_db_export(filename?: string) {
  const args = ["db", "export"];
  if (filename) args.push(filename);
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

export async function wp_search_replace(old_val: string, new_val: string, dry_run: boolean = true) {
  const args = ["search-replace", old_val, new_val];
  if (dry_run) args.push("--dry-run");
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

// ============================================================
// SCAFFOLD (Theme/Plugin generation)
// ============================================================

export async function wp_scaffold_theme(slug: string, theme_name?: string) {
  const args = ["scaffold", "child-theme", slug];
  if (theme_name) args.push(`--theme_name=${theme_name}`);
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

export async function wp_scaffold_plugin(slug: string) {
  const { stdout } = await wpCli(["scaffold", "plugin", slug], globalOptions);
  return { message: stdout };
}

export async function wp_scaffold_block(slug: string, plugin?: string) {
  const args = ["scaffold", "block", slug];
  if (plugin) args.push(`--plugin=${plugin}`);
  const { stdout } = await wpCli(args, globalOptions);
  return { message: stdout };
}

// ============================================================
// REWRITE & CACHE
// ============================================================

export async function wp_rewrite_flush() {
  const { stdout } = await wpCli(["rewrite", "flush"], globalOptions);
  return { message: stdout || "Rewrite rules flushed" };
}

export async function wp_cache_flush() {
  const { stdout } = await wpCli(["cache", "flush"], globalOptions);
  return { message: stdout || "Cache flushed" };
}

// ============================================================
// GENERAL WP-CLI (escape hatch)
// ============================================================

export async function wp_cli_raw(command: string) {
  const args = command.split(/\s+/);
  const { stdout, stderr } = await wpCli(args, globalOptions);
  return { stdout, stderr };
}
