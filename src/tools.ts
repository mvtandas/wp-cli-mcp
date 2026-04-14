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
// THEME FILE MANAGEMENT
// ============================================================

export async function wp_theme_file_list(theme?: string) {
  // Get active theme if not specified
  if (!theme) {
    const { stdout } = await wpCli(["theme", "list", "--status=active", "--field=name"], globalOptions);
    theme = stdout.trim();
  }
  const { stdout } = await wpCli(["eval", `
    $theme_dir = get_theme_root() . '/${theme}';
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($theme_dir));
    $result = [];
    foreach ($files as $file) {
      if ($file->isFile()) {
        $path = str_replace($theme_dir . '/', '', $file->getPathname());
        $result[] = ['path' => $path, 'size' => $file->getSize()];
      }
    }
    echo json_encode($result);
  `.replace(/\n/g, ' ')], globalOptions);
  try {
    return JSON.parse(stdout);
  } catch {
    return { files: stdout };
  }
}

export async function wp_theme_file_read(filepath: string, theme?: string) {
  if (!theme) {
    const { stdout } = await wpCli(["theme", "list", "--status=active", "--field=name"], globalOptions);
    theme = stdout.trim();
  }
  const { stdout } = await wpCli(["eval", `
    $theme_dir = get_theme_root() . '/${theme}';
    $file = $theme_dir . '/${filepath}';
    if (file_exists($file)) {
      echo file_get_contents($file);
    } else {
      echo 'FILE_NOT_FOUND';
    }
  `.replace(/\n/g, ' ')], globalOptions);
  if (stdout === 'FILE_NOT_FOUND') {
    throw new Error(`File not found: ${filepath} in theme ${theme}`);
  }
  return { theme, path: filepath, content: stdout };
}

export async function wp_theme_file_write(filepath: string, content: string, theme?: string) {
  if (!theme) {
    const { stdout } = await wpCli(["theme", "list", "--status=active", "--field=name"], globalOptions);
    theme = stdout.trim();
  }
  // Write content via wp eval with base64 to avoid escaping issues
  const b64 = Buffer.from(content).toString('base64');
  const { stdout } = await wpCli(["eval", `
    $theme_dir = get_theme_root() . '/${theme}';
    $file = $theme_dir . '/${filepath}';
    $dir = dirname($file);
    if (!is_dir($dir)) { wp_mkdir_p($dir); }
    $content = base64_decode('${b64}');
    $result = file_put_contents($file, $content);
    echo $result !== false ? 'OK:' . strlen($content) . ' bytes' : 'FAILED';
  `.replace(/\n/g, ' ')], globalOptions);
  return { theme, path: filepath, message: stdout };
}

export async function wp_theme_file_delete(filepath: string, theme?: string) {
  if (!theme) {
    const { stdout } = await wpCli(["theme", "list", "--status=active", "--field=name"], globalOptions);
    theme = stdout.trim();
  }
  const { stdout } = await wpCli(["eval", `
    $theme_dir = get_theme_root() . '/${theme}';
    $file = $theme_dir . '/${filepath}';
    echo file_exists($file) && unlink($file) ? 'DELETED' : 'NOT_FOUND';
  `.replace(/\n/g, ' ')], globalOptions);
  return { theme, path: filepath, message: stdout };
}

// ============================================================
// PHP EVAL (powerful escape hatch)
// ============================================================

export async function wp_eval(code: string) {
  const { stdout, stderr } = await wpCli(["eval", code], globalOptions);
  return { output: stdout, errors: stderr || undefined };
}

// ============================================================
// WIDGET & SIDEBAR
// ============================================================

export async function wp_sidebar_list() {
  return wpCliJson(["sidebar", "list"], globalOptions);
}

export async function wp_widget_list(sidebar?: string) {
  const args = ["widget", "list"];
  if (sidebar) args.push(sidebar);
  return wpCliJson(args, globalOptions);
}

// ============================================================
// TAXONOMY & TERMS
// ============================================================

export async function wp_term_list(taxonomy: string) {
  return wpCliJson(["term", "list", taxonomy, "--fields=term_id,name,slug,count"], globalOptions);
}

export async function wp_term_create(taxonomy: string, name: string, slug?: string) {
  const args = ["term", "create", taxonomy, name, "--porcelain"];
  if (slug) args.push(`--slug=${slug}`);
  const { stdout } = await wpCli(args, globalOptions);
  return { id: parseInt(stdout), message: `Created term "${name}" in ${taxonomy} (ID: ${stdout})` };
}

// ============================================================
// POST META
// ============================================================

export async function wp_post_meta_get(post_id: number, key: string) {
  const { stdout } = await wpCli(["post", "meta", "get", String(post_id), key], globalOptions);
  return { post_id, key, value: stdout };
}

export async function wp_post_meta_update(post_id: number, key: string, value: string) {
  const { stdout } = await wpCli(["post", "meta", "update", String(post_id), key, value], globalOptions);
  return { message: stdout || "Updated" };
}

export async function wp_post_meta_list(post_id: number) {
  return wpCliJson(["post", "meta", "list", String(post_id)], globalOptions);
}

// ============================================================
// SITE INFO
// ============================================================

export async function wp_site_info() {
  const version = await wp_core_version();
  const siteUrl = await wp_option_get("siteurl");
  const blogName = await wp_option_get("blogname");
  const theme = await wpCli(["theme", "list", "--status=active", "--field=name"], globalOptions);
  const pluginCount = await wpCli(["plugin", "list", "--status=active", "--format=count"], globalOptions);
  return {
    wordpress_version: version.version,
    site_url: siteUrl.value,
    site_name: blogName.value,
    active_theme: theme.stdout.trim(),
    active_plugins: parseInt(pluginCount.stdout) || 0,
  };
}

