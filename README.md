# wp-cli-mcp

<p align="center">
  <img src="https://img.shields.io/badge/WordPress-21759B?style=for-the-badge&logo=wordpress&logoColor=white" />
  <img src="https://img.shields.io/badge/WP--CLI-0073AA?style=for-the-badge&logo=windowsterminal&logoColor=white" />
  <img src="https://img.shields.io/badge/MCP-000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Claude_Code-D97757?style=for-the-badge&logo=anthropic&logoColor=white" />
</p>

<p align="center">
  <b>MCP server that gives AI tools full WordPress management via WP-CLI.</b><br/>
  Themes, plugins, posts, menus, users, database, scaffolding — 30+ tools.
</p>

---

## What can Claude do with this?

```
"Install WooCommerce and activate it"
"Create a new page called About Us with this content..."
"List all plugins and deactivate the ones I'm not using"
"Scaffold a new child theme called my-theme"
"Create a navigation menu with Home, About, Contact links"
"Search and replace old domain with new domain in database"
"Export the database before I make changes"
"Generate a custom Gutenberg block for testimonials"
```

All powered by WP-CLI under the hood. Works locally or over SSH to remote servers.

## Tools (30+)

| Category | Tools |
|----------|-------|
| **Core** | `wp_core_version`, `wp_core_check_update` |
| **Plugins** | `wp_plugin_list`, `wp_plugin_install`, `wp_plugin_activate`, `wp_plugin_deactivate`, `wp_plugin_delete`, `wp_plugin_search` |
| **Themes** | `wp_theme_list`, `wp_theme_install`, `wp_theme_activate`, `wp_theme_delete` |
| **Posts** | `wp_post_list`, `wp_post_get`, `wp_post_create`, `wp_post_update`, `wp_post_delete` |
| **Users** | `wp_user_list`, `wp_user_create` |
| **Options** | `wp_option_get`, `wp_option_update` |
| **Menus** | `wp_menu_list`, `wp_menu_create`, `wp_menu_item_add`, `wp_menu_location_assign` |
| **Media** | `wp_media_import` |
| **Database** | `wp_db_query`, `wp_db_export`, `wp_search_replace` |
| **Scaffold** | `wp_scaffold_theme`, `wp_scaffold_plugin`, `wp_scaffold_block` |
| **Cache** | `wp_rewrite_flush`, `wp_cache_flush` |
| **Raw** | `wp_cli_raw` — run any WP-CLI command |

## Requirements

- [WP-CLI](https://wp-cli.org/) installed and in PATH
- WordPress installation (local or accessible via SSH)
- Node.js 18+

## Setup

### Install

```bash
npm install -g wp-cli-mcp
```

### Configure with Claude Code

Add to your Claude Code MCP settings (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "wp-cli-mcp",
      "env": {
        "WP_PATH": "/path/to/your/wordpress"
      }
    }
  }
}
```

### Remote server via SSH

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "wp-cli-mcp",
      "env": {
        "WP_SSH": "user@yourserver.com:/var/www/html"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `WP_PATH` | Local WordPress path | `/var/www/html` |
| `WP_SSH` | SSH connection string | `user@host:/path/to/wp` |
| `WP_URL` | Site URL (multisite) | `https://example.com` |

## Examples

### Theme Development Workflow

```
You: "Scaffold a child theme based on twentytwentyfour"
Claude: Uses wp_scaffold_theme → creates child theme files

You: "Install and activate it"
Claude: Uses wp_theme_activate → theme is live

You: "Create the homepage with a hero section and 3 feature cards"
Claude: Uses wp_post_create → creates page with HTML content
```

### Plugin Management

```
You: "What plugins do I have installed?"
Claude: Uses wp_plugin_list → shows all plugins with status

You: "Install Contact Form 7 and WooCommerce"
Claude: Uses wp_plugin_install twice → both installed and activated
```

### Database Operations

```
You: "I'm migrating from staging.example.com to example.com"
Claude: Uses wp_db_export → backup first
       Uses wp_search_replace (dry_run) → preview changes
       Uses wp_search_replace → apply changes
       Uses wp_cache_flush → clear cache
```

## Pairs well with

- **[Elementor MCP](https://github.com/msrbuilds/elementor-mcp)** — 97 tools for Elementor page building
- **[WordPress MCP](https://github.com/Automattic/wordpress-mcp)** — Official Automattic REST API tools
- **[wordpress-claude-stack](https://github.com/mvtandas/wordpress-claude-stack)** — CLAUDE.md + Cursor rules for WordPress

Use all three together for complete AI-powered WordPress development.

## License

MIT — [Mustafa Vatandas](https://github.com/mvtandas)
