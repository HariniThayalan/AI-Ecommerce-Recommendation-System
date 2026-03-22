import reflex as rx
from shop_smart.components.navbar import navbar
from shop_smart.components.footer import footer
from shop_smart.components.product_card import product_card
from shop_smart.state.app_state import AppState
from shop_smart.style import (
    PRIMARY, SECONDARY, SUCCESS, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_DARK, BG_CARD, BG_SURFACE, GRADIENT_PRIMARY,
)

# Static thumbnail seeds — plain Python list safe to use with rx.foreach
THUMB_SEEDS = [
    {"url": "https://picsum.photos/seed/thumb0/150/150"},
    {"url": "https://picsum.photos/seed/thumb1/150/150"},
    {"url": "https://picsum.photos/seed/thumb2/150/150"},
    {"url": "https://picsum.photos/seed/thumb3/150/150"},
]

# Static product data for the detail page (would come from URL param in dynamic routing)
PRODUCT = {
    "id": "prod_001",
    "name": "Sony WH-1000XM5 Headphones",
    "brand": "Sony",
    "category": "Electronics",
    "description": (
        "Industry-leading noise canceling with 360° Reality Audio. "
        "30-hour battery life, Integrated V1 processor for crystal clarity, "
        "multipoint Bluetooth connection, and foldable design for travel."
    ),
    "price": 29990,
    "discount_percent": 15,
    "final_price": 25491,
    "price_str": "₹29,990",
    "final_price_str": "₹25,491",
    "avg_rating": 4.7,
    "rating_count": 2841,
    "image_url": "https://picsum.photos/seed/prod001/600/600",
    "image_url_2": "https://picsum.photos/seed/prod001b/600/600",
    "tags": ["wireless", "noise-canceling", "premium", "audio"],
}

SPECS = [
    ("Driver Unit", "40mm, dome type"),
    ("Frequency Response", "4 Hz–40,000 Hz"),
    ("Battery Life", "Up to 30 hours"),
    ("Bluetooth Version", "5.2"),
    ("Weight", "250g"),
    ("Color Options", "Black, Platinum Silver"),
]

REVIEWS = [
    {"user": "Arav K.", "rating": "5", "comment": "Best headphones I've ever owned. The ANC is truly industry-leading."},
    {"user": "Priya S.", "rating": "5", "comment": "Sound quality is incredible. Worth every rupee!"},
    {"user": "Rohit M.", "rating": "4", "comment": "Excellent sound, slightly heavy for long sessions."},
]


def spec_row(label: str, value: str) -> rx.Component:
    return rx.hstack(
        rx.text(label, color=TEXT_SECONDARY, font_size="14px", width="160px", flex_shrink="0"),
        rx.text(value, color=TEXT_PRIMARY, font_size="14px", font_weight="500"),
        width="100%",
        padding_y="2",
        border_bottom=f"1px solid {BORDER_COLOR}",
    )


def review_card(review: dict) -> rx.Component:
    return rx.vstack(
        rx.hstack(
            rx.box(
                rx.text(review["user"][0], color="white", font_weight="700", font_size="13px"),
                width="36px", height="36px", border_radius="50%",
                background=GRADIENT_PRIMARY,
                display="flex", align_items="center", justify_content="center",
            ),
            rx.vstack(
                rx.text(review["user"], font_weight="600", color=TEXT_PRIMARY, font_size="14px"),
                rx.hstack(
                    rx.foreach(
                        [1, 2, 3, 4, 5],
                        lambda i: rx.text("★", color="#FFB800", font_size="12px"),
                    ),
                    spacing="0",
                ),
                align_items="start", spacing="0",
            ),
            align="center", spacing="3",
        ),
        rx.text(review["comment"], color=TEXT_SECONDARY, font_size="14px"),
        padding="16px",
        background=BG_SURFACE,
        border_radius="12px",
        border=f"1px solid {BORDER_COLOR}",
        align_items="start",
        width="100%",
        spacing="3",
    )