// ============================================================
// ============================================================
// WOOCOMMERCE
// ============================================================

export async function wc_product_list(count: number = 20) {
  return wpCliJson([
    "post", "list",
    "--post_type=product",
    `--posts_per_page=${count}`,
    "--fields=ID,post_title,post_status,post_date",
  ], globalOptions);
}

export async function wc_product_create(
  name: string,
  regular_price: string,
  product_type: string = "simple",
  description: string = "",
  status: string = "publish"
) {
  const { stdout } = await wpCli([
    "post", "create",
    `--post_title=${name}`,
    `--post_content=${description}`,
    "--post_type=product",
    `--post_status=${status}`,
    "--porcelain",
  ], globalOptions);
  const id = parseInt(stdout);
  // Set product meta
  await wpCli(["post", "meta", "update", String(id), "_regular_price", regular_price], globalOptions);
  await wpCli(["post", "meta", "update", String(id), "_price", regular_price], globalOptions);
  await wpCli(["post", "meta", "update", String(id), "_product_type", product_type], globalOptions);
  await wpCli(["post", "meta", "update", String(id), "_visibility", "visible"], globalOptions);
  await wpCli(["post", "meta", "update", String(id), "_stock_status", "instock"], globalOptions);
  return { id, message: `Created product "${name}" (ID: ${id}, price: ${regular_price})` };
}

export async function wc_product_get(id: number) {
  const post = await wpCliJson(["post", "get", String(id)], globalOptions);
  const meta = await wpCliJson(["post", "meta", "list", String(id)], globalOptions);
  const price = meta.find((m: any) => m.meta_key === "_regular_price")?.meta_value;
  const salePrice = meta.find((m: any) => m.meta_key === "_sale_price")?.meta_value;
  const sku = meta.find((m: any) => m.meta_key === "_sku")?.meta_value;
  const stock = meta.find((m: any) => m.meta_key === "_stock_status")?.meta_value;
  return { ...post, price, sale_price: salePrice, sku, stock_status: stock };
}

export async function wc_product_update_price(id: number, regular_price: string, sale_price?: string) {
  await wpCli(["post", "meta", "update", String(id), "_regular_price", regular_price], globalOptions);
  await wpCli(["post", "meta", "update", String(id), "_price", sale_price || regular_price], globalOptions);
  if (sale_price) {
    await wpCli(["post", "meta", "update", String(id), "_sale_price", sale_price], globalOptions);
  }
  return { message: `Updated product ${id} price to ${regular_price}${sale_price ? ` (sale: ${sale_price})` : ''}` };
}

export async function wc_order_list(count: number = 20, status?: string) {
  const args = [
    "post", "list",
    "--post_type=shop_order",
    `--posts_per_page=${count}`,
    "--fields=ID,post_title,post_status,post_date",
  ];
  if (status) args.push(`--post_status=${status}`);
  return wpCliJson(args, globalOptions);
}

export async function wc_order_get(id: number) {
  const post = await wpCliJson(["post", "get", String(id)], globalOptions);
  const meta = await wpCliJson(["post", "meta", "list", String(id)], globalOptions);
  const total = meta.find((m: any) => m.meta_key === "_order_total")?.meta_value;
  const currency = meta.find((m: any) => m.meta_key === "_order_currency")?.meta_value;
  const billing_email = meta.find((m: any) => m.meta_key === "_billing_email")?.meta_value;
  const payment_method = meta.find((m: any) => m.meta_key === "_payment_method_title")?.meta_value;
  return { ...post, total, currency, billing_email, payment_method };
}

export async function wc_coupon_create(code: string, discount_type: string, amount: string) {
  const { stdout } = await wpCli([
    "post", "create",
    `--post_title=${code}`,
    "--post_type=shop_coupon",
    "--post_status=publish",
    "--porcelain",
  ], globalOptions);
  const id = parseInt(stdout);
  await wpCli(["post", "meta", "update", String(id), "discount_type", discount_type], globalOptions);
  await wpCli(["post", "meta", "update", String(id), "coupon_amount", amount], globalOptions);
  return { id, message: `Created coupon "${code}" (${discount_type}: ${amount})` };
}

// ============================================================
// CRON JOBS
// ============================================================

export async function wp_cron_list() {
  return wpCliJson(["cron", "event", "list"], globalOptions);
}

export async function wp_cron_run(hook: string) {
  const { stdout } = await wpCli(["cron", "event", "run", hook], globalOptions);
  return { message: stdout || `Ran cron event: ${hook}` };
}

// ============================================================
// MAINTENANCE
// ============================================================

export async function wp_maintenance_mode(enable: boolean) {
  const { stdout } = await wpCli([
    "maintenance-mode", enable ? "activate" : "deactivate",
  ], globalOptions);
  return { message: stdout || `Maintenance mode ${enable ? 'enabled' : 'disabled'}` };
}

export async function wp_transient_delete(key: string) {
  const { stdout } = await wpCli(["transient", "delete", key], globalOptions);
  return { message: stdout || `Deleted transient: ${key}` };
}

export async function wp_transient_delete_all() {
  const { stdout } = await wpCli(["transient", "delete", "--all"], globalOptions);
  return { message: stdout || "All transients deleted" };
}

// ============================================================
// GENERAL WP-CLI (escape hatch)
// ============================================================

export async function wp_cli_raw(command: string) {
  const args = command.split(/\s+/);
  const { stdout, stderr } = await wpCli(args, globalOptions);
  return { stdout, stderr };
}
