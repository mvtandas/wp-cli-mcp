#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as tools from "./tools.js";
import { setGlobalOptions } from "./tools.js";

const server = new McpServer({
  name: "wp-cli-mcp",
  version: "1.0.0",
});

// Set global WP-CLI options from environment
setGlobalOptions({
  path: process.env.WP_PATH,
  ssh: process.env.WP_SSH,
  url: process.env.WP_URL,
});

// ─── Core ──────────────────────────────────────────────────
server.tool("wp_core_version", "Get the currently installed WordPress core version. Returns the version string (e.g. '6.7.1'). Useful for checking compatibility before installing plugins or themes.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_core_version(), null, 2) }],
}));

server.tool("wp_core_check_update", "Check if WordPress core updates are available. Returns a list of available versions with download URLs. Use this before running updates to see what's new.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_core_check_update(), null, 2) }],
}));

// ─── Plugins ───────────────────────────────────────────────
server.tool("wp_plugin_list", "List all installed WordPress plugins with their name, status (active/inactive/must-use), version, and update availability. Returns a JSON array of plugin objects.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_list(), null, 2) }],
}));

server.tool("wp_plugin_install", "Install a WordPress plugin from the official wordpress.org plugin directory. Optionally activate it immediately after installation.", {
  slug: z.string().describe("The plugin slug from wordpress.org (e.g. 'woocommerce', 'advanced-custom-fields', 'contact-form-7'). This is the URL-friendly name shown in the plugin's wordpress.org URL."),
  activate: z.boolean().optional().describe("Whether to activate the plugin immediately after installation. Defaults to false."),
}, async ({ slug, activate }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_install(slug, activate), null, 2) }],
}));

server.tool("wp_plugin_activate", "Activate an installed but inactive WordPress plugin. The plugin must already be installed.", {
  slug: z.string().describe("The plugin slug to activate (e.g. 'woocommerce'). Must match an installed plugin."),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_activate(slug), null, 2) }],
}));

server.tool("wp_plugin_deactivate", "Deactivate an active WordPress plugin without removing it. The plugin files remain on disk and can be reactivated later.", {
  slug: z.string().describe("The plugin slug to deactivate (e.g. 'woocommerce'). Must be currently active."),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_deactivate(slug), null, 2) }],
}));

server.tool("wp_plugin_delete", "Permanently delete a WordPress plugin from the filesystem. The plugin must be deactivated first. This cannot be undone.", {
  slug: z.string().describe("The plugin slug to delete. The plugin must be deactivated before deletion."),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_delete(slug), null, 2) }],
}));

server.tool("wp_plugin_search", "Search the official wordpress.org plugin directory for plugins matching a search term. Returns top 10 results with name, slug, rating, and active install count.", {
  term: z.string().describe("Search term to find plugins (e.g. 'seo', 'contact form', 'e-commerce')"),
}, async ({ term }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_search(term), null, 2) }],
}));

// ─── Themes ────────────────────────────────────────────────
server.tool("wp_theme_list", "List all installed WordPress themes with their name, status (active/inactive), version, and update availability. Returns a JSON array.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_list(), null, 2) }],
}));

server.tool("wp_theme_install", "Install a WordPress theme from the official wordpress.org theme directory. Optionally activate it immediately.", {
  slug: z.string().describe("Theme slug from wordpress.org (e.g. 'twentytwentyfour', 'astra', 'flavor')"),
  activate: z.boolean().optional().describe("Whether to activate the theme immediately after installation. Defaults to false."),
}, async ({ slug, activate }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_install(slug, activate), null, 2) }],
}));

server.tool("wp_theme_activate", "Activate a theme", {
  slug: z.string().describe("Theme slug"),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_activate(slug), null, 2) }],
}));

server.tool("wp_theme_delete", "Delete a theme", {
  slug: z.string().describe("Theme slug"),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_delete(slug), null, 2) }],
}));

