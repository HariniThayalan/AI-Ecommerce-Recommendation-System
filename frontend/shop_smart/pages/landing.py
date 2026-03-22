import reflex as rx
from shop_smart.components.navbar import navbar
from shop_smart.components.footer import footer
from shop_smart.style import (
    PRIMARY, SECONDARY, TEXT_PRIMARY, TEXT_SECONDARY,
    BORDER_COLOR, BG_DARK, BG_CARD, BG_SURFACE, GRADIENT_PRIMARY,
)

# ── Static data — plain Python dicts (NOT state vars, safe for direct iteration)
FEATURES = [
    ("cpu",          "AI-Powered",   "Neural recommendations tailored to you"),
    ("zap",          "Instant",      "Real-time product discovery engine"),
    ("shield-check", "Secure",       "Enterprise-grade encrypted checkout"),
    ("truck",        "Fast Delivery","Next-day delivery to your doorstep"),
]

CATEGORIES = [
    ("laptop",    "Electronics",     "#6C63FF"),
    ("shirt",     "Fashion",         "#FF6584"),
    ("home",      "Home & Kitchen",  "#43D9AD"),
    ("dumbbell",  "Sports",          "#FFA34D"),
    ("book-open", "Books",           "#A78BFA"),
    ("sparkles",  "Beauty",          "#F472B6"),
]


def hero() -> rx.Component:
    return rx.center(
        rx.vstack(
            rx.box(
                rx.text("🛒", font_size="48px"),
                width="90px", height="90px", border_radius="50%",
                background="rgba(108,99,255,0.15)",
                display="flex", align_items="center", justify_content="center",
                border=f"2px solid {BORDER_COLOR}",
            ),
            rx.heading(
                "Shop Smarter with AI",
                size="9", font_weight="900", color=TEXT_PRIMARY, text_align="center",
            ),
            rx.text(
                "Personalized recommendations powered by Content-Based, "
                "Collaborative, and Hybrid AI engines.",
                color=TEXT_SECONDARY, font_size="1.1em",
                text_align="center", max_width="580px",
            ),
            rx.hstack(
                rx.link(
                    rx.button(
                        rx.icon("shopping-bag", size=18), "Shop Now",
                        background=GRADIENT_PRIMARY, color="white",
                        size="4", border_radius="14px", font_weight="700",
                        _hover={"opacity": "0.88", "transform": "scale(1.04)"},
                    ),
                    href="/products",
                ),
                rx.link(
                    rx.button(
                        rx.icon("cpu", size=18), "Try AI Demo",
                        variant="outline", color_scheme="violet",
                        size="4", border_radius="14px", font_weight="600",
                    ),
                    href="/products",
                ),
                spacing="4", flex_wrap="wrap", justify="center",
            ),
            align="center", spacing="6", padding_y="20",
        ),
        width="100%",
        min_height="90vh",
        background=f"radial-gradient(ellipse at 50% 50%, {BG_SURFACE} 0%, {BG_DARK} 60%)",
    )


def feature_card(icon: str, title: str, desc: str) -> rx.Component:
    """Static feature card — icon is a plain Python string, never a reactive var."""
    return rx.vstack(
        rx.box(
            rx.icon(icon, color=PRIMARY, size=28),   # icon is a static str literal ✅
            width="60px", height="60px", border_radius="50%",
            background="rgba(108,99,255,0.12)",
            display="flex", align_items="center", justify_content="center",
        ),
        rx.text(title, font_weight="700", color=TEXT_PRIMARY, font_size="16px"),
        rx.text(desc, color=TEXT_SECONDARY, font_size="13px", text_align="center"),
        align="center", spacing="3",
        padding="24px",
        background="rgba(26,26,46,0.6)",
        border=f"1px solid {BORDER_COLOR}",
        border_radius="16px",
        _hover={"border_color": PRIMARY, "transform": "translateY(-4px)"},
        transition="all 0.3s ease",
        width="100%",
    )


def features_row() -> rx.Component:
    return rx.center(
        rx.vstack(
            rx.text("Why ShopSmart AI?", font_size="28px", font_weight="800",
                    color=TEXT_PRIMARY, text_align="center"),
            rx.grid(
                # Unroll loop in Python — icon names are static strings ✅
                *[feature_card(icon, title, desc) for icon, title, desc in FEATURES],
                columns=rx.breakpoints(initial="1", sm="2", md="4"),
                spacing="5", width="100%",
            ),
            max_width="1200px", width="100%", spacing="8", padding_y="16",
        ),
        width="100%", padding_x="24px",
    )


def category_card(icon: str, name: str, color: str) -> rx.Component:
    """Static category card — icon is a plain Python string, never a reactive var."""
    return rx.link(
        rx.vstack(
            rx.box(
                rx.icon(icon, color=color, size=32),   # icon is a static str literal ✅
                width="64px", height="64px", border_radius="50%",
                background="rgba(108,99,255,0.1)",
                display="flex", align_items="center", justify_content="center",
            ),
            rx.text(name, font_weight="600", color=TEXT_PRIMARY, font_size="14px"),
            align="center", spacing="3",
            padding="24px 16px",
            background="rgba(26,26,46,0.7)",
            border=f"1px solid {BORDER_COLOR}",
            border_radius="16px",
            cursor="pointer", width="100%",
            _hover={
                "transform": "translateY(-6px)",
                "box_shadow": "0 12px 30px rgba(0,0,0,0.3)",
            },
            transition="all 0.3s ease",
        ),
        href="/products",
    )


def categories_grid() -> rx.Component:
    return rx.center(
        rx.vstack(
            rx.text("Explore Categories", font_size="28px", font_weight="800",
                    color=TEXT_PRIMARY, text_align="center"),
            rx.grid(
                # Unroll loop in Python — icon names are static strings ✅
                *[category_card(icon, name, color) for icon, name, color in CATEGORIES],
                columns=rx.breakpoints(initial="2", sm="3", md="6"),
                spacing="4", width="100%",
            ),
            max_width="1200px", width="100%", spacing="8", padding_y="16",
        ),
        width="100%", padding_x="24px",
    )


def landing() -> rx.Component:
    return rx.box(
        navbar(),
        hero(),
        features_row(),
        categories_grid(),
        footer(),
        background=BG_DARK,
        min_height="100vh",
    )
