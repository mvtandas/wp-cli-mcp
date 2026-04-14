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
server.tool("wp_core_version", "Get WordPress version", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_core_version(), null, 2) }],
}));

server.tool("wp_core_check_update", "Check for WordPress core updates", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_core_check_update(), null, 2) }],
}));

// ─── Plugins ───────────────────────────────────────────────
server.tool("wp_plugin_list", "List all installed plugins with status", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_list(), null, 2) }],
}));

server.tool("wp_plugin_install", "Install a plugin from wordpress.org", {
  slug: z.string().describe("Plugin slug (e.g. 'woocommerce', 'advanced-custom-fields')"),
  activate: z.boolean().optional().describe("Activate after install"),
}, async ({ slug, activate }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_install(slug, activate), null, 2) }],
}));

server.tool("wp_plugin_activate", "Activate an installed plugin", {
  slug: z.string().describe("Plugin slug"),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_activate(slug), null, 2) }],
}));

server.tool("wp_plugin_deactivate", "Deactivate a plugin", {
  slug: z.string().describe("Plugin slug"),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_deactivate(slug), null, 2) }],
}));

server.tool("wp_plugin_delete", "Delete a plugin", {
  slug: z.string().describe("Plugin slug"),
}, async ({ slug }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_delete(slug), null, 2) }],
}));

server.tool("wp_plugin_search", "Search wordpress.org plugin directory", {
  term: z.string().describe("Search term"),
}, async ({ term }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_plugin_search(term), null, 2) }],
}));

// ─── Themes ────────────────────────────────────────────────
server.tool("wp_theme_list", "List all installed themes", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_theme_list(), null, 2) }],
}));

server.tool("wp_theme_install", "Install a theme from wordpress.org", {
  slug: z.string().describe("Theme slug"),
  activate: z.boolean().optional().describe("Activate after install"),
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
server.tool("wp_post_list", "List posts of any type", {
  post_type: z.string().optional().describe("Post type (post, page, product, etc.)"),
  count: z.number().optional().describe("Number of posts to return"),
}, async ({ post_type, count }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_list(post_type, count), null, 2) }],
}));

server.tool("wp_post_get", "Get a single post by ID", {
  id: z.number().describe("Post ID"),
}, async ({ id }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_post_get(id), null, 2) }],
}));

server.tool("wp_post_create", "Create a new post or page", {
  title: z.string().describe("Post title"),
  content: z.string().describe("Post content (HTML)"),
  post_type: z.string().optional().describe("Post type (default: post)"),
  status: z.string().optional().describe("Post status: draft, publish, pending, private"),
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
server.tool("wp_db_query", "Execute a raw SQL query (read-only recommended)", {
  sql: z.string().describe("SQL query to execute"),
}, async ({ sql }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_db_query(sql), null, 2) }],
}));

server.tool("wp_db_export", "Export database to SQL file", {
  filename: z.string().optional().describe("Output filename"),
}, async ({ filename }) => ({
  content: [{ type: "text", text: JSON.stringify(await tools.wp_db_export(filename), null, 2) }],
}));

server.tool("wp_search_replace", "Search and replace in database", {
  old_value: z.string().describe("String to search for"),
  new_value: z.string().describe("Replacement string"),
  dry_run: z.boolean().optional().describe("Preview changes without applying (default: true)"),
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

// ─── Start server ──────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("wp-cli-mcp server started");
}

main().catch(console.error);