// ─── Posts ──────────────────────────────────────────────────
server.tool("wp_post_list", "List WordPress posts, pages, or any custom post type. Returns ID, title, status, date, and type for each item.", {
  post_type: z.string().optional().describe("WordPress post type to query. Common types: 'post', 'page', 'product' (WooCommerce), 'attachment'. Defaults to 'post'."),
  count: z.number().optional().describe("Maximum number of posts to return. Defaults to 20."),
}, async ({ post_type, count }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_list(post_type, count), null, 2) }],
}));

server.tool("wp_post_get", "Get a single post by ID", {
  id: z.number().describe("Post ID"),
}, async ({ id }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_get(id), null, 2) }],
}));

server.tool("wp_post_create", "Create a new WordPress post, page, or custom post type entry. Returns the new post ID. Content supports full HTML.", {
  title: z.string().describe("The title of the post/page to create"),
  content: z.string().describe("The body content in HTML format. Supports Gutenberg block markup, shortcodes, and plain HTML."),
  post_type: z.string().optional().describe("WordPress post type: 'post', 'page', 'product', or any registered CPT. Defaults to 'post'."),
  status: z.string().optional().describe("Publication status: 'draft' (default), 'publish' (live immediately), 'pending' (needs review), 'private' (visible to admins only)"),
}, async ({ title, content, post_type, status }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_create(title, content, post_type, status), null, 2) }],
}));

server.tool("wp_post_update", "Update an existing post", {
  id: z.number().describe("Post ID"),
  post_title: z.string().optional().describe("New title"),
  post_content: z.string().optional().describe("New content"),
  post_status: z.string().optional().describe("New status: draft, publish, pending, private"),
}, async ({ id, post_title, post_content, post_status }) => {
  const fields: Record<string, string> = {};
  if (post_title) fields.post_title = post_title;
  if (post_content) fields.post_content = post_content;
  if (post_status) fields.post_status = post_status;
  return { content: [{ type: "text" as const, text: JSON.stringify(await tools.wp_post_update(id, fields), null, 2) }] };
});

server.tool("wp_post_delete", "Delete a post", {
  id: z.number().describe("Post ID"),
  force: z.boolean().optional().describe("Skip trash and force delete"),
}, async ({ id, force }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_delete(id, force), null, 2) }],
}));

// ─── Users ─────────────────────────────────────────────────
server.tool("wp_user_list", "List all users", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_user_list(), null, 2) }],
}));

server.tool("wp_user_create", "Create a new user", {
  username: z.string().describe("Username"),
  email: z.string().describe("Email address"),
  role: z.string().optional().describe("User role (subscriber, editor, administrator, etc.)"),
}, async ({ username, email, role }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_user_create(username, email, role), null, 2) }],
}));

// ─── Options (Settings) ────────────────────────────────────
server.tool("wp_option_get", "Get a WordPress option value", {
  key: z.string().describe("Option name (e.g. blogname, siteurl, permalink_structure)"),
}, async ({ key }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_option_get(key), null, 2) }],
}));

server.tool("wp_option_update", "Update a WordPress option", {
  key: z.string().describe("Option name"),
  value: z.string().describe("New value"),
}, async ({ key, value }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_option_update(key, value), null, 2) }],
}));

// ─── Menus ─────────────────────────────────────────────────
server.tool("wp_menu_list", "List all navigation menus", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_menu_list(), null, 2) }],
}));

server.tool("wp_menu_create", "Create a new navigation menu", {
  name: z.string().describe("Menu name"),
}, async ({ name }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_menu_create(name), null, 2) }],
}));

server.tool("wp_menu_item_add", "Add a custom link to a menu", {
  menu: z.string().describe("Menu name or ID"),
  title: z.string().describe("Menu item title"),
  url: z.string().describe("Menu item URL"),
}, async ({ menu, title, url }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_menu_item_add(menu, title, url), null, 2) }],
}));

// ─── Media ─────────────────────────────────────────────────
server.tool("wp_media_import", "Import media from URL", {
  url: z.string().describe("URL of the media file to import"),
  title: z.string().optional().describe("Title for the media item"),
}, async ({ url, title }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_media_import(url, title), null, 2) }],
}));