def product_detail() -> rx.Component:
    return rx.box(
        navbar(),
        rx.container(
            rx.vstack(
                # ── Main detail flex: image + info ─────────────────────────
                rx.flex(
                    # Left: image + thumbnails
                    rx.vstack(
                        rx.image(
                            src=PRODUCT["image_url"],
                            width="100%",
                            border_radius="20px",
                            border=f"1px solid {BORDER_COLOR}",
                            box_shadow="0 20px 60px rgba(0,0,0,0.4)",
                        ),
                        rx.hstack(
                            rx.foreach(
                                THUMB_SEEDS,
                                lambda t: rx.image(
                                    src=t["url"],   # use dict field — no string concat
                                    width="80px",
                                    height="80px",
                                    object_fit="cover",
                                    border_radius="10px",
                                    cursor="pointer",
                                    border=f"2px solid {BORDER_COLOR}",
                                    _hover={"border_color": PRIMARY},
                                ),
                            ),
                            spacing="3",
                            padding_top="4",
                        ),
                        width=rx.breakpoints(initial="100%", md="45%"),
                        align_items="start",
                    ),
                    # Right: product info
                    rx.vstack(
                        # Brand + category
                        rx.hstack(
                            rx.badge(PRODUCT["brand"], color_scheme="violet", variant="soft"),
                            rx.badge(PRODUCT["category"], color_scheme="gray", variant="soft"),
                            spacing="2",
                        ),
                        rx.heading(PRODUCT["name"], size="8", color=TEXT_PRIMARY, line_height="1.2"),
                        # Rating
                        rx.hstack(
                            rx.hstack(
                                rx.foreach(
                                    [1, 2, 3, 4, 5],
                                    lambda _: rx.text("★", color="#FFB800", font_size="18px"),
                                ),
                                spacing="0",
                            ),
                            rx.text(
                                str(PRODUCT["avg_rating"]),
                                color="#FFB800", font_weight="700", font_size="16px",
                            ),
                            rx.text(
                                f"({PRODUCT['rating_count']:,} reviews)",
                                color=TEXT_SECONDARY, font_size="14px",
                            ),
                            spacing="2", align="center",
                        ),
                        rx.divider(color=BORDER_COLOR),
                        # Price — using pre-formatted strings (safe, no reactive var concat)
                        rx.vstack(
                            rx.text(
                                PRODUCT["final_price_str"],
                                font_size="2.2em", font_weight="800", color=PRIMARY,
                            ),
                            rx.hstack(
                                rx.text(
                                    PRODUCT["price_str"],
                                    text_decoration="line-through",
                                    color=TEXT_SECONDARY, font_size="1.1em",
                                ),
                                rx.badge(f"{PRODUCT['discount_percent']}% OFF",
                                         color_scheme="red", variant="solid", size="2"),
                                spacing="3",
                            ),
                            rx.text("Inclusive of all taxes", color=TEXT_SECONDARY, font_size="12px"),
                            align_items="start", spacing="2",
                        ),
                        # Description
                        rx.text(
                            PRODUCT["description"],
                            color=TEXT_SECONDARY,
                            line_height="1.8",
                            font_size="14px",
                        ),
                        # Tags
                        rx.hstack(
                            *[
                                rx.badge(tag, color_scheme="violet", variant="outline", size="1")
                                for tag in PRODUCT["tags"]
                            ],
                            flex_wrap="wrap",
                            spacing="2",
                        ),
                        # Actions
                        rx.hstack(
                            rx.button(
                                rx.icon("shopping-cart", size=18),
                                "Add to Cart",
                                on_click=AppState.add_to_cart(PRODUCT),
                                background=GRADIENT_PRIMARY,
                                color="white",
                                size="3",
                                border_radius="12px",
                                flex="1",
                                font_weight="600",
                            ),
                            rx.button(
                                rx.icon("zap", size=18),
                                "Buy Now",
                                on_click=rx.redirect("/checkout"),
                                background=f"linear-gradient(135deg, {SECONDARY}, #E03060)",
                                color="white",
                                size="3",
                                border_radius="12px",
                                flex="1",
                                font_weight="600",
                            ),
                            width="100%",
                            spacing="4",
                        ),
                        # Delivery info
                        rx.hstack(
                            rx.icon("truck", color=SUCCESS, size=16),
                            rx.text("Free delivery · Arrives in 2-3 days",
                                    color=SUCCESS, font_size="13px", font_weight="500"),
                            spacing="2",
                        ),
                        width=rx.breakpoints(initial="100%", md="50%"),
                        align_items="start",
                        padding_left=rx.breakpoints(initial="0", md="10"),
                        padding_top=rx.breakpoints(initial="8", md="0"),
                        spacing="4",
                    ),
                    width="100%",
                    direction=rx.breakpoints(initial="column", md="row"),
                    padding_y="10",
                    gap="8",
                ),
                # ── Tabs: Specs / Reviews ──────────────────────────────────
                rx.tabs.root(
                    rx.tabs.list(
                        rx.tabs.trigger("📋 Overview", value="overview"),
                        rx.tabs.trigger("⚙️ Specs", value="specs"),
                        rx.tabs.trigger("⭐ Reviews", value="reviews"),
                    ),
                    rx.tabs.content(
                        rx.text(
                            PRODUCT["description"],
                            color=TEXT_SECONDARY, line_height="1.9", font_size="15px", padding="16px",
                        ),
                        value="overview",
                    ),
                    rx.tabs.content(
                        rx.vstack(
                            *[spec_row(label, val) for label, val in SPECS],
                            width="100%", spacing="0",
                            padding="16px",
                        ),
                        value="specs",
                    ),
                    rx.tabs.content(
                        rx.vstack(
                            *[review_card(r) for r in REVIEWS],
                            width="100%", spacing="4",
                            padding="16px",
                        ),
                        value="reviews",
                    ),
                    default_value="overview",
                    width="100%",
                    margin_top="8",
                ),
                # ── AI Similar Products ────────────────────────────────────
                rx.vstack(
                    rx.divider(color=BORDER_COLOR, margin_y="8"),
                    rx.hstack(
                        rx.icon("cpu", color=PRIMARY, size=24),
                        rx.text(
                            "AI Recommended — Similar Products",
                            font_size="22px", font_weight="700", color=TEXT_PRIMARY,
                        ),
                        spacing="3", align="center",
                    ),
                    rx.grid(
                        rx.foreach(AppState.recommended_products, lambda p: product_card(p)),
                        columns=rx.breakpoints(initial="1", sm="2", md="4"),
                        spacing="5",
                        width="100%",
                    ),
                    width="100%",
                    align_items="start",
                    spacing="4",
                ),
                max_width="1200px",
                width="100%",
                padding_y="10",
                spacing="4",
            ),
        ),
        footer(),
        background=BG_DARK,
        min_height="100vh",
        on_mount=AppState.fetch_products,
    )
