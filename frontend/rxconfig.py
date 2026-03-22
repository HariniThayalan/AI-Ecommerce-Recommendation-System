import reflex as rx
from reflex.plugins.sitemap import SitemapPlugin

config = rx.Config(
    app_name="shop_smart",
    disable_plugins=[SitemapPlugin],
)