// ─── Database ──────────────────────────────────────────────
server.tool("wp_db_query", "Execute a raw SQL query against the WordPress database. Use for read-only SELECT queries. WARNING: Write queries (INSERT, UPDATE, DELETE) can damage the database — use with caution.", {
  sql: z.string().describe("SQL query to execute. Use SELECT for reads. Tables are prefixed with 'wp_' by default (e.g. 'SELECT * FROM wp_options WHERE option_name = \"blogname\"')"),
}, async ({ sql }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_db_query(sql), null, 2) }],
}));

server.tool("wp_db_export", "Export database to SQL file", {
  filename: z.string().optional().describe("Output filename"),
}, async ({ filename }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_db_export(filename), null, 2) }],
}));

server.tool("wp_search_replace", "Search and replace strings across all WordPress database tables. Essential for domain migrations (e.g. staging to production). Handles serialized data correctly.", {
  old_value: z.string().describe("String to search for (e.g. 'http://staging.example.com', 'old-domain.com')"),
  new_value: z.string().describe("Replacement string (e.g. 'https://example.com', 'new-domain.com')"),
  dry_run: z.boolean().optional().describe("Preview changes without applying them. Defaults to true for safety. Set to false to actually perform the replacement."),
}, async ({ old_value, new_value, dry_run }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_search_replace(old_value, new_value, dry_run), null, 2) }],
}));

// ─── Scaffold ──────────────────────────────────────────────
server.tool("wp_scaffold_theme", "Generate a child theme skeleton", {
  slug: z.string().describe("Theme slug"),
  theme_name: z.string().optional().describe("Theme display name"),
}, async ({ slug, theme_name }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_scaffold_theme(slug, theme_name), null, 2) }],
}));

server.tool("wp_scaffold_plugin", "Generate a plugin skeleton", {
  slug: z.string().describe("Plugin slug"),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_scaffold_plugin(slug), null, 2) }],
}));

server.tool("wp_scaffold_block", "Generate a Gutenberg block skeleton", {
  slug: z.string().describe("Block slug"),
  plugin: z.string().optional().describe("Plugin to add block to"),
}, async ({ slug, plugin }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_scaffold_block(slug, plugin), null, 2) }],
}));

// ─── Cache & Rewrite ───────────────────────────────────────
server.tool("wp_rewrite_flush", "Flush rewrite rules (fix permalink issues)", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_rewrite_flush(), null, 2) }],
}));

server.tool("wp_cache_flush", "Flush the WordPress object cache", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_cache_flush(), null, 2) }],
}));

// ─── Raw WP-CLI (escape hatch) ─────────────────────────────
server.tool("wp_cli_raw", "Execute any WP-CLI command directly", {
  command: z.string().describe("Full WP-CLI command (without 'wp' prefix, e.g. 'post meta get 1 _thumbnail_id')"),
}, async ({ command }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_cli_raw(command), null, 2) }],
}));

// ─── Theme Files ───────────────────────────────────────────
server.tool("wp_theme_file_list", "List all files in a WordPress theme directory. Returns file paths and sizes. Defaults to the active theme if no theme specified.", {
  theme: z.string().optional().describe("Theme slug. Defaults to the currently active theme."),
}, async ({ theme }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_file_list(theme), null, 2) }],
}));

server.tool("wp_theme_file_read", "Read the contents of a file in a WordPress theme. Use this to inspect template files, functions.php, style.css, or any theme file.", {
  filepath: z.string().describe("Path relative to theme root (e.g. 'functions.php', 'template-parts/header.php', 'assets/css/custom.css')"),
  theme: z.string().optional().describe("Theme slug. Defaults to the currently active theme."),
}, async ({ filepath, theme }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_file_read(filepath, theme), null, 2) }],
}));

server.tool("wp_theme_file_write", "Create or overwrite a file in a WordPress theme. Use this to edit templates, add new PHP files, modify CSS/JS, or create entirely new theme files. Directories are created automatically.", {
  filepath: z.string().describe("Path relative to theme root (e.g. 'functions.php', 'template-parts/hero.php', 'assets/js/custom.js')"),
  content: z.string().describe("Full file content to write. For PHP files, include the opening <?php tag."),
  theme: z.string().optional().describe("Theme slug. Defaults to the currently active theme."),
}, async ({ filepath, content, theme }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_file_write(filepath, content, theme), null, 2) }],
}));

server.tool("wp_theme_file_delete", "Delete a file from a WordPress theme. Cannot be undone.", {
  filepath: z.string().describe("Path relative to theme root to delete"),
  theme: z.string().optional().describe("Theme slug. Defaults to the currently active theme."),
}, async ({ filepath, theme }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_file_delete(filepath, theme), null, 2) }],
}));

// ─── PHP Eval ──────────────────────────────────────────────
server.tool("wp_eval", "Execute arbitrary PHP code in the WordPress environment. Has access to all WordPress functions, hooks, and the database. Use for custom queries, data manipulation, or anything not covered by other tools.", {
  code: z.string().describe("PHP code to execute (without <?php tag). Has full access to WordPress APIs. Use 'echo' to return output. Example: 'echo json_encode(wp_get_nav_menus());'"),
}, async ({ code }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_eval(code), null, 2) }],
}));

// ─── Sidebars & Widgets ────────────────────────────────────
server.tool("wp_sidebar_list", "List all registered widget areas (sidebars) in the active theme.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_sidebar_list(), null, 2) }],
}));

server.tool("wp_widget_list", "List all widgets in a specific sidebar or all sidebars.", {
  sidebar: z.string().optional().describe("Sidebar ID to list widgets for. If omitted, lists all sidebars."),
}, async ({ sidebar }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_widget_list(sidebar), null, 2) }],
}));

// ─── Taxonomy & Terms ──────────────────────────────────────
server.tool("wp_term_list", "List all terms in a taxonomy (categories, tags, or custom taxonomies). Returns term ID, name, slug, and post count.", {
  taxonomy: z.string().describe("Taxonomy name: 'category', 'post_tag', 'product_cat' (WooCommerce), or any custom taxonomy"),
}, async ({ taxonomy }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_term_list(taxonomy), null, 2) }],
}));

server.tool("wp_term_create", "Create a new term in a taxonomy (category, tag, or custom taxonomy).", {
  taxonomy: z.string().describe("Taxonomy name: 'category', 'post_tag', or custom taxonomy"),
  name: z.string().describe("Term name (e.g. 'Technology', 'Featured')"),
  slug: z.string().optional().describe("URL-friendly slug. Auto-generated from name if not provided."),
}, async ({ taxonomy, name, slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_term_create(taxonomy, name, slug), null, 2) }],
}));

// ─── Post Meta ─────────────────────────────────────────────
server.tool("wp_post_meta_get", "Get a specific meta value for a post. Used for custom fields, ACF fields, WooCommerce product data, etc.", {
  post_id: z.number().describe("Post ID"),
  key: z.string().describe("Meta key (e.g. '_thumbnail_id', '_price', 'custom_field_name')"),
}, async ({ post_id, key }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_meta_get(post_id, key), null, 2) }],
}));

server.tool("wp_post_meta_update", "Set or update a meta value for a post. Used for custom fields, featured images, WooCommerce data, etc.", {
  post_id: z.number().describe("Post ID"),
  key: z.string().describe("Meta key to set"),
  value: z.string().describe("Meta value to store"),
}, async ({ post_id, key, value }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_meta_update(post_id, key, value), null, 2) }],
}));

server.tool("wp_post_meta_list", "List all meta key-value pairs for a post. Shows custom fields, ACF data, WooCommerce product meta, SEO meta, etc.", {
  post_id: z.number().describe("Post ID to list meta for"),
}, async ({ post_id }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_meta_list(post_id), null, 2) }],
}));

// ─── Site Info ─────────────────────────────────────────────
server.tool("wp_site_info", "Get a comprehensive overview of the WordPress installation including version, site URL, site name, active theme, and active plugin count. Great starting point for understanding a site.", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_site_info(), null, 2) }],
}));

// ─── Start server ──────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("wp-cli-mcp server started");
}

main().catch(console.error);
